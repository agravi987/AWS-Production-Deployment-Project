# ⚖️ Step 5: Application Load Balancer (ALB) Mastery

Welcome to Day 5! ⚖️  
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

| Component           | What It Does                                                                           | Real-World Analogy                                |
| :------------------ | :------------------------------------------------------------------------------------- | :------------------------------------------------ |
| **Listener** 👂     | Listens on a port (e.g., HTTP 80 or HTTPS 443) for incoming connections.               | The receptionist answering incoming phone calls.  |
| **Rules** 📋        | Decides what to do with the request (e.g., forward to app, or redirect HTTP to HTTPS). | The call routing menu ("Press 1 for Sales").      |
| **Target Group** 🎯 | The pool of backend servers (EC2 instances) that actually process the request.         | The team of customer service agents taking calls. |

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create the Target Group

The Target Group tells the ALB _where_ to forward traffic and _how_ to test server health:

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
   - **Health check path**: `/api/health` 🩺 _(This uses our backend health check!)_
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
   - **Scheme**: Select **Internet-facing** 🌐 _(Accepts traffic from the web)_.
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

## 🔍 Checkpoints: How to Verify & See It Running

1. **Verify ALB State is Active**:
   - In the **Load Balancers** table, check the **State** column. It should show **Active** with a green icon 🟢 (takes ~2 minutes to transition from *Provisioning* to *Active*).

2. **Verify Target Group Health**:
   - Go to **Target Groups** $\rightarrow$ click `production-tg` $\rightarrow$ **Targets** tab.
   - Once instances are registered, you will see their health status:
     - `Initial`: ALB is running the first health check.
     - `Healthy` 🟢: Both instances responded with HTTP 200 on `/api/health`!

3. **Test the Public ALB DNS in Your Browser**:
   - Copy the **DNS name** from the ALB summary:  
     `http://production-alb-123456789.us-east-1.elb.amazonaws.com`
   - Open it in your browser:
     - `/`: Loads the React Dashboard!
     - `/api/health`: Returns `{"status":"UP", "database":"connected"}`!

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: Target Group Configured with Health Checks

![Target Group Configured with Health Checks](./image.png)

### 🖼️ Screenshot 2: Application Load Balancer Active Across Public Subnets

![Application Load Balancer Active Across Public Subnets](./image-1.png)

---

## ⏭️ Ready for Day 6?

Now let's create the EC2 Launch Template and Auto Scaling Group to boot application containers and attach to this Target Group:  
👉 **[Go to Step 6: 06-ec2-launch-template-asg.md](./06-ec2-launch-template-asg.md)**
