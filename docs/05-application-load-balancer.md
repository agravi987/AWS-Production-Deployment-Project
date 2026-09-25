# ⚖️ Step 5: Application Load Balancer (ALB) Mastery

🎯 **Mission**: Create a **Target Group** that checks application health on `/api/health`, and launch an **Application Load Balancer (ALB)** across public subnets to distribute incoming user traffic.

---

## 💡 The Concept: Why Do We Need a Load Balancer?

Instead of giving users individual EC2 IP addresses that change constantly, an ALB provides:
1. **One Permanent DNS Entry Point**: Clients connect to the ALB URL.
2. **Automated Health Probing**: Regularly pings `/api/health`. If Server 1 dies, 100% of user traffic is instantly shifted to Server 2 without downtime!
3. **Multi-AZ Availability**: Distributes requests evenly across `us-east-1a` and `us-east-1b`.

---

## 📋 Copy-Paste Configuration Table

| Resource | Setting | Value to Choose |
| :--- | :--- | :--- |
| **Target Group** | Name | `production-tg` |
| | Target Type | **Instances** 💻 |
| | Protocol / Port | `HTTP` : `80` |
| | VPC | `production-vpc` |
| | Health Check Path | `/api/health` 🩺 |
| **Load Balancer** | Name | `production-alb` |
| | Scheme | **Internet-facing** 🌐 |
| | VPC | `production-vpc` |
| | Subnets | `public-subnet-1a` & `public-subnet-1b` |
| | Security Group | `production-alb-sg` 🛡️ |
| | Listener | `HTTP:80` forwarding to `production-tg` |

---

## 🖱️ Step-by-Step AWS Console Recipe

### 1. Create Target Group
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/) $\rightarrow$ under **Load Balancing**, click **Target Groups**.
2. Click **Create target group**:
   - Target type: Select **Instances**.
   - Target group name: `production-tg`.
   - Protocol: `HTTP` | Port: `80` | VPC: `production-vpc`.
3. Health checks:
   - Health check path: `/api/health` *(Our backend health check endpoint)*.
4. Click **Next** $\rightarrow$ Click **Create target group**! 🎉  
   *(Do not manually register instances now; Auto Scaling does this automatically in Step 6)*.

---

### 2. Create Application Load Balancer
1. In the left EC2 menu, click **Load Balancers** $\rightarrow$ Click **Create load balancer**.
2. Under **Application Load Balancer**, click **Create**:
   - Load balancer name: `production-alb`
   - Scheme: **Internet-facing** 🌐
   - IP address type: `IPv4`
3. Network mapping:
   - VPC: `production-vpc`
   - Mappings: Select both AZs:
     - Check `us-east-1a` $\rightarrow$ select `public-subnet-1a`
     - Check `us-east-1b` $\rightarrow$ select `public-subnet-1b`
4. Security groups:
   - Remove default $\rightarrow$ select `production-alb-sg` 🛡️.
5. Listeners and routing:
   - Protocol: `HTTP` | Port: `80`
   - Default action: Forward to $\rightarrow$ `production-tg`.
6. Click **Create load balancer**! 🚀

---

## 🔍 Checkpoints: How to Verify

1. In the **Load Balancers** list, check the **State** column for `production-alb`.
2. Wait until it changes from *Provisioning* to **Active** 🟢 (takes ~2 minutes).
3. Copy the **DNS name** (e.g. `production-alb-123456789.us-east-1.elb.amazonaws.com`). This will be your application's public URL once instances launch!

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: Target Group Configured with Health Checks
![Target Group Configured with Health Checks](./image.png)

### 🖼️ Screenshot 2: Application Load Balancer Active Across Public Subnets
![Application Load Balancer Active Across Public Subnets](./image-1.png)

---

## ⏭️ Ready for Step 6?

Now let's launch the Auto Scaling Group that deploys our Docker compute fleet to this Target Group:  
👉 **[Go to Step 6: 06-ec2-launch-template-asg.md](./06-ec2-launch-template-asg.md)**
