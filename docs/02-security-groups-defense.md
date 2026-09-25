# 🛡️ Step 2: Layered Security Groups (Zero-Trust Defense)

🎯 **Mission**: Build a 3-tier firewall defense chain where the Load Balancer is public, but EC2 instances and the database only accept internal traffic from each other.

---

## 💡 The Concept: "Chained" Security Groups

Instead of opening ports to IP addresses, we use **Security Group Chaining**:

```
THE INTERNET (0.0.0.0/0)
          │
          │ Allows HTTP (80) & HTTPS (443) ONLY
          ▼
┌──────────────────────────────────────┐
│  [1. production-alb-sg]              │ 🌐 Public Entry Point
└──────────────────┬───────────────────┘
                   │
                   │ Allows Port 80 & 5000 ONLY from [production-alb-sg]
                   ▼
┌──────────────────────────────────────┐
│  [2. production-ec2-app-sg]          │ 💻 Application Fleet
└──────────────────┬───────────────────┘
                   │
                   │ Allows Port 5432 ONLY from [production-ec2-app-sg]
                   ▼
┌──────────────────────────────────────┐
│  [3. production-rds-db-sg]           │ 🐘 Private Database Vault
└──────────────────────────────────────┘
```

> [!IMPORTANT]
> **Why is this so secure?**  
> We never type an IP address in the database firewall. Only servers that belong to `production-ec2-app-sg` are physically capable of sending data to the database!

---

## 📋 Copy-Paste Security Group Rules

| Security Group Name | Inbound Port | Allowed Source | Purpose |
| :--- | :--- | :--- | :--- |
| **`production-alb-sg`** | `80` (HTTP) & `443` (HTTPS) | `0.0.0.0/0` (Anywhere) | Lets users visit your website |
| **`production-ec2-app-sg`** | `80` & `5000` | `production-alb-sg` | Accepts traffic forwarded by the ALB |
| **`production-rds-db-sg`** | `5432` (PostgreSQL) | `production-ec2-app-sg` | Accepts queries strictly from your app servers |

---

## 🖱️ Step-by-Step AWS Console Recipe

### 1. Create `production-alb-sg` (Load Balancer SG)
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/) $\rightarrow$ click **Security Groups**.
2. Click **Create security group**.
3. **Name**: `production-alb-sg` | **VPC**: `production-vpc`.
4. **Inbound rules** $\rightarrow$ Click **Add rule**:
   - Rule 1: Type: `HTTP` | Port: `80` | Source: `Anywhere-IPv4` (`0.0.0.0/0`)
   - Rule 2: Type: `HTTPS` | Port: `443` | Source: `Anywhere-IPv4` (`0.0.0.0/0`)
5. Click **Create security group**.

---

### 2. Create `production-ec2-app-sg` (Application SG)
1. Click **Create security group**.
2. **Name**: `production-ec2-app-sg` | **VPC**: `production-vpc`.
3. **Inbound rules** $\rightarrow$ Click **Add rule**:
   - Rule 1: Type: `Custom TCP` | Port: `80` | Source: Type `production-alb-sg` and select its SG ID (`sg-xxxx`)!
   - Rule 2: Type: `Custom TCP` | Port: `5000` | Source: Select `production-alb-sg`!
   - Rule 3 (Optional SSH/Connect): Type: `SSH` | Port: `22` | Source: `My IP` (or `0.0.0.0/0` if using EC2 Instance Connect).
4. Click **Create security group**.

---

### 3. Create `production-rds-db-sg` (Database SG)
1. Click **Create security group**.
2. **Name**: `production-rds-db-sg` | **VPC**: `production-vpc`.
3. **Inbound rules** $\rightarrow$ Click **Add rule**:
   - Rule 1: Type: `PostgreSQL` | Port: `5432` | Source: Type `production-ec2-app-sg` and select its SG ID!
4. Click **Create security group**.

---

## 🔍 Checkpoints: How to Verify

1. Click on `production-ec2-app-sg` $\rightarrow$ **Inbound rules**:
   - Confirm the source column shows the Security Group ID of `production-alb-sg` (e.g. `sg-0abc123...`).
2. Click on `production-rds-db-sg` $\rightarrow$ **Inbound rules**:
   - Confirm the source column shows `production-ec2-app-sg`.
   - Confirm there is **no rule** for `0.0.0.0/0`! 🔒

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

Now let's provision our managed database on Amazon RDS:  
👉 **[Go to Step 3: 03-rds-database-mastery.md](./03-rds-database-mastery.md)**
