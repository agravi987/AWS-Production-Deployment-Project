# 🔐 Step 4: AWS Secrets Manager & Amazon S3 Integration

Welcome to **Step 4**! 🔐  
In this step, you will eliminate hardcoded passwords forever using **AWS Secrets Manager** and create an **IAM Instance Profile** so your EC2 servers can securely fetch database credentials at boot time with **zero hardcoded keys**.

---

## 🚫 Why Hardcoding Passwords in User Data is Dangerous

If you put your database password or host endpoint directly inside a Git repository or plaintext script:
- Anyone with read access to the repo or launch template can read the credentials.
- Automated bots scan public commits 24/7.
- If you rotate your database password, you have to recreate or edit all scripts manually!

### 💡 The Solution: AWS Secrets Manager + EC2 IAM Role

```
┌─────────────────────────────────┐
│     [AWS Secrets Manager]       │
│  Secret:                        │
│  production/database/credentials│
│  (KMS Encrypted 🔐)             │
└────────────────┬────────────────┘
                 │
                 │ 1. EC2 boots and assumes IAM Role
                 │ 2. aws secretsmanager get-secret-value
                 ▼
┌─────────────────────────────────┐
│  [EC2 Auto Scaling Instance]    │
│  • Reads DB_HOST & DB_PASSWORD  │
│  • Generates /home/ubuntu/.env  │
│  • Starts containers cleanly!   │
└─────────────────────────────────┘
```

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Store Database Credentials in AWS Secrets Manager

1. Open the [AWS Secrets Manager Console](https://console.aws.amazon.com/secretsmanager/).
2. Click the orange **Store a new secret** button.
3. **Secret type**:
   - Choose **Credentials for Amazon RDS database** 🐘 (or **Other type of secret**).
   - If choosing **Credentials for Amazon RDS database**:
     - **User name**: `postgres`
     - **Password**: The master password you created in Step 3.
     - **Encryption key**: `aws/secretsmanager` (Default AWS managed key).
     - **Database**: Select `production-postgres`.
   - *(Alternatively, if using key/value pairs under "Other type of secret"):*
     - Key `DB_HOST`: `<paste your RDS endpoint from Step 3>`
     - Key `DB_PORT`: `5432`
     - Key `DB_USER`: `postgres`
     - Key `DB_PASSWORD`: `<your master password>`
     - Key `DB_NAME`: `devops_db`
4. Click **Next**.
5. **Configure secret**:
   - **Secret name**: `production/database/credentials` *(Exact name used by our user-data script!)*
   - **Description**: `PostgreSQL credentials for production application`
6. Click **Next** $\rightarrow$ Click **Next** through automatic rotation (keep disabled for simplicity) $\rightarrow$ Click **Store**! 🔒

---

### Part 2: Create an IAM Role for EC2

Your EC2 instances need AWS permission to read this secret. In AWS, you grant permissions using an **IAM Role**:

1. Open the [AWS IAM Console](https://console.aws.amazon.com/iam/).
2. In the left navigation menu, click **Roles** $\rightarrow$ Click **Create role**.
3. **Select trusted entity**:
   - Trusted entity type: **AWS service**
   - Use case: Select **EC2** $\rightarrow$ Click **Next**.
4. **Add permissions**:
   - In the search bar, type: `SecretsManagerReadWrite`.
   - Check the box ✅ `SecretsManagerReadWrite`.
   - *(Optional: Also search and check `CloudWatchAgentServerPolicy` for metrics)*.
   - Click **Next**.
5. **Name, review, and create**:
   - **Role name**: `production-ec2-secrets-role`
   - **Description**: `Allows EC2 instances to read production database credentials`
6. Click **Create role**! 🎉

---

### Part 3: Create a Private Amazon S3 Bucket

Amazon S3 (Simple Storage Service) provides 99.999999999% (11 9's) data durability for application uploads, assets, and logs:

1. Open the [Amazon S3 Console](https://console.aws.amazon.com/s3/).
2. Click the orange **Create bucket** button.
3. General configuration:
   - **Bucket name**: `production-app-assets-devops-yourname` *(Must be globally unique across all AWS accounts!)*.
   - **AWS Region**: Select the same region (e.g. `us-east-1`).
4. **Block Public Access settings for this bucket**:
   - Keep ✅ **Block *all* public access** checked! *(Private S3 buckets must never be exposed publicly)*.
5. **Bucket Versioning**:
   - Select **Enable** *(Protects against accidental deletions or file overwrites)*.
6. Click **Create bucket**! 📦

---

## 🔍 Checkpoints: How to Verify Secret Storage

### 1. Inspect Secret in Secrets Manager Console
- In the Secrets Manager Console, click on `production/database/credentials`.
- Under the **Secret value** section, click **Retrieve secret value**.
- Confirm that your database username, password, and endpoint are accurately stored.

### 2. Verify IAM Role Trust Relationship
- In the IAM Console $\rightarrow$ click **Roles** $\rightarrow$ select `production-ec2-secrets-role`.
- Click the **Trust relationships** tab. You should see:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": { "Service": "ec2.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }
    ]
  }
  ```

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: Database Secret Stored in Secrets Manager
<!-- Save your screenshot here as proof of work -->
![Secrets Manager](./screenshots/09-secrets-manager-stored.png)
*Caption: production/database/credentials stored with KMS encryption.*

### 🖼️ Screenshot 2: IAM Role Created for EC2
<!-- Save your screenshot here as proof of work -->
![IAM Role for EC2](./screenshots/10-iam-role-secrets-manager.png)
*Caption: production-ec2-secrets-role with SecretsManagerReadWrite attached.*

### 🖼️ Screenshot 3: Private S3 Bucket Created
<!-- Save your screenshot here as proof of work -->
![S3 Bucket](./screenshots/11-s3-bucket-created.png)
*Caption: S3 console showing private bucket with Block All Public Access enabled.*

---

## ⏭️ Ready for Step 5?

Now that the database and credentials vault are provisioned, let's create the Application Load Balancer and Target Group:  
👉 **[Go to Step 5: 05-application-load-balancer.md](./05-application-load-balancer.md)**
