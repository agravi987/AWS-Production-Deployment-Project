# 🗺️ 7-Day AWS Production Architecture Roadmap

Welcome to **Project 4: AWS Production Deployment**! ☁️✨  
In this project, you will build an **enterprise-grade, production-style cloud architecture** on Amazon Web Services using the **AWS Management Console**.

---

## 🎯 The Big Picture Architecture

```
                    Internet 🌐
                       │
                       ▼
                 Route 53 (DNS) 🌍
                       │
                       ▼
                HTTPS / SSL (ACM) 🔒
                       │
                       ▼
          Application Load Balancer (ALB) ⚖️
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
    EC2 Instance #1       EC2 Instance #2
    (Auto Scaling - AZ-A) (Auto Scaling - AZ-B)
             │                   │
             └─────────┬─────────┘
                       ▼
               Amazon RDS (PostgreSQL) 🐘
            (Multi-AZ Automated Backups)
```

---

## 🗓️ Day-by-Day Milestone Plan

### 📍 Day 1: Virtual Private Cloud (VPC) & Networking 🌐
- [ ] Read **[01-vpc-and-networking.md](./01-vpc-and-networking.md)**
- [ ] Understand why we NEVER deploy directly into the Default VPC.
- [ ] Create a custom VPC (`10.0.0.0/16`).
- [ ] Create 6 Subnets across 2 Availability Zones (`us-east-1a` and `us-east-1b`).
- [ ] Attach an Internet Gateway (IGW) and configure Route Tables.
- 🎯 **Milestone**: You have built an isolated cloud network with public and private boundaries!

---

### 📍 Day 2: Layered Security Groups (Zero-Trust Defense) 🛡️
- [ ] Read **[02-security-groups-defense.md](./02-security-groups-defense.md)**
- [ ] Understand the security chain: `ALB SG ──► EC2 App SG ──► RDS Database SG`.
- [ ] Create the ALB Security Group (Allows Ports 80 & 443 from Internet).
- [ ] Create the EC2 App Security Group (Allows Ports 80 & 5000 **ONLY** from ALB SG).
- [ ] Create the RDS Security Group (Allows Port 5432 **ONLY** from EC2 App SG).
- 🎯 **Milestone**: You engineered an enterprise firewall chain where hackers cannot touch your backend or database directly!

---

### 📍 Day 3: Amazon RDS Managed Database 🐘
- [ ] Read **[05-rds-database-mastery.md](./05-rds-database-mastery.md)**
- [ ] Create an RDS DB Subnet Group across private database subnets.
- [ ] Launch a Free-Tier PostgreSQL RDS instance.
- [ ] Understand automated snapshots, maintenance windows, and Multi-AZ failover.
- 🎯 **Milestone**: Your production database is provisioned and securely isolated from the internet!

---

### 📍 Day 4: Application Load Balancer (ALB) ⚖️
- [ ] Read **[03-application-load-balancer.md](./03-application-load-balancer.md)**
- [ ] Create an ALB Target Group with HTTP health check (`/api/health`).
- [ ] Launch an internet-facing Application Load Balancer across Public Subnets.
- [ ] Configure listener routing rules.
- 🎯 **Milestone**: Traffic is distributed evenly across multiple Availability Zones!

---

### 📍 Day 5: EC2 Launch Templates & Auto Scaling Groups 📈
- [ ] Read **[04-ec2-launch-template-asg.md](./04-ec2-launch-template-asg.md)**
- [ ] Create an EC2 Launch Template with our User Data bootstrap script.
- [ ] Create an Auto Scaling Group (Minimum: 2, Desired: 2, Maximum: 4).
- [ ] Attach the Auto Scaling Group to the ALB Target Group.
- [ ] Test auto-healing: Terminate an EC2 instance and watch ASG automatically replace it! 🪄
- 🎯 **Milestone**: Your app is highly available, self-healing, and fault-tolerant!

---

### 📍 Day 6: Route 53, HTTPS (SSL) & Secrets Management 🌍🔒
- [ ] Read **[06-route53-and-https.md](./06-route53-and-https.md)**
- [ ] Read **[07-s3-and-secrets-manager.md](./07-s3-and-secrets-manager.md)**
- [ ] Request a free SSL certificate in AWS Certificate Manager (ACM).
- [ ] Configure Route 53 Alias record pointing to your ALB.
- [ ] Store database passwords in AWS Secrets Manager with zero hardcoded values.
- 🎯 **Milestone**: Your website is protected by green HTTPS padlock and custom domain!

---

### 📍 Day 7: CloudWatch Monitoring, Cleanup & Interview Mastery 📊💼
- [ ] Read **[08-cloudwatch-monitoring.md](./08-cloudwatch-monitoring.md)**
- [ ] Read **[09-cost-management-cleanup.md](./09-cost-management-cleanup.md)**
- [ ] Read **[10-interview-masterclass.md](./10-interview-masterclass.md)**
- [ ] Set up CloudWatch CPU alarms with email notifications (SNS).
- [ ] Review the safe teardown checklist so you never get unexpected AWS charges! 💰
- [ ] Practice the top 15 cloud architecture interview questions.
- 🎯 **Milestone**: You are fully qualified to talk about real cloud architecture in DevOps interviews!

---

## 🚀 Let's Begin!
👉 **[Start with Step 1: 01-vpc-and-networking.md](./01-vpc-and-networking.md)**
