# 🗺️ Master Roadmap: AWS Production 3-Tier Deployment

Welcome to **Project 4: AWS Production Deployment**! ☁️✨  
This roadmap guides you through building a **highly available, fault-tolerant, secure, and auto-scaling production architecture** on Amazon Web Services using the **AWS Management Console**.

---

## 🎯 The Architectural Blueprint & Execution Sequence

![AWS Production Deployment Workflow and Architecture Roadmap](./aws-deployment-workflow.jpg)

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

## 🔄 Core Workflows: How the Cloud System Operates

1. **Traffic Ingress Workflow**:
   $$\text{Browser / Client} \longrightarrow \text{Route 53 (DNS)} \longrightarrow \text{ALB (Public Subnet, HTTPS)} \longrightarrow \text{EC2 Instances (Private Subnet)} \longrightarrow \text{RDS PostgreSQL (Private DB Subnet)}$$
2. **Dynamic Bootstrap & Zero-Secret Injection Workflow**:
   $$\text{EC2 Boots via ASG} \longrightarrow \text{User Data runs} \longrightarrow \text{Queries AWS Secrets Manager via IAM Role} \longrightarrow \text{Injects credentials into .env} \longrightarrow \text{Starts Docker Containers}$$
3. **Auto-Healing & Fault-Tolerance Workflow**:
   $$\text{ALB pings /api/health} \longrightarrow \text{Instance crashes or fails} \longrightarrow \text{Target Group marks unhealthy} \longrightarrow \text{ASG terminates failed EC2} \longrightarrow \text{ASG launches healthy replacement}$$

---

## 🔢 The 10-Step Sequential Build Curriculum

To eliminate dependency deadlocks (such as needing the RDS endpoint before creating the EC2 Launch Template), follow this exact order:

| Step | Guide | What You Will Build | Key Outcome |
| :---: | :--- | :--- | :--- |
| **01** | **[01-vpc-and-networking.md](./01-vpc-and-networking.md)** | Custom VPC (`10.0.0.0/16`), 6 Subnets across 2 AZs, IGW & Route Tables | Isolated private network foundation |
| **02** | **[02-security-groups-defense.md](./02-security-groups-defense.md)** | 3 Layered Security Groups (`alb-sg` $\rightarrow$ `ec2-app-sg` $\rightarrow$ `rds-db-sg`) | Zero-trust firewall chain |
| **03** | **[03-rds-database-mastery.md](./03-rds-database-mastery.md)** | DB Subnet Group & Amazon RDS PostgreSQL in Private DB Subnets | Database provisioned & endpoint ready |
| **04** | **[04-s3-and-secrets-manager.md](./04-s3-and-secrets-manager.md)** | AWS Secrets Manager secret (`production/database/credentials`) + IAM Role | Zero hardcoded passwords |
| **05** | **[05-application-load-balancer.md](./05-application-load-balancer.md)** | Target Group (`/api/health`) & Application Load Balancer across Public Subnets | Traffic director ready for compute fleet |
| **06** | **[06-ec2-launch-template-asg.md](./06-ec2-launch-template-asg.md)** | EC2 Launch Template with dynamic bootstrap + Auto Scaling Group | Multi-AZ auto-healing app fleet |
| **07** | **[07-route53-and-https.md](./07-route53-and-https.md)** | Amazon Route 53 Custom Domain + Free ACM SSL/TLS Certificate | Secure HTTPS & custom domain |
| **08** | **[08-cloudwatch-monitoring.md](./08-cloudwatch-monitoring.md)** | CloudWatch CPU Alarms (>70%), SNS Email Alerts & Live Dashboard | Observability and incident monitoring |
| **09** | **[09-cost-management-cleanup.md](./09-cost-management-cleanup.md)** | \$1.00 Budget Alarm & Safe Reverse-Order Teardown Checklist | 100% Free Tier compliance & cleanup |
| **10** | **[10-interview-masterclass.md](./10-interview-masterclass.md)** | 15 Cloud Architect interview questions, elevator pitch & resume bullets | Career portfolio & interview readiness |

---

## 📸 Proof-of-Work Verification Summary

As you progress through each step, confirm your architecture using the embedded checkpoints and screenshots:
- **Networking**: VPC Resource Map and Subnets verified in Step 1.
- **Firewalls**: Security Group rules chained in Step 2.
- **Database**: Amazon RDS status *Available* and connectivity test in Step 3.
- **Secrets**: Encrypted credentials in Secrets Manager & IAM instance profile attached in Step 4.
- **Traffic Routing**: ALB status *Active* and Target Group in Step 5 (`image.png`, `image-1.png`).
- **Compute**: Auto-healing instances running in Step 6 (`image-2.png`, `image-3.png`, `image-4.png`).
- **Security**: HTTPS padlock and valid ACM certificate in Step 7.
- **Operations**: Stress-tested CloudWatch alarms and email alerts in Step 8.

---

## 🚀 Let's Get Started!

Begin with your custom network foundation:  
👉 **[Start Step 1: 01-vpc-and-networking.md](./01-vpc-and-networking.md)**
