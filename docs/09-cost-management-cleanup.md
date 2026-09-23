# 💰 Step 9: AWS Cost Management & Safe Cleanup Checklist

Nothing scares AWS beginners more than the fear of a surprise credit card bill! 😱💸  
In this guide, you will learn how to **stay 100% within the Free Tier**, set up an **automated billing alert**, and follow the **exact step-by-step teardown checklist** to safely delete all resources when you finish your practice! 🧹✨

---

## 🛡️ 1. Set Up an AWS \$1.00 Billing Alarm (Do This First!)

Before doing anything else in AWS, set up a zero-spend alarm so AWS emails you if your bill exceeds \$1.00:

1. In the AWS Console search bar, search for **Billing and Cost Management** 💳.
2. In the left navigation menu, click **Budgets** $\rightarrow$ Click **Create budget**.
3. Under **Budget setup**, choose **Customize (advanced)** $\rightarrow$ Select **Cost budget** $\rightarrow$ Click **Next**.
4. Set budget parameters:
   - **Budget name**: `learning-safety-budget`
   - **Period**: `Monthly`
   - **Budget effective date**: `Recurring budget`
   - **Budgeted amount**: `$1.00` (or `$5.00`).
5. Click **Next**.
6. Set alert thresholds:
   - Click **Add an alert threshold**.
   - **Threshold**: `80%` of budgeted amount ($0.80).
   - **Email recipients**: Enter your email address.
7. Click **Next** $\rightarrow$ Click **Create budget**! 🎉

*Now you have a 24/7 security guard watching your billing account!* 🚨

---

## 🏷️ AWS Free Tier Limits You Should Know

| Service | Free Tier Allowance | How to Avoid Charges |
| :--- | :--- | :--- |
| **Amazon EC2** | **750 hours/month** of `t2.micro` or `t3.micro` | 1 instance running 24/7 all month is 100% free! Running 2 instances uses 750 hours in 15 days, so delete or stop them when done practicing. |
| **Amazon RDS** | **750 hours/month** of `db.t3.micro` or `db.t4g.micro` | Single-AZ PostgreSQL with 20 GB gp3 storage is 100% free for your first 12 months. |
| **Amazon S3** | **5 GB** standard storage + 20,000 GET requests | Plenty for testing. |
| **Load Balancers (ALB)**| 750 hours free in your first 12 months | After 12 months or when done, delete the ALB to avoid ~$0.022/hr. |
| **NAT Gateway** | *Not in Free Tier* (~$0.045/hr = ~$32/month) | ⚠️ In learning environments, **do NOT leave a NAT Gateway running!** Use public subnets or delete the NAT Gateway immediately after testing. |

---

## 🧹 The Safe Teardown Checklist (Reverse Order Deletion)

In AWS, you cannot delete a VPC if an EC2 instance or Load Balancer is still using it (AWS will throw `DependencyViolation`).

**Follow this exact reverse order to delete all resources in under 5 minutes without errors:**

```
1. Delete Auto Scaling Group ➔ Terminates all EC2 instances cleanly
2. Delete Application Load Balancer & Target Groups
3. Delete Amazon RDS Database (Choose: No final snapshot)
4. Delete Security Groups (RDS SG ➔ EC2 SG ➔ ALB SG)
5. Detach and Delete Internet Gateway
6. Delete Custom Subnets & Custom VPC
7. Delete CloudWatch Alarms & S3 Bucket
```

---

### Step 1: Delete Auto Scaling Group
1. Go to **EC2** $\rightarrow$ **Auto Scaling Groups**.
2. Select `production-asg` $\rightarrow$ Click **Delete**.
3. Confirm deletion.  
   *(AWS automatically terminates all running EC2 instances launched by the ASG!).*

---

### Step 2: Delete Application Load Balancer & Target Group
1. Go to **EC2** $\rightarrow$ **Load Balancers**.
2. Select `production-alb` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete load balancer**.
3. In the left menu, click **Target Groups**.
4. Select `production-tg` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete**.

---

### Step 3: Delete Amazon RDS Database
1. Go to **RDS** $\rightarrow$ **Databases**.
2. Select `production-postgres` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete**.
3. In the confirmation pop-up:
   - Uncheck ❌ **Create final snapshot**.
   - Check ✅ **I acknowledge that upon instance deletion...**.
   - Type `delete me` in the box $\rightarrow$ Click **Delete**.

---

### Step 4: Delete Security Groups
1. Go to **VPC** $\rightarrow$ **Security Groups**.
2. Delete them in this order (to avoid dependency conflicts):
   - First: Delete `production-rds-db-sg`.
   - Second: Delete `production-ec2-app-sg`.
   - Third: Delete `production-alb-sg`.

---

### Step 5: Detach and Delete Internet Gateway
1. Go to **VPC** $\rightarrow$ **Internet Gateways**.
2. Select `production-igw` $\rightarrow$ Click **Actions** $\rightarrow$ **Detach from VPC**.
3. Click **Actions** $\rightarrow$ **Delete internet gateway**.

---

### Step 6: Delete Subnets & Custom VPC
1. Go to **VPC** $\rightarrow$ **Subnets**.
2. Select all 6 subnets created (`public-1a`, `public-1b`, `private-app-1a`, etc.) $\rightarrow$ Click **Actions** $\rightarrow$ **Delete subnet**.
3. Go to **VPC** $\rightarrow$ **Your VPCs**.
4. Select `production-vpc` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete VPC** *(Type `delete` to confirm)*.

---

### Step 7: Delete CloudWatch Alarms & S3 Bucket
1. Go to **CloudWatch** $\rightarrow$ **All alarms** $\rightarrow$ Select `production-high-cpu-alarm` $\rightarrow$ Click **Delete**.
2. Go to **S3** $\rightarrow$ Select your bucket $\rightarrow$ Click **Empty** $\rightarrow$ Then click **Delete**.

🎉 **Your AWS account is now completely clean with zero active billing resources!** 💰

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: AWS Zero-Spend Budget Active
<!-- Replace with your screenshot path once taken -->
![AWS Budget](./screenshots/23-aws-budget-active.png)
*Caption: AWS Billing Console displaying $1.00 monthly safety budget with 80% email threshold.*

### 🖼️ Screenshot 2: Clean Account Verification
<!-- Replace with your screenshot path once taken -->
![Clean AWS Account](./screenshots/24-clean-account-verified.png)
*Caption: EC2 and RDS dashboards displaying 0 running instances and 0 active databases.*

---

## ⏭️ Ready for the Final Step?
Prepare for technical cloud interviews with our top 15 architecture questions:  
👉 **[Go to Step 10: 10-interview-masterclass.md](./10-interview-masterclass.md)**
