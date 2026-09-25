# 📈 Step 6: EC2 Launch Templates & Multi-AZ Auto Scaling (ASG)

Welcome to **Step 6**! 📈  
Today, you build the **self-healing, auto-scaling engine** of your cloud infrastructure.  
Because you already created the **RDS Database in Step 3**, stored credentials in **Secrets Manager in Step 4**, and configured the **ALB in Step 5**, your servers will boot up, pull credentials securely, connect to the database, and register as healthy with zero manual intervention! 🪄

---

## 🤖 What is an Auto Scaling Group (ASG) & Self-Healing?

In legacy systems, if an EC2 instance died at 3 AM on a weekend, an engineer had to be paged to wake up and manually rebuild it.  
With AWS Auto Scaling Groups:
1. **Desired Capacity**: The ASG maintains exactly the number of servers you specify (e.g. 2 instances across 2 Availability Zones).
2. **Health Monitoring**: AWS tracks both EC2 hardware checks and ALB HTTP `/api/health` responses.
3. **Automated Self-Healing**: If an instance crashes or becomes unhealthy, the ASG terminates the failed server and spins up a brand-new, healthy replacement within 2 minutes!

```
                  ┌─────────────────────────────────────────┐
                  │    Auto Scaling Group (ASG) 📈          │
                  │    Desired: 2 | Min: 2 | Max: 4         │
                  └────────────────────┬────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        Availability Zone A                    Availability Zone B
  ┌───────────────────────────────┐     ┌───────────────────────────────┐
  │ Private App Subnet 1A         │     │ Private App Subnet 1B         │
  │ • EC2 App Instance #1         │     │ • EC2 App Instance #2         │
  │   (Running Docker Containers) │     │   (Running Docker Containers) │
  └───────────────────────────────┘     └───────────────────────────────┘
```

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create the EC2 Launch Template

A Launch Template is the master blueprint that defines the AMI, instance size, IAM profile, security group, and startup script for your fleet:

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2. In the left menu under **Instances**, click **Launch Templates** $\rightarrow$ Click **Create launch template**.
3. **Launch template name and description**:
   - **Launch template name**: `production-lt`
   - **Template version description**: `v1 - Production App with Secrets Manager and Docker`
   - Check the box ✅ **Auto Scaling guidance** *(Helps ensure compatibility with ASG)*.
4. **Application and OS Images (Amazon Machine Image)**:
   - Select **Ubuntu** $\rightarrow$ choose **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type** (Free tier eligible).
   - Architecture: `64-bit (x86)`.
5. **Instance type**:
   - Select `t2.micro` (or `t3.micro` depending on Free Tier in your region).
6. **Key pair (login)**:
   - Select an existing key pair or choose *Proceed without a key pair* (EC2 Instance Connect can be used).
7. **Network settings**:
   - Subnet: *Don't include in launch template* (the Auto Scaling Group will dictate subnet placement across AZs).
   - **Security groups**: Select `production-ec2-app-sg` 🛡️.
8. **Advanced details** (Expand this section at the bottom):
   - **IAM instance profile**: Select `production-ec2-secrets-role` *(Created in Step 4!)* 🔑.
   - Scroll down to the **User data** box and paste the script below:

```bash
#!/bin/bash
set -e
exec > >(tee -a /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "=================================================================="
echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Starting EC2 Production Bootstrap"
echo "=================================================================="

# 1. Update OS packages and install core dependencies
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release jq awscli docker.io docker-compose

# 2. Start and enable Docker
systemctl enable --now docker
usermod -aG docker ubuntu

# Install modern Docker Compose v2 plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -sSL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
ln -sf /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

# 3. Create app workspace
APP_DIR="/home/ubuntu/app"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# 4. Resolve AWS Region
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

# 8. Pull images and launch application containers
docker compose pull || docker-compose pull
docker compose up -d || docker-compose up -d

# 9. Verify local health check
sleep 10
curl -s http://localhost/api/health || true
echo "✅ EC2 Bootstrap Completed Successfully!"
```

9. Click **Create launch template**! 🎉

---

### Part 2: Create the Auto Scaling Group (ASG)

1. In the left EC2 menu under **Auto Scaling**, click **Auto Scaling Groups**.
2. Click the orange **Create Auto Scaling group** button.
3. **Step 1: Choose launch template**:
   - **Auto Scaling group name**: `production-asg`
   - **Launch template**: Select `production-lt`.
   - Click **Next**.
4. **Step 2: Choose instance launch options**:
   - **VPC**: Select `production-vpc`.
   - **Availability Zones and subnets**: Check both private application subnets:
     - `private-app-subnet-1a`
     - `private-app-subnet-1b`
   - Click **Next**.
5. **Step 3: Configure advanced options**:
   - **Load balancing**: Select **Attach to an existing load balancer**.
   - Select **Choose from your load balancer target groups** $\rightarrow$ select `production-tg`!
   - **Health checks**:
     - Check ✅ **Turn on Elastic Load Balancing health checks**.
     - Health check grace period: `300` seconds (allows Docker time to pull images).
   - Click **Next**.
6. **Step 4: Configure group size and scaling policies**:
   - **Desired capacity**: `2`
   - **Minimum capacity**: `2`
   - **Maximum capacity**: `4`
   - Click **Next** $\rightarrow$ Click **Next** through notifications and tags.
7. Click **Create Auto Scaling group**! 🚀

---

## 🔍 Checkpoints: How to Verify & See Everything Running Live

### 1. Check EC2 Instances Status in Console
- Go to **EC2** $\rightarrow$ **Instances**.
- You will see two instances named `production-asg` with state **Running** 🟢.

### 2. Verify Container Startup Logs (Inside EC2)
Connect to an instance via **EC2 Instance Connect** and view the bootstrap log:
```bash
sudo cat /var/log/user-data.log
```
*You will see Docker installing, secret fetched from Secrets Manager, and containers launching!*

### 3. Verify Docker Containers are Running
```bash
docker ps
```
Both containers will be online:
- `aws_frontend` (Port 80)
- `aws_backend` (Port 5000)

### 4. Test Local Container Health Endpoint
```bash
curl http://localhost/api/health
```
*Expected response*:
```json
{"status":"UP","uptimeSeconds":15,"database":"connected"}
```

### 5. Check Target Group Health in AWS Console
- Go to **EC2** $\rightarrow$ **Target Groups** $\rightarrow$ `production-tg` $\rightarrow$ **Targets** tab.
- Both EC2 instances will display Health status: **Healthy** in green 🟢!

### 6. Open the Application Load Balancer in Your Browser!
- Go to **EC2** $\rightarrow$ **Load Balancers** $\rightarrow$ select `production-alb`.
- Copy the **DNS name** (e.g. `http://production-alb-123456.us-east-1.elb.amazonaws.com`).
- Paste it into your browser address bar:  
  **Your live React frontend will load, connected through the ALB to your backend containers and Amazon RDS!** 🥳

---

## 🧪 The "Chaos Monkey" Self-Healing Test!

1. Go to **EC2** $\rightarrow$ **Instances**.
2. Select one of your two running instances $\rightarrow$ Click **Instance state** $\rightarrow$ **Terminate instance** 💥.
3. Navigate to **Auto Scaling Groups** $\rightarrow$ click `production-asg` $\rightarrow$ **Activity** tab:
   - You will see: *Instance terminated (unhealthy).*
   - Followed by: *Launching a new EC2 instance to maintain desired capacity of 2!* 🪄
4. Within 2 minutes, a replacement instance is provisioned, bootstrapped, and registered into the ALB Target Group automatically!

---

## 🛠️ Troubleshooting: "Network is unreachable" or "Package docker.io has no installation candidate"

If you inspect `/var/log/user-data.log` and see:
`Cannot initiate the connection to security.ubuntu.com:80 ... connect (101: Network is unreachable)`:
- **Cause**: The subnet selected in your Auto Scaling Group does not have an outbound route to the Internet Gateway, or does not have Auto-assign Public IP enabled. Without outbound internet access, the EC2 instance cannot download OS packages or Docker images!
- **Quick Fix**:
  1. Go to **VPC Console** $\rightarrow$ **Route Tables** $\rightarrow$ select `public-route-table` (which has route `0.0.0.0/0 -> production-igw`).
  2. Click **Subnet associations** $\rightarrow$ **Edit subnet associations** $\rightarrow$ Check the subnets used by your ASG (`private-app-subnet-1a` and `private-app-subnet-1b` or `public-subnet-1a` and `1b`) $\rightarrow$ Click **Save associations**.
  3. Go to **Subnets** $\rightarrow$ Select those subnets $\rightarrow$ **Actions** $\rightarrow$ **Edit subnet settings** $\rightarrow$ Check **Enable auto-assign public IPv4 address** $\rightarrow$ Click **Save**.
  4. Terminate the failing instance or rerun:
     ```bash
     sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/agravi987/AWS-Production-Deployment-Project/main/app/user-data.sh)"
     ```
  *(Remember: Your application servers are 100% secure because `production-ec2-app-sg` drops all public incoming traffic; only the ALB is allowed in!)*

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

Now let's configure a custom domain name with Route 53 and enable HTTPS encryption with AWS Certificate Manager:  
👉 **[Go to Step 7: 07-route53-and-https.md](./07-route53-and-https.md)**
