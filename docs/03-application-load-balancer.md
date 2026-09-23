# ⚖️ Step 3: Application Load Balancer (ALB) Mastery

Welcome to Day 3! ⚖️  
In production, you never send users directly to a single EC2 instance IP address.  
Instead, an **Application Load Balancer (ALB)** sits in front of your servers as a high-performance traffic director.

---

## 🎯 Why Do We Use an Application Load Balancer?

```
                     Users & Browsers 🌐
                             │
                             ▼
             ┌───────────────────────────────┐
             │ Application Load Balancer ⚖️  │  • Single DNS entry point
             │   (Public Subnets 1a & 1b)    │  • Terminate HTTPS / SSL certificates
             └───────────────┬───────────────┘  • Automatic health checks
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       EC2 Instance #1               EC2 Instance #2
    (Private Subnet 1a)           (Private Subnet 1b)
```

### 🌟 4 Superpowers of the ALB:
1. **Traffic Distribution**: Spreads user traffic evenly so no single server gets overwhelmed.
2. **High Availability**: Spans across multiple Availability Zones (`us-east-1a` and `us-east-1b`).
3. **Automated Health Checks**: Constantly pings `/api/health`. If Server #1 crashes, the ALB instantly stops sending traffic to it and directs 100% of users to Server #2 without anyone noticing!
4. **SSL/TLS Offloading**: Manages HTTPS certificates in one place so your backend code doesn't have to deal with SSL encryption overhead.

---

## 🧩 The 3 Core Pieces of Load Balancing

| Component | What It Does | Real-World Analogy |
| :--- | :--- | :--- |
| **Listener** 👂 | Listens on a port (e.g., HTTP 80 or HTTPS 443) for incoming connections. | The receptionist answering incoming phone calls. |
| **Rules** 📋 | Decides what to do with the request (e.g., forward to app, or redirect HTTP to HTTPS). | The call routing menu ("Press 1 for Sales"). |
| **Target Group** 🎯 | The pool of backend servers (EC2 instances) that actually process the request. | The team of customer service agents taking calls. |

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create the Target Group
The Target Group tells the ALB *where* to forward traffic and *how* to test server health:

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2. In the left menu, scroll down to **Load Balancing** $\rightarrow$ click **Target Groups**.
3. Click the orange **Create target group** button.
4. Step 1: Specify group details:
   - **Target type**: Select **Instances** 💻.
   - **Target group name**: `production-tg`
   - **Protocol**: `HTTP` | **Port**: `80`
   - **IP address type**: `IPv4`
   - **VPC**: Select your `production-vpc`.
   - **Protocol version**: `HTTP1`
5. **Health checks section**:
   - **Health check protocol**: `HTTP`
   - **Health check path**: `/api/health` 🩺 *(This uses our backend health check!)*
   - Expand **Advanced health check settings**:
     - **Healthy threshold**: `2` (Consecutive successful checks before marking instance healthy)
     - **Unhealthy threshold**: `2` (Consecutive failures before removing traffic)
     - **Timeout**: `5` seconds
     - **Interval**: `15` seconds
     - **Success codes**: `200`
6. Click **Next**.
7. Step 2: Register targets:
   - Since our Auto Scaling Group will register instances automatically in Step 4, click **Create target group** directly! 🎉

---

### Part 2: Create the Application Load Balancer
1. In the left EC2 menu, click **Load Balancers** $\rightarrow$ Click **Create load balancer**.
2. Under **Application Load Balancer**, click **Create**.
3. Basic configuration:
   - **Load balancer name**: `production-alb`
   - **Scheme**: Select **Internet-facing** 🌐 *(Accepts traffic from the web)*.
   - **IP address type**: `IPv4`.
4. **Network mapping**:
   - **VPC**: Select your `production-vpc`.
   - **Mappings (Select 2 Availability Zones)**:
     - Check Zone 1 (e.g., `us-east-1a`) $\rightarrow$ Select `public-subnet-1a`.
     - Check Zone 2 (e.g., `us-east-1b`) $\rightarrow$ Select `public-subnet-1b`.
5. **Security groups**:
   - Remove the default security group.
   - Select: `production-alb-sg` 🛡️.
6. **Listeners and routing**:
   - **Protocol**: `HTTP` | **Port**: `80`.
   - **Default action**: Forward to $\rightarrow$ Select `production-tg`.
7. Summary: Click **Create load balancer** at the bottom! 🚀

---

## 🔍 Understanding the ALB DNS Name

Click on your newly created `production-alb`:
- Notice the **DNS name**:  
  `production-alb-123456789.us-east-1.elb.amazonaws.com`
- This is your public cloud entry point! Users connect to this DNS name. In Step 6, we will connect your custom domain name (e.g. `api.yourdomain.com`) to this ALB using **Route 53**.

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: Target Group Configured with Health Checks
<!-- Replace with your screenshot path once taken -->
![Target Group Health Checks](./screenshots/07-alb-target-group.png)
*Caption: production-tg showing target type instances, port 80, and /api/health check path.*

### 🖼️ Screenshot 2: Application Load Balancer Active Across Public Subnets
<!-- Replace with your screenshot path once taken -->
![ALB Created](./screenshots/08-alb-active.png)
*Caption: production-alb showing state active, internet-facing scheme, and public-subnet-1a and 1b mappings.*

---

## ⏭️ Ready for Day 4?
Now let's create the Auto Scaling Group that automatically deploys EC2 instances to this Target Group:  
👉 **[Go to Step 4: 04-ec2-launch-template-asg.md](./04-ec2-launch-template-asg.md)**
