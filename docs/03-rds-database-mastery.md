# 🐘 Step 3: Amazon RDS PostgreSQL (Managed Database Mastery)

Welcome to Day 3! 🐘  
In this step, you will provision an **Amazon RDS (Relational Database Service)** instance.

---

## ❓ Why Not Just Run PostgreSQL Inside a Docker Container on EC2?

In development or small side-projects (like Project 3), running Postgres in Docker is fine. But in enterprise production, **doing that is dangerous**:
- If the EC2 instance gets terminated or corrupted, you lose your data.
- You have to manually manage backups, cron jobs, disk space, and OS patches.

### 🌟 Why Amazon RDS is the Industry Standard:

```
          RAW POSTGRES ON EC2 ❌                     AMAZON RDS POSTGRESQL  
┌────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│ • You manage backups manually          │ │ • Automated daily snapshots & backups  │
│ • Single point of failure              │ │ • Multi-AZ synchronous standby replica │
│ • Manual security patching             │ │ • Automated OS & security patches      │
│ • Difficult to scale storage           │ │ • Storage autoscaling up to 64 TB      │
│ • No automated failover                │ │ • 60-second automated failover         │
└────────────────────────────────────────┘ └────────────────────────────────────────┘
```

---

## 🧩 What is an RDS DB Subnet Group?

Amazon RDS requires you to define a **DB Subnet Group**.  
A DB Subnet Group tells RDS: *"Here are the private subnets across at least 2 Availability Zones where you are allowed to place the database and its standby replica."*

```
                 DB Subnet Group: production-db-subnet-group
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
Availability Zone A (us-east-1a)              Availability Zone B (us-east-1b)
┌───────────────────────────────┐             ┌───────────────────────────────┐
│ Private DB Subnet A           │             │ Private DB Subnet B           │
│ (10.0.21.0/24)                │             │ (10.0.22.0/24)                │
│                               │             │                               │
│  🐘 PRIMARY WRITER DB         │◄───────────►│  🐘 MULTI-AZ STANDBY REPLICA  │
│     (Active Instance)         │ Synchronous │     (Automated Failover)      │
└───────────────────────────────┘ Replication └───────────────────────────────┘
```

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create the DB Subnet Group
1. Open the [AWS RDS Console](https://console.aws.amazon.com/rds/).
2. In the left navigation menu, click **Subnet groups** $\rightarrow$ Click **Create DB subnet group**.
3. Details:
   - **Name**: `production-db-subnet-group`
   - **Description**: `Private database subnets in production VPC`
   - **VPC**: Select your `production-vpc`.
4. **Add subnets**:
   - **Availability Zones**: Select `us-east-1a` and `us-east-1b`.
   - **Subnets**: Select `10.0.21.0/24` (`private-db-subnet-1a`) and `10.0.22.0/24` (`private-db-subnet-1b`).
5. Click **Create** at the bottom! 🎉

---

### Part 2: Create the PostgreSQL Database (Free Tier)
1. In the left menu, click **Databases** $\rightarrow$ Click the orange **Create database** button.
2. Choose a database creation method: Select **Standard create**.
3. **Engine options**:
   - Engine type: Select **PostgreSQL** 🐘.
   - Version: Select `PostgreSQL 16.x` (or latest default).
4. **Templates**:
   - Select **Free tier** 🏷️ *(Crucial to avoid charges!)*.
5. **Settings**:
   - **DB instance identifier**: `production-postgres`
   - **Master username**: `postgres`
   - **Master password**: Enter a strong password (e.g., `SuperSecretPass123!`).
   - Confirm password.
6. **Instance configuration**:
   - DB instance class: `db.t3.micro` or `db.t4g.micro` *(Free tier eligible)*.
7. **Storage**:
   - Storage type: `gp3` (or `gp2`).
   - Allocated storage: `20` GiB.
   - Uncheck ❌ **Enable storage autoscaling** *(Helps prevent unexpected charges in learning mode)*.
8. **Connectivity**:
   - **Compute resource**: Select **Don't connect to an EC2 compute resource** *(We connect manually via our custom VPC!)*.
   - **Virtual private cloud (VPC)**: Select `production-vpc`.
   - **DB Subnet group**: Select `production-db-subnet-group`.
   - **Public access**: Select **No** 🔒 *(Ensures database has no public IP and cannot be reached from the internet!)*.
   - **VPC security group (firewall)**:
     - Remove `default`.
     - Select: `production-rds-db-sg` 🛡️ *(The firewall we chained in Step 2!)*.
9. **Database authentication**:
   - Select **Password authentication**.
10. **Additional configuration (Expand this section!)**:
    - **Initial database name**: Type `devops_db` ⚠️ *(If you leave this empty, RDS will not create a database schema!)*.
    - **Backup retention period**: `7` days.
    - Uncheck ❌ **Enable Performance Insights** and **Enhanced monitoring** to stay strictly within Free Tier limits.
11. Click the orange **Create database** button! 🚀

---

## 📋 Copying Your RDS Endpoint

RDS takes about 5 to 10 minutes to provision. Once its status turns to **Available** 🟢:
1. Click on `production-postgres`.
2. Under the **Connectivity & security** tab, look for **Endpoint**:
   - Example: `production-postgres.c123456789.us-east-1.rds.amazonaws.com`
   - Port: `5432`
3. Copy this endpoint! This is the hostname your EC2 instances use to communicate with the database.

---

## 🔍 Checkpoints: How to Verify & See RDS Running

### 1. Verify RDS Instance Status is "Available"
- In the **Amazon RDS** $\rightarrow$ **Databases** dashboard, verify:
  - **Status**: `Available` 🟢
  - **Role**: `Primary`
  - **Engine**: `PostgreSQL 16.x`

### 2. Test Connection from an EC2 Instance
Connect to one of your EC2 instances in the private app subnet and run our test script:
```bash
# 1. Export your RDS credentials
export DB_HOST="production-postgres.c123456789.us-east-1.rds.amazonaws.com"
export DB_PORT=5432
export DB_USER="postgres"
export DB_PASSWORD="YourActualPassword123"
export DB_NAME="devops_db"

# 2. Test port connectivity
nc -zv $DB_HOST 5432
# Output: Connection to production-postgres... 5432 port [tcp/postgresql] succeeded! 🎉

# 3. Or run our Node.js test script:
cd /home/ubuntu/app
node test-rds-connection.js
```
*Expected Output*:
```text
🔍 Attempting to connect to Amazon RDS at: production-postgres...:5432...
🎉 SUCCESS: Successfully connected to Amazon RDS PostgreSQL!
⏰ RDS Server Time: 2026-09-24 16:30:00
🐘 PostgreSQL Version: PostgreSQL 16.2
```

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: DB Subnet Group Across Multi-AZ Private Subnets
<!-- Replace with your screenshot path once taken -->
![DB Subnet Group](./screenshots/12-rds-db-subnet-group.png)
*Caption: production-db-subnet-group showing private-db-subnet-1a and 1b attached.*

### 🖼️ Screenshot 2: Amazon RDS PostgreSQL Instance Available
<!-- Replace with your screenshot path once taken -->
![RDS PostgreSQL Available](./screenshots/13-rds-postgres-available.png)
*Caption: production-postgres status Available, private VPC endpoint, and production-rds-db-sg attached.*

---

## ⏭️ Ready for Day 4?
Now let's store these credentials securely in AWS Secrets Manager and configure EC2 IAM authentication:  
👉 **[Go to Step 4: 04-s3-and-secrets-manager.md](./04-s3-and-secrets-manager.md)**
