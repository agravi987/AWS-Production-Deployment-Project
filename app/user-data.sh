#!/bin/bash
# ==============================================================================
# AWS EC2 User Data Bootstrap Script
# Automatically executes as root when an EC2 instance launches in Auto Scaling
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Redirect all output to a log file for easy debugging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=========================================="
echo "🚀 Starting EC2 Auto Scaling User Data Script"
echo "=========================================="

# 1. Update OS packages
apt-get update -y
apt-get upgrade -y

# 2. Install Docker and Docker Compose plugin
apt-get install -y docker.io docker-compose-v2 curl

# 3. Start and enable Docker daemon
systemctl enable --now docker
usermod -aG docker ubuntu

# 4. Create application directory
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# 5. Configure Environment Variables for Amazon RDS
# NOTE: In production, replace these with your actual Amazon RDS Endpoint and Password!
cat << 'EOF' > .env
DOCKER_USERNAME=agravi987
IMAGE_TAG=latest
DB_HOST=YOUR-RDS-ENDPOINT.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yoursecurepassword123
DB_NAME=devops_db
EOF

# 6. Create the Docker Compose configuration file
cat << 'EOF' > docker-compose.yml
services:
  server:
    image: ${DOCKER_USERNAME:-agravi987}/devops-server:${IMAGE_TAG:-latest}
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
    image: ${DOCKER_USERNAME:-agravi987}/devops-client:${IMAGE_TAG:-latest}
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

# Set ownership to ubuntu user
chown -R ubuntu:ubuntu /home/ubuntu/app

# 7. Pull images and launch application containers
echo "📦 Pulling container images from Docker Hub..."
docker compose pull

echo "🔄 Starting application containers..."
docker compose up -d

# 8. Wait for containers and verify local health check
sleep 15
curl -s http://localhost/api/health || echo "Health check initial ping finished"

echo "=========================================="
echo "✅ EC2 Instance Bootstrap Finished Successfully!"
echo "=========================================="
