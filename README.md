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
├── 🚀 app/                               # End-to-End Application Code & Configs
│   ├── 💻 client/                        # React 18 frontend + Vite + Nginx Alpine
│   │   ├── Dockerfile                    # Multi-stage production container
│   │   ├── nginx.conf                    # Nginx reverse proxy (/api/ -> server:5000)
│   │   └── src/                          # Modern React UI with live status & tasks
│   ├── ⚙️ server/                        # Express REST API + PostgreSQL connection pool
│   │   ├── Dockerfile                    # Node.js 20 production container
│   │   └── src/                          # /api/health and /api/tasks endpoints
│   ├── docker-compose.local.yml          # Local testing compose with local PostgreSQL
│   ├── docker-compose.aws.yml            # Production compose (ravi0706 images + RDS)
│   ├── user-data.sh                      # Zero-touch EC2 bootstrap script (Secrets Manager auto-fetch)
│   ├── test-rds-connection.js            # Node utility script to test RDS connection directly
│   └── .env.example                      # Template for RDS connection details
│
└── 📚 docs/                              # 📖 11-Part Step-by-Step Hands-On Masterclass
    ├── screenshots/                      # 📸 Dedicated proof-of-work screenshot folder
    ├── 00-project-roadmap.md             # 🗺️ Architecture roadmap with sequence & checklists
    ├── 01-docker-hub-images.md           # 🐳 Step 1: Dockerize Full-Stack App & Push to Docker Hub (ravi0706)
    ├── 02-vpc-and-networking.md          # 🌐 Step 2: Custom VPC, 6 Subnets across 2 AZs, IGW & Routes
    ├── 03-security-groups-defense.md     # 🛡️ Step 3: Layered Security Groups (ALB -> EC2 -> RDS chain)
    ├── 04-rds-database-mastery.md        # 🐘 Step 4: Amazon RDS PostgreSQL, DB Subnet Groups & Backups
    ├── 05-s3-and-secrets-manager.md      # 🔐 Step 5: AWS Secrets Manager & S3 Bucket policies
    ├── 06-application-load-balancer.md   # ⚖️ Step 6: Application Load Balancer, Target Groups & Health Checks
    ├── 07-ec2-launch-template-asg.md     # 📈 Step 7: Launch Templates, Multi-AZ Auto Scaling & Self-Healing
    ├── 08-route53-and-https.md           # 🌍 Step 8: Route 53 DNS, Custom Domains & ACM SSL/TLS (HTTPS)
    ├── 09-cloudwatch-monitoring.md       # 📊 Step 9: CloudWatch CPU Alarms, SNS Email Alerts & Dashboard
    ├── 10-cost-management-cleanup.md     # 💰 Step 10: Staying 100% Free Tier & Safe Reverse-Order Teardown
    └── 11-interview-masterclass.md       # 💼 Step 11: 15 Cloud Architecture Interview Questions & Resume Points
```

---

## 📸 Proof-of-Work Gallery

> [!TIP]
> Save your screenshots into `docs/` and `docs/screenshots/` as you complete each step to build your cloud engineering portfolio!

| Milestone | What to Capture | Suggested File |
| :--- | :--- | :--- |
| **1. Docker Hub Images** | Docker Hub repositories showing published tags | `docs/screenshots/00-docker-hub-images.png` |
| **2. Custom VPC & Subnets** | VPC console with 6 subnets across 2 AZs | `docs/screenshots/01-vpc-created.png` |
| **3. Security Group Chaining** | RDS SG showing source = EC2 SG | `docs/screenshots/06-rds-security-group.png` |
| **4. Amazon RDS Database** | RDS dashboard showing status Available | `docs/screenshots/13-rds-postgres-available.png` |
| **5. Secrets Manager** | Secrets Manager credentials stored | `docs/screenshots/17-secrets-manager-stored.png` |
| **6. Load Balancer & Health** | ALB Target Group showing healthy instances | `docs/image.png` & `docs/image-1.png` |
| **7. Auto-Healing Test** | ASG Activity tab replacing terminated instance | `docs/image-2.png`, `image-3.png`, `image-4.png` |
| **8. HTTPS / SSL Active** | Browser showing green padlock on custom domain | `docs/screenshots/15-alb-https-listener.png` |

---

## 🗺️ Step-by-Step Masterclass Curriculum

1. 🗺️ **[00-project-roadmap.md](./docs/00-project-roadmap.md)** - Architecture roadmap with sequence & checklists.
2. 🐳 **[01-docker-hub-images.md](./docs/01-docker-hub-images.md)** - Step 1: Dockerize Full-Stack App, Local Testing & Docker Hub Push (`ravi0706`).
3. 🌐 **[02-vpc-and-networking.md](./docs/02-vpc-and-networking.md)** - Step 2: Custom VPC (`10.0.0.0/16`), 6 Subnets, Internet Gateway & Route Tables.
4. 🛡️ **[03-security-groups-defense.md](./docs/03-security-groups-defense.md)** - Step 3: Layered Security Groups (`alb-sg` ➔ `ec2-app-sg` ➔ `rds-db-sg`).
5. 🐘 **[04-rds-database-mastery.md](./docs/04-rds-database-mastery.md)** - Step 4: Amazon RDS PostgreSQL, DB Subnet Groups, Snapshots & Multi-AZ.
6. 🔐 **[05-s3-and-secrets-manager.md](./docs/05-s3-and-secrets-manager.md)** - Step 5: Storing database secrets in Secrets Manager with IAM EC2 instance profiles.
7. ⚖️ **[06-application-load-balancer.md](./docs/06-application-load-balancer.md)** - Step 6: Application Load Balancer, Target Groups & `/api/health` probes.
8. 📈 **[07-ec2-launch-template-asg.md](./docs/07-ec2-launch-template-asg.md)** - Step 7: Launch Templates, Multi-AZ Auto Scaling Groups & Self-Healing tests.
9. 🌍 **[08-route53-and-https.md](./docs/08-route53-and-https.md)** - Step 8: Route 53 DNS Alias records and ACM SSL/TLS certificates (HTTPS).
10. 📊 **[09-cloudwatch-monitoring.md](./docs/09-cloudwatch-monitoring.md)** - Step 9: CloudWatch CPU alarms, SNS email notifications & live command dashboard.
11. 💰 **[10-cost-management-cleanup.md](./docs/10-cost-management-cleanup.md)** - Step 10: \$1.00 budget alerts, staying 100% Free Tier & safe teardown checklist.
12. 💼 **[11-interview-masterclass.md](./docs/11-interview-masterclass.md)** - Step 11: 15 Cloud Architecture interview questions, elevator pitch & resume points.

---

🎉 **Ready to start? Begin with Step 1:**  
👉 **[docs/01-docker-hub-images.md](./docs/01-docker-hub-images.md)**
