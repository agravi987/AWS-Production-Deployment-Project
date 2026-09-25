# 📈 Step 6: EC2 Launch Templates & Auto Scaling Groups (ASG)

🎯 **Mission**: Create an **EC2 Launch Template** with automated Secrets Manager bootstrap, and launch an **Auto Scaling Group** that runs your full-stack Docker containers across 2 Availability Zones.

---

## 💡 The Concept: Auto Scaling & Self-Healing

1. **Auto-Scaling**: If traffic surges, AWS adds more instances automatically.
2. **Self-Healing**: If Server 1 dies or the container crashes, the ASG terminates the broken instance and launches a brand new healthy replacement within 2 minutes!
3. **No IP Management**: You never manage or type EC2 IP addresses. The ASG registers instances dynamically into your Application Load Balancer!

---

## 📋 What You Need to Know Before Starting

> [!TIP]
> - **EC2 IP Addresses**: **NEVER hardcode any IP address.** Auto Scaling assigns private IPs dynamically.
> - **Docker Images**: Configured to use Docker Hub user **`ravi0706`** (`ravi0706/devops-client` and `ravi0706/devops-server`).
> - **Zero-Touch Script**: Because you configured **AWS Secrets Manager** in Step 4 and attach the IAM Role here, **you do NOT need to edit the script below!** It fetches your database endpoint and password automatically!

---

## 🖱️ Step-by-Step AWS Console Recipe

### Part 1: Create Launch Template
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/) $\rightarrow$ click **Launch Templates** $\rightarrow$ Click **Create launch template**.
2. **Details**:
   - Name: `production-lt`
   - Description: `v1 - Production App with Secrets Manager and Docker`
   - Check ✅ **Auto Scaling guidance**.
3. **OS Image**:
   - Select **Ubuntu** $\rightarrow$ choose **Ubuntu Server 22.04 LTS (HVM)** (Free Tier).
4. **Instance type**: `t2.micro` (or `t3.micro`).
5. **Key pair**: Select your key pair or choose *Proceed without a key pair*.
6. **Network settings**:
   - Subnet: *Don't include in launch template*.
   - Security groups: Select `production-ec2-app-sg` 🛡️.
7. **Advanced details** (Expand at the bottom):
   - **IAM instance profile**: Select `production-ec2-secrets-role` 🔑.
   - Scroll down to the **User data** box and paste this exact script:

```bash
#!/bin/bash
set -e
exec > >(tee -a /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "=================================================================="
echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Starting EC2 Production Bootstrap"
echo "=================================================================="

# 1. Update OS packages and install tools
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release jq awscli docker.io docker-compose

# 2. Enable Docker and install Docker Compose v2 plugin
systemctl enable --now docker
usermod -aG docker ubuntu
mkdir -p /usr/local/lib/docker/cli-plugins
curl -sSL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
ln -sf /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

# 3. Create app workspace
APP_DIR="/home/ubuntu/app"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# 4. Resolve AWS Region dynamically
IMDS_TOKEN=$(curl -s -S -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)
if [ -n "$IMDS_TOKEN" ]; then
  AWS_REGION=$(curl -s -S -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" http://169.254.169.254/latest/meta-data/placement/region || echo "us-east-1")
else
  AWS_REGION="us-east-1"
fi

# 5. Retrieve Database Credentials from AWS Secrets Manager
SECRET_NAME="production/database/credentials"
echo "🔐 Fetching database secret [$SECRET_NAME] from AWS Secrets Manager..."

DB_HOST="localhost"
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
fi

# 6. Generate production .env configuration
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

# 7. Write docker-compose.yml
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

chown -R ubuntu:ubuntu "$APP_DIR"

# 8. Pull Docker images and start application
docker compose pull || docker-compose pull
docker compose up -d || docker-compose up -d

# 9. Verify local health check
sleep 10
curl -s http://localhost/api/health || true
echo "✅ EC2 Bootstrap Completed Successfully!"
```
8. Click **Create launch template**! 🎉

---

### Part 2: Create Auto Scaling Group (ASG)
1. In the EC2 left menu, click **Auto Scaling Groups** $\rightarrow$ Click **Create Auto Scaling group**.
2. **Name**: `production-asg` | Launch template: `production-lt` $\rightarrow$ Click **Next**.
3. **Network**:
   - VPC: `production-vpc`.
   - Subnets: Check both application subnets (`private-app-subnet-1a` and `private-app-subnet-1b` or `public-subnet-1a` and `1b`).
   - Click **Next**.
4. **Load balancing**:
   - Select **Attach to an existing load balancer**.
   - Select **Choose from your load balancer target groups** $\rightarrow$ choose `production-tg`!
   - Health checks: Check ✅ **Turn on Elastic Load Balancing health checks**.
   - Grace period: `300` seconds.
   - Click **Next**.
5. **Group size**:
   - Desired: `2` | Minimum: `2` | Maximum: `4`.
   - Click **Next** through remaining steps $\rightarrow$ Click **Create Auto Scaling group**! 🚀

---

## 🔍 Checkpoints: How to Verify & See It Running

1. **Check EC2 Instances**:
   - Go to **EC2** $\rightarrow$ **Instances**. Two instances named `production-asg` will show **Running** 🟢.
2. **Verify Inside EC2**:
   - Connect via EC2 Instance Connect:
     ```bash
     docker ps
     curl http://localhost/api/health
     ```
   - *Expected output*: `{"status":"UP","database":"connected"}` 🎉
3. **Check Target Group**:
   - Go to **Target Groups** $\rightarrow$ `production-tg` $\rightarrow$ Targets tab: Both instances show **Healthy** 🟢!
4. **Open in Browser**:
   - Open your ALB DNS Name in your web browser:  
     `http://production-alb-123456789.us-east-1.elb.amazonaws.com`  
     **Your live React frontend and backend connected to Amazon RDS will load!** 🥳

---

## 🧪 The "Chaos Monkey" Self-Healing Test!

1. Go to **EC2** $\rightarrow$ **Instances** $\rightarrow$ select one running instance $\rightarrow$ Click **Terminate instance** 💥.
2. Go to **Auto Scaling Groups** $\rightarrow$ `production-asg` $\rightarrow$ **Activity** tab:
   - Within 2 minutes, ASG automatically detects the terminated instance and provisions a fresh replacement to maintain your desired capacity of 2! 🪄

---

## 🛠️ Troubleshooting: "101: Network is unreachable"

If `/var/log/user-data.log` reports `connect (101: Network is unreachable)`:
- Go to **VPC Console** $\rightarrow$ **Route Tables** $\rightarrow$ `public-route-table` (which has `0.0.0.0/0 -> production-igw`).
- Ensure your ASG subnets are associated with this route table so instances can download Docker packages and pull images from Docker Hub!

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: Launch Template with User Data Script
![Launch Template with User Data Script](./image-2.png)

### 🖼️ Screenshot 2: Auto Scaling Group Across Multi-AZ Private Subnets
![Auto Scaling Group Across Multi-AZ Private Subnets](./image-3.png)

### 🖼️ Screenshot 3: Auto-Healing Activity History
![Auto-Healing Activity History](./image-4.png)

---

## ⏭️ Ready for Step 7?

Now let's configure your custom domain name with Route 53 and enable free HTTPS:  
👉 **[Go to Step 7: 07-route53-and-https.md](./07-route53-and-https.md)**
