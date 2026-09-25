# 🐘 Step 3: Amazon RDS PostgreSQL (Database Mastery)

🎯 **Mission**: Launch a managed **Amazon RDS PostgreSQL** database in private database subnets and copy the generated database endpoint.

---

## 💡 The Concept: Why RDS Instead of Docker for Databases?

In production, running a database inside a temporary EC2 container is dangerous—if the server crashes, you can lose all user data.  
**Amazon RDS** automatically handles:
- Daily automated snapshots and backups
- Storage auto-expansion
- Automated security patching
- Multi-AZ failover replicas

---

## 📋 Copy-Paste Configuration Table

| Setting | Value to Choose | Why |
| :--- | :--- | :--- |
| **Engine** | **PostgreSQL** | Industry standard relational database |
| **Template** | **Free tier** 🟢 | Guarantees $0.00 cost |
| **DB Identifier** | `production-postgres` | Name of your database instance |
| **Master Username** | `postgres` | Default administrative user |
| **Master Password** | *Choose your password* (e.g. `DevOpsMaster2026!`) | 🔑 **Remember this password!** |
| **Instance Class** | `db.t3.micro` or `db.t4g.micro` | Free Tier eligible compute |
| **VPC** | `production-vpc` | Placed inside your custom network |
| **DB Subnet Group** | `production-db-subnet-group` | Placed across private DB subnets |
| **Public Access** | **No** 🔒 | Strictly isolated from the internet |
| **VPC Security Group** | `production-rds-db-sg` | Allows access only from EC2 app servers |
| **Initial Database Name** | `devops_db` | ⚠️ **Must be `devops_db` for application backend** |

---

## 🖱️ Step-by-Step AWS Console Recipe

### 1. Create DB Subnet Group
1. Open the [AWS RDS Console](https://console.aws.amazon.com/rds/) $\rightarrow$ click **Subnet groups**.
2. Click **Create DB subnet group**:
   - **Name**: `production-db-subnet-group`
   - **VPC**: Select `production-vpc`.
   - **Availability Zones**: Select both AZs (`us-east-1a` and `us-east-1b`).
   - **Subnets**: Check both private DB subnets (`private-db-subnet-1a` and `private-db-subnet-1b`).
3. Click **Create**.

---

### 2. Create the PostgreSQL Database
1. In the left RDS menu, click **Databases** $\rightarrow$ Click **Create database**.
2. Method: **Standard create** | Engine: **PostgreSQL**.
3. Templates: Select **Free tier** 🟢.
4. Settings:
   - DB instance identifier: `production-postgres`
   - Master username: `postgres`
   - Master password: Enter your password (e.g. `DevOpsMaster2026!`) and confirm it.
5. Instance configuration: `db.t3.micro` or `db.t4g.micro`.
6. Storage: `20` GiB (Uncheck "Enable storage autoscaling" for budget control).
7. Connectivity:
   - VPC: `production-vpc`
   - DB Subnet group: `production-db-subnet-group`
   - Public access: **No** 🔒
   - Security group: Choose **Select existing** $\rightarrow$ remove default and choose `production-rds-db-sg`.
8. Additional configuration (Expand at the bottom):
   - Initial database name: `devops_db`
9. Click **Create database**! 🚀  
   *(Takes 5 to 10 minutes to initialize and become Available).*

---

## 🔍 Checkpoints: How to Verify & Copy Your Endpoint

1. In the RDS Console $\rightarrow$ click **Databases**.
2. Wait until the Status column for `production-postgres` turns **Available** 🟢.
3. Click on `production-postgres` $\rightarrow$ under **Connectivity & security**, locate **Endpoint**:
   ```text
   production-postgres.c123456789.us-east-1.rds.amazonaws.com
   ```
4. 📋 **Copy this endpoint string!** You will store it in AWS Secrets Manager in Step 4.

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: RDS DB Subnet Group
<!-- Capture screenshot in RDS console under Subnet Groups -->
`docs/screenshots/12-rds-db-subnet-group.png`

### 🖼️ Screenshot 2: Amazon RDS Instance Available
<!-- Capture screenshot in RDS console showing Available status and Endpoint -->
`docs/screenshots/13-rds-postgres-available.png`

---

## ⏭️ Ready for Step 4?

Now let's store your RDS endpoint and password securely in AWS Secrets Manager:  
👉 **[Go to Step 4: 04-s3-and-secrets-manager.md](./04-s3-and-secrets-manager.md)**
