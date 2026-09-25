# 🔐 Step 4: AWS Secrets Manager & S3 Storage

🎯 **Mission**: Store your database credentials in **AWS Secrets Manager** and create an **IAM Role** so your EC2 application servers can fetch them at boot time with zero hardcoded passwords.

---

## 💡 The Concept: Zero-Secret Hardcoding

If you write database passwords into a Git repository or plaintext script, scanners will steal them.  
With **AWS Secrets Manager + IAM Roles**:
1. You store the RDS endpoint and password in an encrypted vault.
2. The EC2 instance assumes an **IAM Role** (like an employee badge).
3. The instance reads the database credentials securely at boot time without saving any secret keys on disk!

---

## 📋 Copy-Paste Configuration Table

| Resource | Name to Use | Key Values |
| :--- | :--- | :--- |
| **AWS Secret** | `production/database/credentials` | User: `postgres`, Password: *Your DB Password*, DB: `production-postgres` |
| **IAM Role** | `production-ec2-secrets-role` | Use case: **EC2**, Policy: `SecretsManagerReadWrite` |
| **S3 Bucket** | `production-app-assets-yourname` | Region: `us-east-1`, Block Public Access: **Checked** ✅ |

---

## 🖱️ Step-by-Step AWS Console Recipe

### 1. Store Credentials in Secrets Manager
1. Open the [AWS Secrets Manager Console](https://console.aws.amazon.com/secretsmanager/).
2. Click **Store a new secret**.
3. Choose **Credentials for Amazon RDS database** 🐘:
   - User name: `postgres`
   - Password: Enter your master RDS password from Step 3.
   - Encryption key: `aws/secretsmanager` (Default).
   - Database: Select `production-postgres`.
4. Click **Next**.
5. **Secret name**: `production/database/credentials` *(Use this exact name!)*.
6. Click **Next** $\rightarrow$ Click **Next** through rotation $\rightarrow$ Click **Store**! 🔒

---

### 2. Create IAM Role for EC2
1. Open the [AWS IAM Console](https://console.aws.amazon.com/iam/) $\rightarrow$ click **Roles**.
2. Click **Create role**:
   - Trusted entity: **AWS service** $\rightarrow$ Use case: **EC2**.
   - Click **Next**.
3. Add permissions:
   - In the search bar, type: `SecretsManagerReadWrite`.
   - Check the box ✅ `SecretsManagerReadWrite`.
   - Click **Next**.
4. Role details:
   - **Role name**: `production-ec2-secrets-role`
5. Click **Create role**! 🎉

---

### 3. Create Private S3 Bucket (Optional Cloud Storage)
1. Open the [Amazon S3 Console](https://console.aws.amazon.com/s3/).
2. Click **Create bucket**:
   - **Bucket name**: `production-app-assets-devops-yourname` *(Must be globally unique!)*.
   - Region: Same region (e.g. `us-east-1`).
   - Block Public Access: Keep ✅ **Block *all* public access** checked!
3. Click **Create bucket**! 📦

---

## 🔍 Checkpoints: How to Verify

1. In the Secrets Manager Console, click `production/database/credentials`.
2. Click **Retrieve secret value**:
   - You should see `username`, `password`, and `host` (your RDS endpoint) listed cleanly!

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: Database Secret Stored
<!-- Capture screenshot in Secrets Manager showing production/database/credentials -->
`docs/screenshots/17-secrets-manager-stored.png`

### 🖼️ Screenshot 2: IAM Role Created
<!-- Capture screenshot in IAM console showing production-ec2-secrets-role -->
`docs/screenshots/18-iam-role-secrets-manager.png`

---

## ⏭️ Ready for Step 5?

Now let's configure your Application Load Balancer and health checks:  
👉 **[Go to Step 5: 05-application-load-balancer.md](./05-application-load-balancer.md)**
