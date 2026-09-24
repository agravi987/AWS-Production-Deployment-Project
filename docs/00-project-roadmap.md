# 🗺️ 7-Day AWS Production Architecture Roadmap

Welcome to **Project 4: AWS Production Deployment**! ☁️✨  
In this project, you will build an **enterprise-grade, production-style cloud architecture** on Amazon Web Services using the **AWS Management Console**.

---

## 🎯 The Big Picture Architecture & Deployment Workflow

![AWS Production Deployment Workflow and Architecture Roadmap](./aws-deployment-workflow.jpg)

### 📊 Master Breakdown: Everything You Need to Know

#### 1. 🔄 What the Workflows Are
* **Traffic Ingress Workflow**:
  `End User` ➔ `Amazon Route 53 (DNS lookup)` ➔ `Internet Gateway (IGW)` ➔ `Application Load Balancer (Public Subnets, SSL Termination)` ➔ `EC2 Instances (Private Subnets, Port 5000/80)` ➔ `Amazon RDS PostgreSQL (Private DB Subnets, Port 5432)`.
* **Automated Bootstrap & Secret Injection Workflow**:
  `EC2 Instance Boots up` ➔ `User Data script executes` ➔ `EC2 IAM Instance Profile queries AWS Secrets Manager` ➔ `Database Endpoint & Credentials injected into .env` ➔ `Docker Compose spins up backend application connected directly to RDS`.
* **High Availability & Auto-Healing Workflow**:
  `CloudWatch / ALB Health Check monitors /api/health` ➔ `Unhealthy instance detected` ➔ `Auto Scaling Group terminates failing instance` ➔ `ASG automatically provisions a healthy replacement instance across Availability Zones`.

---

#### 2. 🛠️ What Things We Have to Make
| Component | AWS Resource | Purpose | Subnet Placement |
| :--- | :--- | :--- | :--- |
| **1. Network Foundation** | Amazon VPC (`10.0.0.0/16`) + 6 Subnets + IGW + Route Tables | Isolated cloud datacenter across 2 Availability Zones | Public (`10.0.1.0/24`, `10.0.2.0/24`), Private App (`10.0.11.0/24`, `10.0.12.0/24`), Private DB (`10.0.21.0/24`, `10.0.22.0/24`) |
| **2. Security Firewalls** | 3 Layered Security Groups (`alb-sg`, `ec2-app-sg`, `rds-db-sg`) | Defense-in-depth zero-trust network chaining | Applied per resource tier |
| **3. Database** | Amazon RDS PostgreSQL + DB Subnet Group | Production managed relational database with automated snapshots | Isolated in Private DB Subnets (Zero internet access) |
| **4. Secrets Vault** | AWS Secrets Manager (`app/production/db`) + IAM Role | Secure credential store eliminating hardcoded database passwords | Regional service accessed via IAM Instance Profile |
| **5. Traffic Balancer** | Application Load Balancer (ALB) + Target Group (`/api/health`) | Public entry point distributing requests across AZs | Public Subnets A & B |
| **6. Scalable Compute** | EC2 Launch Template + Auto Scaling Group (ASG) | Auto-healing Docker compute fleet running application containers | Private App Subnets A & B |
| **7. Domain & SSL** | Amazon Route 53 (DNS) + AWS Certificate Manager (ACM) | Custom domain routing with free, auto-renewing HTTPS/TLS encryption | Edge / Regional |

---

#### 3. 🔢 The Exact Sequence to Follow (Why this Order Matters!)
To make the application work seamlessly without chicken-and-egg dependency errors, follow this exact sequence:

1. **Step 1: VPC & Subnets**: Create the network first. Nothing can exist without subnets and route tables.
2. **Step 2: Security Groups**: Create the firewall groups (`alb-sg` ➔ `ec2-app-sg` ➔ `rds-db-sg`) so they can reference each other.
3. **Step 3: Amazon RDS Database**: Deploy the database in the private DB subnets **before** your application launches so the database endpoint is ready.
4. **Step 4: AWS Secrets Manager**: Save your RDS endpoint, database name, username, and password into a secret (`app/production/db`).
5. **Step 5: Application Load Balancer & Target Group**: Set up the ALB in the public subnets with health check route `/api/health`.
6. **Step 6: EC2 Launch Template & Auto Scaling Group**: Configure the Launch Template User Data with the IAM role to pull the DB secret dynamically at boot time, then launch the ASG attached to the Target Group.
7. **Step 7: Route 53 & SSL/HTTPS**: Point your domain to the ALB DNS and attach an ACM certificate for secure HTTPS.

---

## 🗓️ Step-by-Step Architectural Milestone Plan

### 📍 Step 1: Virtual Private Cloud (VPC) & Networking 🌐
- [ ] Read **[01-vpc-and-networking.md](./01-vpc-and-networking.md)**
- [ ] Understand why we NEVER deploy directly into the Default VPC.
- [ ] Create a custom VPC (`10.0.0.0/16`).
- [ ] Create 6 Subnets across 2 Availability Zones (`us-east-1a` and `us-east-1b`).
- [ ] Attach an Internet Gateway (IGW) and configure Route Tables.
- 🎯 **Milestone**: You have built an isolated cloud network with public and private boundaries!

---

### 📍 Step 2: Layered Security Groups (Zero-Trust Defense) 🛡️
- [ ] Read **[02-security-groups-defense.md](./02-security-groups-defense.md)**
- [ ] Understand the security chain: `ALB SG ──► EC2 App SG ──► RDS Database SG`.
- [ ] Create the ALB Security Group (Allows Ports 80 & 443 from Internet).
- [ ] Create the EC2 App Security Group (Allows Ports 80 & 5000 **ONLY** from ALB SG).
- [ ] Create the RDS Security Group (Allows Port 5432 **ONLY** from EC2 App SG).
- 🎯 **Milestone**: You engineered an enterprise firewall chain where hackers cannot touch your backend or database directly!

---

### 📍 Step 3: Amazon RDS Managed Database 🐘
- [ ] Read **[03-rds-database-mastery.md](./03-rds-database-mastery.md)**
- [ ] Create an RDS DB Subnet Group across private database subnets.
- [ ] Launch a Free-Tier PostgreSQL RDS instance.
- [ ] Note down the master RDS endpoint for the next step.
- 🎯 **Milestone**: Your production database is provisioned and securely isolated in private subnets!

---

### 📍 Step 4: AWS Secrets Manager & S3 🔐📦
- [ ] Read **[04-s3-and-secrets-manager.md](./04-s3-and-secrets-manager.md)**
- [ ] Store RDS endpoint, username, password in AWS Secrets Manager (`app/production/db`).
- [ ] Create an IAM Role for EC2 with `SecretsManagerReadWrite` policy attached.
- [ ] Create a private S3 bucket with Block Public Access enabled.
- 🎯 **Milestone**: Cloud credentials are securely vaulted with zero hardcoded passwords!

---

### 📍 Step 5: Application Load Balancer (ALB) ⚖️
- [ ] Read **[05-application-load-balancer.md](./05-application-load-balancer.md)**
- [ ] Create an ALB Target Group with HTTP health check (`/api/health`).
- [ ] Launch an internet-facing Application Load Balancer across Public Subnets.
- [ ] Configure HTTP listener routing rules.
- 🎯 **Milestone**: Traffic distribution and automated health checks are ready!

---

### 📍 Step 6: EC2 Launch Templates & Auto Scaling Groups 📈
- [ ] Read **[06-ec2-launch-template-asg.md](./06-ec2-launch-template-asg.md)**
- [ ] Create an EC2 Launch Template with dynamic Secrets Manager fetch in User Data.
- [ ] Attach the IAM instance profile created in Step 4.
- [ ] Launch an Auto Scaling Group across Private App Subnets attached to the ALB Target Group.
- [ ] Test auto-healing: Terminate an EC2 instance and watch ASG automatically replace it! 🪄
- 🎯 **Milestone**: Your app is highly available, self-healing, and dynamically connected to RDS!

---

### 📍 Step 7: Route 53 Custom Domains & HTTPS (SSL) 🌍🔒
- [ ] Read **[07-route53-and-https.md](./07-route53-and-https.md)**
- [ ] Request a free SSL certificate in AWS Certificate Manager (ACM).
- [ ] Configure Route 53 Alias record pointing to your ALB.
- [ ] Configure ALB HTTPS listener on Port 443 and HTTP-to-HTTPS redirect.
- 🎯 **Milestone**: Your website is protected by a custom domain and green HTTPS padlock!

---

### 📍 Step 8: CloudWatch Monitoring & Alerts 📊
- [ ] Read **[08-cloudwatch-monitoring.md](./08-cloudwatch-monitoring.md)**
- [ ] Set up CloudWatch CPU alarms (>70% utilization).
- [ ] Configure Amazon SNS email alerts to notify you of high load.
- [ ] Build a unified CloudWatch metrics dashboard.
- 🎯 **Milestone**: Real-time cloud observability and automated incident alerting!

---

### 📍 Step 9: Cost Management & Safe Teardown Checklist 💰
- [ ] Read **[09-cost-management-cleanup.md](./09-cost-management-cleanup.md)**
- [ ] Create a $1.00 AWS Zero-Spend Budget alarm.
- [ ] Follow the safe reverse-order teardown checklist when finished.
- 🎯 **Milestone**: 100% Free Tier protection and clean cloud hygiene!

---

### 📍 Step 10: Interview Masterclass & Career Portfolio 💼
- [ ] Read **[10-interview-masterclass.md](./10-interview-masterclass.md)**
- [ ] Practice 15 architectural interview questions and master the 2-minute elevator pitch.
- [ ] Add quantified resume bullet points to your CV.
- 🎯 **Milestone**: You are fully qualified to ace DevOps and Cloud Engineer interviews!

---

## 🚀 Let's Begin!
👉 **[Start with Step 1: 01-vpc-and-networking.md](./01-vpc-and-networking.md)**
