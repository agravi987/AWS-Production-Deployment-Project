# 🐘 Step 3: Amazon RDS PostgreSQL (Managed Database Mastery)

Welcome to **Step 3**! 🐘  
In this step, you will provision an **Amazon RDS (Relational Database Service)** PostgreSQL instance.  
By building the database now, we guarantee that the database endpoint exists **before** our application servers launch, completely solving the chicken-and-egg dependency dilemma!

---

## ❓ Why Use Amazon RDS Instead of Postgres in a Container on EC2?

In local development, running PostgreSQL inside a Docker container is convenient. But in enterprise cloud production:

- If your EC2 instance crashes or auto-scales down, your database data is destroyed.
- Manual backups, disk resizing, operating system patching, and failovers require constant operational overhead.

### 🌟 Why Amazon RDS is the Production Standard:

```
          RAW POSTGRES ON EC2 ❌                     AMAZON RDS POSTGRESQL
┌────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│ • Manual backup cron jobs required     │ │ • Automated daily snapshots & point-in-│
│ • Single point of failure              │ │   time recovery (up to 35 days)        │
│ • Manual OS and engine security patches│ │ • Multi-AZ automated synchronous       │
│ • Hard drive disk resizing is risky    │ │   standby replica failover (< 60s)     │
│ • No built-in automated failover       │ │ • Automated security patches & storage │
└────────────────────────────────────────┘ └────────────────────────────────────────┘
```

---

## 🧩 What is an RDS DB Subnet Group?

Amazon RDS requires a **DB Subnet Group**.  
A DB Subnet Group instructs RDS: _"Place this database across these private subnets in at least two Availability Zones."_

```
                 DB Subnet Group: production-db-subnet-group
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
Availability Zone A (us-east-1a)              Availability Zone B (us-east-1b)
┌───────────────────────────────┐             ┌───────────────────────────────┐
│ Private DB Subnet 1A          │             │ Private DB Subnet 1B          │
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
3. Fill in basic details:
   - **Name**: `production-db-subnet-group`
   - **Description**: `Private database subnets for production PostgreSQL`
   - **VPC**: Select your `production-vpc`.
4. **Add subnets**:
   - **Availability Zones**: Select both AZs (e.g., `us-east-1a` and `us-east-1b`).
   - **Subnets**: Check both private database subnets:
     - `private-db-subnet-1a` (`10.0.21.0/24`)
     - `private-db-subnet-1b` (`10.0.22.0/24`)
5. Click **Create**! 🚀

---

### Part 2: Create the Amazon RDS PostgreSQL Database

1. In the left menu, click **Databases** $\rightarrow$ Click **Create database**.
2. **Choose a database creation method**: Select **Standard create**.
3. **Engine options**:
   - Engine type: **PostgreSQL** 🐘
   - Version: Select latest recommended (e.g. `PostgreSQL 16.x`).
4. **Templates**:
   - Select **Free tier** 🟢 _(Ensures zero unexpected costs!)_.
5. **Settings**:
   - **DB instance identifier**: `production-postgres`
   - **Master username**: `postgres`
   - **Master password**: Enter a strong password (e.g. `DevOpsMaster2026!`) and confirm it. _(Remember this password for Step 4!)_
6. **Instance configuration**:
   - DB instance class: Select **Burstable classes** $\rightarrow$ `db.t3.micro` or `db.t4g.micro` (Free-tier eligible).
7. **Storage**:
   - Allocated storage: `20` GiB (General Purpose SSD gp3).
   - Storage autoscaling: Uncheck "Enable storage autoscaling" for Free Tier budget control.
8. **Connectivity**:
   - **Virtual private cloud (VPC)**: Select `production-vpc`.
   - **DB Subnet group**: Select `production-db-subnet-group`.
   - **Public access**: Select **No** 🔒 _(Strictly private; isolated from the public internet!)_.
   - **VPC security group (firewall)**:
     - Choose **Select existing**.
     - Remove the default SG and select: `production-rds-db-sg` 🛡️.
9. **Database authentication**: Select **Password authentication**.
10. **Additional configuration** (Expand):
    - **Initial database name**: `devops_db` _(Very important: Our backend connects to devops_db!)_.
    - Automated backups: Enabled (Default 7 days).
11. Scroll to the bottom and click **Create database**! 🎉

> [!NOTE]
> Amazon RDS takes about 5 to 10 minutes to allocate hardware, initialize PostgreSQL, and create the storage volumes. You can grab a coffee while it transitions from _Creating_ to _Available_! ☕

---

## 🔍 Checkpoints: How to Verify & Copy Your Database Endpoint

### 1. Confirm RDS Status is Available

- In the RDS Console, click **Databases**.
- Wait until the **Status** column for `production-postgres` turns green: **Available** 🟢.

### 2. Copy the Database Endpoint

- Click on `production-postgres`.
- Under the **Connectivity & security** tab, find **Endpoint**:
  ```text
  production-postgres.c123456789.us-east-1.rds.amazonaws.com
  ```
- **Copy this endpoint string!** You will store this into AWS Secrets Manager in Step 4.

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: DB Subnet Group Configured Across Private Subnets

![DB Subnet Group Configured Across Private Subnets](image.png)

### 🖼️ Screenshot 2: Amazon RDS PostgreSQL Instance Available

![Amazon RDS PostgreSQL Instance Available](image-1.png)

## ⏭️ Ready for Step 4?

Now let's store your RDS endpoint and database password into AWS Secrets Manager:  
👉 **[Go to Step 4: 04-s3-and-secrets-manager.md](./04-s3-and-secrets-manager.md)**
