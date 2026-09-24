# ☁️ Project 4: AWS Production Deployment (Hands-On Cloud Architecture) 🚀

Welcome to **Project 4: AWS Production Deployment**! This project guides you step-by-step through designing, building, securing, and scaling a **production-grade, multi-tier cloud infrastructure** on Amazon Web Services (AWS) using the **AWS Management Console**. 🌟

---

## 🏗️ Production Architecture & Deployment Workflow

![AWS Production Deployment Workflow and Architecture Roadmap](./docs/aws-deployment-workflow.jpg)

```
                               THE INTERNET 🌐
                                      │
                                      ▼
                        [🌍 Amazon Route 53 (DNS)]
                                      │
                                      ▼
                  [🔒 AWS Certificate Manager (HTTPS/SSL)]
                                      │
                                      ▼
             [⚖️ Application Load Balancer (ALB) - Public Subnets]
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        Availability Zone A                    Availability Zone B
  ┌───────────────────────────────┐     ┌───────────────────────────────┐
  │ Public Subnet A (10.0.1.0/24) │     │ Public Subnet B (10.0.2.0/24) │
  │ • ALB Listener A              │     │ • ALB Listener B              │
  ├───────────────────────────────┤     ├───────────────────────────────┤
  │ Private Subnet A (10.0.11.0/24│     │ Private Subnet B (10.0.12.0/24│
  │ • EC2 App Instance #1         │     │ • EC2 App Instance #2         │
  │   (Auto Scaling Group)        │     │   (Auto Scaling Group)        │
  ├───────────────────────────────┤     ├───────────────────────────────┤
  │ DB Subnet A (10.0.21.0/24)    │     │ DB Subnet B (10.0.22.0/24)    │
  │ • Amazon RDS PostgreSQL       │◄───►│ • Multi-AZ Standby Replica    │
  │   (Primary Writer)            │     │   (Automated Failover)        │
  └───────────────────────────────┘     └───────────────────────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        [📦 S3 + CloudWatch]                 [🔐 AWS Secrets Manager]
        Metrics, Alarms, Logs                Database Credentials
```

---

## 💡 The Core Concept: Why Build This Manually?

In Project 3, we deployed to a single EC2 instance. But in modern enterprise cloud engineering:
1. **Never use the Default VPC**: A custom VPC lets you isolate public, application, and database networks.
2. **Never expose databases to the internet**: Databases belong in private subnets with zero internet ingress.
3. **Never rely on a single server**: Auto Scaling Groups span multiple data centers (Availability Zones) to auto-heal when hardware fails.
4. **Hands-on mastery**: Building this manually in the AWS Console allows you to understand how every button, subnet, route table, security group, and listener connects under the hood!

---

## 📂 Repository Structure

```
aws-production-deployment-project/
├── 📄 README.md                          # Master overview & fast-lane index
│
├── 🚀 app/                               # Production Application Scripts & Configs
│   ├── user-data.sh                      # EC2 bootstrap script (installs Docker & launches app)
│   ├── docker-compose.aws.yml            # Docker Compose configured for Amazon RDS endpoint
│   ├── test-rds-connection.js            # Node utility script to test RDS connection directly
│   └── .env.example                      # Template for RDS connection details
│
└── 📚 docs/                              # 📖 10-Part Step-by-Step Hands-On Masterclass
    ├── screenshots/                      # 📸 Dedicated proof-of-work screenshot folder
    ├── 00-project-roadmap.md             # 🗺️ Architecture roadmap with sequence & checklists
    ├── 01-vpc-and-networking.md          # 🌐 Step 1: Custom VPC, 6 Subnets across 2 AZs, IGW & Routes
    ├── 02-security-groups-defense.md     # 🛡️ Step 2: Layered Security Groups (ALB -> EC2 -> RDS chain)
    ├── 03-rds-database-mastery.md        # 🐘 Step 3: Amazon RDS PostgreSQL, DB Subnet Groups & Backups
    ├── 04-s3-and-secrets-manager.md      # 🔐 Step 4: AWS Secrets Manager & S3 Bucket policies
    ├── 05-application-load-balancer.md   # ⚖️ Step 5: Application Load Balancer, Target Groups & Health Checks
    ├── 06-ec2-launch-template-asg.md     # 📈 Step 6: Launch Templates, Multi-AZ Auto Scaling & Self-Healing
    ├── 07-route53-and-https.md           # 🌍 Step 7: Route 53 DNS, Custom Domains & ACM SSL/TLS (HTTPS)
    ├── 08-cloudwatch-monitoring.md       # 📊 Step 8: CloudWatch CPU Alarms, SNS Email Alerts & Dashboard
    ├── 09-cost-management-cleanup.md     # 💰 Step 9: Staying 100% Free Tier & Safe Reverse-Order Teardown
    └── 10-interview-masterclass.md       # 💼 Step 10: 15 Cloud Architecture Interview Questions & Resume Points
```

---

## 📸 Proof-of-Work Gallery

> [!TIP]
> Save your screenshots into `docs/` and `docs/screenshots/` as you complete each step to build your cloud engineering portfolio!

| Milestone | What to Capture | Suggested File |
| :--- | :--- | :--- |
| **1. Custom VPC & Subnets** | VPC console with 6 subnets across 2 AZs | `docs/screenshots/01-vpc-created.png` |
| **2. Security Group Chaining** | RDS SG showing source = EC2 SG | `docs/screenshots/06-rds-security-group.png` |
| **3. Amazon RDS Database** | RDS dashboard showing status Available | `docs/screenshots/13-rds-postgres-available.png` |
| **4. Secrets Manager** | Secrets Manager credentials stored | `docs/screenshots/17-secrets-manager-stored.png` |
| **5. Load Balancer & Health** | ALB Target Group showing healthy instances | `docs/image.png` & `docs/image-1.png` |
| **6. Auto-Healing Test** | ASG Activity tab replacing terminated instance | `docs/image-2.png`, `image-3.png`, `image-4.png` |
| **7. HTTPS / SSL Active** | Browser showing green padlock on custom domain | `docs/screenshots/15-alb-https-listener.png` |

---

## 🗺️ Step-by-Step Masterclass Curriculum

1. 🗺️ **[00-project-roadmap.md](./docs/00-project-roadmap.md)** - Architecture roadmap with sequence & checklists.
2. 🌐 **[01-vpc-and-networking.md](./docs/01-vpc-and-networking.md)** - Step 1: Custom VPC (`10.0.0.0/16`), 6 Subnets, Internet Gateway & Route Tables.
3. 🛡️ **[02-security-groups-defense.md](./docs/02-security-groups-defense.md)** - Step 2: Layered Security Groups (`alb-sg` ➔ `ec2-app-sg` ➔ `rds-db-sg`).
4. 🐘 **[03-rds-database-mastery.md](./docs/03-rds-database-mastery.md)** - Step 3: Amazon RDS PostgreSQL, DB Subnet Groups, Snapshots & Multi-AZ.
5. 🔐 **[04-s3-and-secrets-manager.md](./docs/04-s3-and-secrets-manager.md)** - Step 4: Storing database secrets in Secrets Manager with IAM EC2 instance profiles.
6. ⚖️ **[05-application-load-balancer.md](./docs/05-application-load-balancer.md)** - Step 5: Application Load Balancer, Target Groups & `/api/health` probes.
7. 📈 **[06-ec2-launch-template-asg.md](./docs/06-ec2-launch-template-asg.md)** - Step 6: Launch Templates, Multi-AZ Auto Scaling Groups & Self-Healing tests.
8. 🌍 **[07-route53-and-https.md](./docs/07-route53-and-https.md)** - Step 7: Route 53 DNS Alias records and ACM SSL/TLS certificates (HTTPS).
9. 📊 **[08-cloudwatch-monitoring.md](./docs/08-cloudwatch-monitoring.md)** - Step 8: CloudWatch CPU alarms, SNS email notifications & live command dashboard.
10. 💰 **[09-cost-management-cleanup.md](./docs/09-cost-management-cleanup.md)** - Step 9: \$1.00 budget alerts, staying 100% Free Tier & safe teardown checklist.
11. 💼 **[10-interview-masterclass.md](./docs/10-interview-masterclass.md)** - Step 10: 15 Cloud Architecture interview questions, elevator pitch & resume points.

---

🎉 **Ready to start? Begin with Day 1:**  
👉 **[docs/01-vpc-and-networking.md](./docs/01-vpc-and-networking.md)**
