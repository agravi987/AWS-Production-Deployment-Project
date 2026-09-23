# 📈 Step 4: EC2 Launch Templates & Multi-AZ Auto Scaling

Welcome to Day 4! 📈  
Today, you build the **self-healing, auto-scaling engine** of your cloud infrastructure.

---

## 🤖 What is Auto Scaling & Self-Healing?

In legacy systems, if a server's hard drive died at 3 AM on a Saturday, an engineer had to wake up and manually rebuild it.

In modern AWS cloud:
1. **Self-Healing**: If Server #1 crashes, the **Auto Scaling Group (ASG)** notices within 60 seconds, terminates the broken machine, and launches a fresh replacement automatically! 🪄
2. **Elastic Scaling**: During Black Friday or a traffic surge, the ASG scales out from 2 servers to 4 servers. When traffic calms down, it scales back in to 2 servers to save money! 💰

```
                      User Traffic Surges 📈
                                │
                                ▼
                 [Auto Scaling Group (ASG)]
                                │
           ┌────────────────────┴────────────────────┐
           ▼                                         ▼
 Availability Zone A                       Availability Zone B
┌───────────────────────┐                 ┌───────────────────────┐
│ EC2 Instance #1       │                 │ EC2 Instance #2       │
│ (Private Subnet 1a)   │                 │ (Private Subnet 1b)   │
└───────────────────────┘                 └───────────────────────┘
           │ (Spawns under heavy load)               │
           ▼                                         ▼
┌───────────────────────┐                 ┌───────────────────────┐
│ EC2 Instance #3       │                 │ EC2 Instance #4       │
│ (Private Subnet 1a)   │                 │ (Private Subnet 1b)   │
└───────────────────────┘                 └───────────────────────┘
```

---

## 📜 1. What is an EC2 Launch Template?

A **Launch Template** is an immutable cookie-cutter blueprint. It specifies:
- Which Operating System to use (Ubuntu 24.04 LTS).
- Which instance size (`t2.micro` or `t3.micro`).
- Which Security Group to attach (`production-ec2-app-sg`).
- Which bootstrap script (**User Data**) to execute on startup.

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create the Launch Template
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2. In the left menu under **Instances**, click **Launch Templates** $\rightarrow$ Click **Create launch template**.
3. Template details:
   - **Launch template name**: `production-app-template`
   - **Template version description**: `v1 - Production Docker containers with RDS`
   - Check ✅ **Provide guidance to help set up a template for use with Auto Scaling**.
4. **Application and OS Images (Amazon Machine Image)**:
   - Select **Quick Start** $\rightarrow$ choose **Ubuntu** (`Ubuntu Server 24.04 LTS`, 64-bit x86). *Free tier eligible*.
5. **Instance type**:
   - Choose `t2.micro` (or `t3.micro`).
6. **Key pair (login)**:
   - Choose your existing key pair (e.g. `devops-ec2-key`) or create a new one.
7. **Network settings**:
   - **Subnet**: Select **Don't include in launch template** *(The Auto Scaling Group will pick the subnets!)*.
   - **Security groups**: Select `production-ec2-app-sg` 🛡️.
8. **Advanced details (Scroll to the very bottom)**:
   - Expand **Advanced details**.
   - Scroll down to the **User data** box.
   - Paste the contents of `aws-production-deployment-project/app/user-data.sh`:

```bash
#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# 1. Update OS packages
apt-get update -y
apt-get install -y docker.io docker-compose-v2 curl

# 2. Enable Docker
systemctl enable --now docker
usermod -aG docker ubuntu

# 3. Create app folder and start containers
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

cat << 'EOF' > docker-compose.yml
services:
  server:
    image: agravi987/devops-server:latest
    container_name: aws_backend
    restart: always
    environment:
      PORT: 5000
      NODE_ENV: production
      DB_HOST: ${DB_HOST}
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: devops_db
    ports:
      - "5000:5000"
    networks:
      - app_network

  client:
    image: agravi987/devops-client:latest
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

# Replace with your actual RDS endpoint created in Step 5!
echo "DB_HOST=REPLACE_WITH_YOUR_RDS_ENDPOINT" > .env
echo "DB_PASSWORD=YourSecurePassword123" >> .env

docker compose pull
docker compose up -d
```

9. Click **Create launch template**! 🎉

---

### Part 2: Create the Auto Scaling Group (ASG)
1. In the left EC2 menu, scroll to the bottom $\rightarrow$ click **Auto Scaling Groups**.
2. Click the orange **Create Auto Scaling group** button.
3. **Step 1: Choose launch template or configuration**:
   - **Auto Scaling group name**: `production-asg`
   - **Launch template**: Select `production-app-template` (Version: Default `1`).
   - Click **Next**.
4. **Step 2: Choose instance launch options**:
   - **VPC**: Select `production-vpc`.
   - **Availability Zones and subnets**:
     - Check `private-app-subnet-1a` 🔒
     - Check `private-app-subnet-1b` 🔒  
     *(Notice: We select our PRIVATE app subnets. The application servers are protected inside the private castle walls!)*
   - Click **Next**.
5. **Step 3: Configure advanced options**:
   - Under **Load balancing**, choose **Attach to an existing load balancer**.
   - Select **Choose from your load balancer target groups**.
   - **Existing target groups**: Select `production-tg`! 🎯
   - Under **Health checks**:
     - Check ✅ **Turn on Elastic Load Balancing health checks** *(If the ALB marks an instance unhealthy, ASG replaces it automatically!)*
     - **Health check grace period**: `300` seconds.
   - Click **Next**.
6. **Step 4: Configure group size and scaling policies**:
   - **Desired capacity**: `2` (Runs 2 EC2 instances at all times)
   - **Minimum capacity**: `2`
   - **Maximum capacity**: `4`
   - Under **Automatic scaling**: Choose **Target tracking scaling policy**:
     - **Metric type**: `Average CPU utilization`
     - **Target value**: `70` (If CPU > 70%, add a server; if CPU drops, remove a server).
   - Click **Next** $\rightarrow$ Click **Next** through Notifications and Tags.
7. Click **Create Auto Scaling group**! 🚀

---

## 🧪 The "Chaos Monkey" Self-Healing Test!

Want to see AWS self-healing with your own eyes?

1. Go to the **EC2 Instances** dashboard.
2. You will see 2 new instances running named `production-asg`.
3. Select one of them $\rightarrow$ Click **Instance state** $\rightarrow$ **Terminate instance** 💥.
4. Go back to **Auto Scaling Groups** $\rightarrow$ click on `production-asg` $\rightarrow$ **Activity tab**:
   - You will see: *Instance was terminated (unhealthy).*
   - Immediately followed by: *Launching a new EC2 instance to maintain desired capacity of 2!* 🪄
5. Within 2 minutes, a new server is online, added to the ALB Target Group, and serving traffic!

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: Launch Template with User Data Script
<!-- Replace with your screenshot path once taken -->
![Launch Template Created](./screenshots/09-ec2-launch-template.png)
*Caption: production-app-template showing Ubuntu 24.04 AMI, t2.micro instance type, and production-ec2-app-sg.*

### 🖼️ Screenshot 2: Auto Scaling Group Across Multi-AZ Private Subnets
<!-- Replace with your screenshot path once taken -->
![Auto Scaling Group](./screenshots/10-asg-instances-healthy.png)
*Caption: production-asg showing 2 healthy instances distributed across private-app-subnet-1a and 1b.*

### 🖼️ Screenshot 3: Auto-Healing Activity History
<!-- Replace with your screenshot path once taken -->
![ASG Self Healing](./screenshots/11-asg-self-healing-activity.png)
*Caption: ASG Activity tab recording automatic termination of failed instance and launch of replacement.*

---

## ⏭️ Ready for Day 5?
Now let's provision our managed, automated cloud database on Amazon RDS:  
👉 **[Go to Step 5: 05-rds-database-mastery.md](./05-rds-database-mastery.md)**
