#!/bin/bash
# ==============================================================================
# 🚀 AWS EC2 Production User Data Bootstrap Script
# ==============================================================================
# Automatically executes as root when an EC2 instance launches in Auto Scaling.
# - Installs Docker, Docker Compose, AWS CLI, and jq
# - Dynamically fetches RDS credentials from AWS Secrets Manager
# - Writes production environment variables (.env)
# - Deploys multi-container application via Docker Compose
# ==============================================================================

# Enable strict error handling and pipe logging
set -e
exec > >(tee -a /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "=================================================================="
echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Starting EC2 Production Bootstrap"
echo "=================================================================="

# 1. Update package lists and install essential system tools
echo "📦 Updating OS packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  jq \
  awscli \
  docker.io \
  docker-compose

# 2. Configure Docker daemon & install modern Docker Compose v2 plugin
echo "🐳 Configuring Docker service..."
systemctl enable --now docker
usermod -aG docker ubuntu

# Install standalone Docker Compose v2 CLI plugin for consistency
mkdir -p /usr/local/lib/docker/cli-plugins
curl -sSL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
ln -sf /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

# 3. Create application workspace
APP_DIR="/home/ubuntu/app"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# 4. Fetch AWS Region dynamically using IMDSv2 (EC2 Instance Metadata Service)
echo "🌍 Resolving AWS Region..."
IMDS_TOKEN=$(curl -s -S -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)
if [ -n "$IMDS_TOKEN" ]; then
  AWS_REGION=$(curl -s -S -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" http://169.254.169.254/latest/meta-data/placement/region || echo "us-east-1")
else
  AWS_REGION="us-east-1"
fi
echo "📍 AWS Region detected: $AWS_REGION"

# 5. Retrieve Database Credentials from AWS Secrets Manager
# ==============================================================================
# 💡 WHAT TO CONFIGURE HERE:
# ------------------------------------------------------------------------------
# • OPTION A (RECOMMENDED - 100% AUTOMATED):
#   If you created the secret in Step 4 and attached 'production-ec2-secrets-role',
#   DO NOT CHANGE ANYTHING! The script automatically fetches DB_HOST and DB_PASSWORD.
#
# • OPTION B (MANUAL OVERRIDE - NO SECRETS MANAGER):
#   If you do NOT want to use Secrets Manager, simply edit DB_HOST and DB_PASSWORD below:
# ==============================================================================
SECRET_NAME="production/database/credentials"
echo "🔐 Fetching database secret [$SECRET_NAME] from AWS Secrets Manager..."

# Manual fallback values (Replace these if NOT using AWS Secrets Manager):
DB_HOST="YOUR-RDS-ENDPOINT.rds.amazonaws.com"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="yoursecurepassword123"
DB_NAME="devops_db"

SECRET_PAYLOAD=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$AWS_REGION" \
  --query "SecretString" \
  --output text 2>/dev/null || echo "")

if [ -n "$SECRET_PAYLOAD" ] && [ "$SECRET_PAYLOAD" != "None" ]; then
  echo "✅ Successfully retrieved secret from AWS Secrets Manager!"
  
  # Parse JSON secret keys using jq
  EXT_HOST=$(echo "$SECRET_PAYLOAD" | jq -r '.DB_HOST // .host // empty')
  EXT_PORT=$(echo "$SECRET_PAYLOAD" | jq -r '.DB_PORT // .port // empty')
  EXT_USER=$(echo "$SECRET_PAYLOAD" | jq -r '.DB_USER // .username // empty')
  EXT_PASS=$(echo "$SECRET_PAYLOAD" | jq -r '.DB_PASSWORD // .password // empty')
  EXT_NAME=$(echo "$SECRET_PAYLOAD" | jq -r '.DB_NAME // .dbname // empty')

  [ -n "$EXT_HOST" ] && DB_HOST="$EXT_HOST"
  [ -n "$EXT_PORT" ] && DB_PORT="$EXT_PORT"
  [ -n "$EXT_USER" ] && DB_USER="$EXT_USER"
  [ -n "$EXT_PASS" ] && DB_PASSWORD="$EXT_PASS"
  [ -n "$EXT_NAME" ] && DB_NAME="$EXT_NAME"
else
  echo "⚠️ Notice: Could not read secret [$SECRET_NAME]. Ensure IAM Instance Profile is attached to this EC2 instance."
  echo "ℹ️ Using environment fallback values."
fi

# 6. Generate the production .env configuration file
echo "📝 Writing application .env configuration..."
cat <<EOF > "$APP_DIR/.env"
DOCKER_USERNAME=ravi0706
IMAGE_TAG=latest
PORT=5000
NODE_ENV=production
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
EOF

# 7. Create Docker Compose definition
echo "📄 Writing docker-compose.yml..."
cat << 'EOF' > "$APP_DIR/docker-compose.yml"
services:
  server:
    image: ${DOCKER_USERNAME:-ravi0706}/devops-server:${IMAGE_TAG:-latest}
    container_name: aws_backend
    restart: always
    environment:
      PORT: 5000
      NODE_ENV: production
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT:-5432}
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME:-devops_db}
    ports:
      - "5000:5000"
    networks:
      - app_network

  client:
    image: ${DOCKER_USERNAME:-ravi0706}/devops-client:${IMAGE_TAG:-latest}
    container_name: aws_frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - server
    networks:
      - app_network

networks:
  app_network:
    driver: bridge
EOF

# Ensure proper permissions for ubuntu user
chown -R ubuntu:ubuntu "$APP_DIR"

# 8. Pull container images and launch application
echo "📥 Pulling Docker images from Docker Hub..."
docker compose pull || docker-compose pull

echo "🚀 Starting containers with Docker Compose..."
docker compose up -d || docker-compose up -d

# 9. Verify local container health check
echo "🩺 Verifying local health check on port 80..."
sleep 10
for i in {1..6}; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || true)
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "🎉 Local health check PASSED (HTTP 200)!"
    break
  fi
  echo "⏳ Waiting for backend service to report healthy (attempt $i/6, status: $HTTP_STATUS)..."
  sleep 5
done

echo "=================================================================="
echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] EC2 Bootstrap Completed Successfully!"
echo "=================================================================="
