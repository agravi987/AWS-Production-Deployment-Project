# 🛡️ Step 2: Layered Security Groups (Zero-Trust Defense)

Welcome to **Step 2**! 🛡️  
In the cloud, firewalls are known as **Security Groups**.  
A Security Group acts as a **virtual stateful firewall** that controls inbound (ingress) and outbound (egress) traffic at the elastic network interface level.

---

## 🏰 The Core Security Concept: "Chained" Security Groups

A common security vulnerability is opening database ports (`5432`) or application ports (`5000`) to the entire world (`0.0.0.0/0`).  
In enterprise AWS architectures, we implement **Security Group Chaining**:

```
THE INTERNET (0.0.0.0/0)
          │
          │ Allows HTTP (80) & HTTPS (443) ONLY
          ▼
┌──────────────────────────────────────┐
│  [ALB Security Group: alb-sg]        │ 🌐 Entry Point
└──────────────────┬───────────────────┘
                   │
                   │ Allows Port 80 & 5000 ONLY from [alb-sg]
                   ▼
┌──────────────────────────────────────┐
│  [EC2 Security Group: ec2-app-sg]    │ 💻 Application Fleet
└──────────────────┬───────────────────┘
                   │
                   │ Allows PostgreSQL (5432) ONLY from [ec2-app-sg]
                   ▼
┌──────────────────────────────────────┐
│  [RDS Security Group: rds-db-sg]     │ 🐘 Database Vault
└──────────────────────────────────────┘
```

> [!IMPORTANT]
> **Why is this so powerful?**  
> Even if an attacker discovers your database endpoint and knows the master password, they **cannot even establish a TCP handshake** from the internet because the database firewall drops their connection instantly!

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### 1. Create `production-alb-sg` (Load Balancer Firewall)

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2. In the left menu under **Network & Security**, click **Security Groups**.
3. Click the orange **Create security group** button.
4. Basic details:
   - **Security group name**: `production-alb-sg`
   - **Description**: `Allow HTTP and HTTPS ingress from the internet`
   - **VPC**: Select `production-vpc`.
5. **Inbound rules** $\rightarrow$ Click **Add rule**:
   - Rule 1: Type: `HTTP` | Port: `80` | Source: `Anywhere-IPv4` (`0.0.0.0/0`)
   - Rule 2: Type: `HTTPS` | Port: `443` | Source: `Anywhere-IPv4` (`0.0.0.0/0`)
6. Click **Create security group**.

---

### 2. Create `production-ec2-app-sg` (Application Fleet Firewall)

1. Click **Create security group**.
2. Basic details:
   - **Security group name**: `production-ec2-app-sg`
   - **Description**: `Allow application traffic strictly from ALB and SSH/Connect`
   - **VPC**: Select `production-vpc`.
3. **Inbound rules** $\rightarrow$ Click **Add rule**:
   - Rule 1 (HTTP from ALB): Type: `Custom TCP` | Port: `80` | Source: Select **Custom** $\rightarrow$ type `production-alb-sg` and select its SG ID (`sg-xxxx`)!
   - Rule 2 (API Backend from ALB): Type: `Custom TCP` | Port: `5000` | Source: Select `production-alb-sg`!
   - Rule 3 (Optional SSH/Troubleshooting): Type: `SSH` | Port: `22` | Source: `My IP` (or EC2 Instance Connect).
4. Click **Create security group**.

---

### 3. Create `production-rds-db-sg` (Database Firewall)

1. Click **Create security group**.
2. Basic details:
   - **Security group name**: `production-rds-db-sg`
   - **Description**: `Allow PostgreSQL strictly from EC2 application servers`
   - **VPC**: Select `production-vpc`.
3. **Inbound rules** $\rightarrow$ Click **Add rule**:
   - Rule 1: Type: `PostgreSQL` | Port: `5432` | Source: Select **Custom** $\rightarrow$ type `production-ec2-app-sg` and select its SG ID!
4. Click **Create security group**.

🎉 **Your 3-tier firewall defense chain is complete!**

---

## 🔍 Checkpoints: How to Verify the Firewall Chain

1. **Verify Source References Security Group IDs (Not IP addresses)**:
   - Click on `production-ec2-app-sg` $\rightarrow$ **Inbound rules** tab:
     - Check that the **Source** column shows `sg-xxxx (production-alb-sg)`.
   - Click on `production-rds-db-sg` $\rightarrow$ **Inbound rules** tab:
     - Check that the **Source** column shows `sg-xxxx (production-ec2-app-sg)`.
2. **Verify Zero Direct Public Exposure for Database**:
   - Confirm that `production-rds-db-sg` has **NO rule** for `0.0.0.0/0`.
   - Outside network packets are completely rejected at the AWS hypervisor level. 🛡️

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: ALB Security Group with Public Ingress
![ALB Security Group with Public Ingress](./screenshots/04-alb-security-group.png)

### 🖼️ Screenshot 2: EC2 Security Group Chained to ALB SG
![EC2 Security Group Chained to ALB SG](./screenshots/05-ec2-security-group.png)

### 🖼️ Screenshot 3: RDS Security Group Chained to EC2 SG
![RDS Security Group Chained to EC2 SG](./screenshots/06-rds-security-group.png)

---

## ⏭️ Ready for Step 3?

Now let's launch our managed cloud database on Amazon RDS:  
👉 **[Go to Step 3: 03-rds-database-mastery.md](./03-rds-database-mastery.md)**
