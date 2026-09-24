# 🔐 Step 7: AWS Secrets Manager & Amazon S3 Integration

Welcome to Day 7! 🔐  
In this step, you will eliminate hardcoded passwords forever using **AWS Secrets Manager** and learn how to manage cloud storage with **Amazon S3**.

---

## 🚫 The Cardinal Sin of Cloud Security: Hardcoded Credentials

Have you ever seen this in a Git commit?
```javascript
const dbPassword = "SuperSecretPassword123!"; // ❌ DANGEROUS!
```
Automated scanner bots comb public GitHub commits every 2 seconds. If you commit database credentials or AWS API keys, your cloud accounts will be compromised!

### 💡 The Solution: AWS Secrets Manager + IAM Roles

```
┌─────────────────────────────────┐
│     [AWS Secrets Manager]       │
│  Stores: DB_HOST, DB_PASSWORD   │
│  Encrypted by AWS KMS 🔐        │
└────────────────┬────────────────┘
                 │
                 │ 1. EC2 Instance assumes IAM Role
                 │ 2. Fetches secrets at boot time
                 ▼
┌─────────────────────────────────┐
│  [EC2 Instance - Auto Scaling]  │
│  (Zero plain-text keys saved!)  │
└─────────────────────────────────┘
```

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Store Credentials in AWS Secrets Manager
1. Open the [AWS Secrets Manager Console](https://console.aws.amazon.com/secretsmanager/).
2. Click the orange **Store a new secret** button.
3. Secret type:
   - Select **Credentials for Amazon RDS database** 🐘.
   - **User name**: `postgres`
   - **Password**: Your RDS database password.
   - **Encryption key**: Select `aws/secretsmanager` (Default).
   - **Database**: Select your database: `production-postgres`.
4. Click **Next**.
5. Configure secret:
   - **Secret name**: `production/database/credentials`
   - **Description**: `PostgreSQL production database credentials`
6. Click **Next** $\rightarrow$ Click **Next** (leave automatic rotation optional) $\rightarrow$ Click **Store**! 🔒

---

### Part 2: Create an IAM Role for EC2 (Zero-Key Authentication)
Instead of typing AWS credentials inside the EC2 server, EC2 can wear an **IAM Role** like a badge of authority:

1. Open the [AWS IAM Console](https://console.aws.amazon.com/iam/).
2. In the left menu, click **Roles** $\rightarrow$ Click **Create role**.
3. Trusted entity type:
   - Select **AWS service**.
   - Use case: Select **EC2** $\rightarrow$ Click **Next**.
4. Add permissions:
   - In the search box, search for: `SecretsManagerReadWrite`.
   - Check the box ✅ `SecretsManagerReadWrite`.
   - Click **Next**.
5. Role details:
   - **Role name**: `production-ec2-secrets-role`
   - **Description**: `Allows EC2 to read database credentials from Secrets Manager`
6. Click **Create role**! 🎉

#### 💡 Attach IAM Role to Launch Template:
1. Go back to [EC2 Launch Templates](https://console.aws.amazon.com/ec2/home#LaunchTemplates:).
2. Select `production-app-template` $\rightarrow$ Click **Actions** $\rightarrow$ **Modify template (Create new version)**.
3. Under **Advanced details**:
   - **IAM instance profile**: Select `production-ec2-secrets-role`!
4. Click **Create template version**.

---

### Part 3: How EC2 Retrieves the Secret at Startup (The Magic Script)
When the EC2 instance boots up, its User Data script runs these commands to pull the secret:

```bash
# 1. Fetch secret from Secrets Manager using the IAM role
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id production/database/credentials \
  --query SecretString \
  --output text \
  --region us-east-1)

# 2. Extract database host and password into .env
echo "DB_HOST=$(echo $SECRET_JSON | jq -r '.host')" >> /home/ubuntu/app/.env
echo "DB_PASSWORD=$(echo $SECRET_JSON | jq -r '.password')" >> /home/ubuntu/app/.env
echo "DB_USER=$(echo $SECRET_JSON | jq -r '.username')" >> /home/ubuntu/app/.env
echo "DB_NAME=devops_db" >> /home/ubuntu/app/.env
```

---

## 🔍 Checkpoints: How to Verify & See It Running

1. **Test Secret Retrieval from EC2 Terminal**:
   SSH or EC2 Instance Connect into your EC2 server and test:
   ```bash
   aws secretsmanager get-secret-value \
     --secret-id production/database/credentials \
     --region us-east-1
   ```
   *Expected Output*: Returns your secret JSON with username, password, and host! 🟢

2. **Verify Zero Passwords on Disk**:
   Notice that the launch template contains **zero plain-text passwords**. Only the secret ID is referenced!

---

### Part 4: Storing Static Assets & Backups in Amazon S3
Amazon S3 (Simple Storage Service) is the cloud's infinite hard drive:

1. Open the [Amazon S3 Console](https://console.aws.amazon.com/s3/).
2. Click the orange **Create bucket** button.
3. General configuration:
   - **Bucket name**: `production-app-assets-yourname-2026` *(Must be globally unique!)*.
   - **AWS Region**: Select your region (e.g. `us-east-1`).
4. **Block Public Access settings for this bucket**:
   - Keep ✅ **Block *all* public access** checked! *(Never expose private buckets to the public internet!)*.
5. **Bucket Versioning**:
   - Select **Enable** *(Protects against accidental deletion of files)*.
6. Click **Create bucket**! 📦

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: Database Secret Stored in AWS Secrets Manager
<!-- Replace with your screenshot path once taken -->
![Secrets Manager](./screenshots/17-secrets-manager-stored.png)
*Caption: AWS Secrets Manager showing production/database/credentials with KMS encryption enabled.*

### 🖼️ Screenshot 2: IAM Role Created for EC2 Instance Profile
<!-- Replace with your screenshot path once taken -->
![IAM Role for EC2](./screenshots/18-iam-role-secrets-manager.png)
*Caption: IAM role production-ec2-secrets-role showing SecretsManagerReadWrite policy attached.*

### 🖼️ Screenshot 3: Private S3 Bucket Created
<!-- Replace with your screenshot path once taken -->
![S3 Bucket](./screenshots/19-s3-bucket-created.png)
*Caption: S3 console displaying private bucket with Block All Public Access active.*

---

## ⏭️ Ready for Day 8?
Learn how to monitor metrics and set up automated CloudWatch alerts:  
👉 **[Go to Step 8: 08-cloudwatch-monitoring.md](./08-cloudwatch-monitoring.md)**
