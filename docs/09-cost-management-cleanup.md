# 💰 Step 9: AWS Cost Management & Safe Teardown Checklist

Welcome to **Step 9**! 💰  
One of the most important habits of a senior cloud engineer is **financial hygiene**.  
In this step, you will set up a proactive **AWS Budget alert** and master the **exact reverse-order teardown sequence** so you never get surprise charges on your personal AWS account.

---

## 💡 AWS Free Tier Limits You Must Know

AWS provides generous Free Tier allowances for the first 12 months:

| Service | Free Tier Allowance | Our Architecture Usage |
| :--- | :--- | :--- |
| **Amazon EC2** | 750 hours/month of `t2.micro` or `t3.micro` | 2 instances $\times$ 375 hours = 750 hours |
| **Amazon RDS** | 750 hours/month of Single-AZ `db.t3.micro` + 20 GB gp2/gp3 | 1 instance $\times$ 720 hours = Well within limits |
| **Amazon S3** | 5 GB standard storage + 20,000 GET requests | < 100 MB used for assets |
| **AWS Secrets Manager** | 30-day free trial per secret | 1 secret used |
| **Application Load Balancer** | 750 hours/month free under AWS 12-month free tier | 1 ALB |

---

## 🛡️ Action 1: Create an AWS \$1.00 Zero-Spend Budget Alert

Never guess your AWS spending! Let AWS notify you if your bill exceeds \$1.00:

1. In the top search bar, search for **AWS Budgets**.
2. Click the orange **Create budget** button.
3. Budget setup:
   - Select **Use a template (simplified)**.
   - Choose **Zero spend budget** (or Monthly cost budget: `$1.00`).
4. Email recipients: Enter your personal email address.
5. Click **Create budget**! 🎉  
   *If your account ever incurs a charge over $0.01, AWS will instantly email you.*

---

## 🧹 Action 2: Safe Reverse-Order Teardown Checklist

When you are ready to pause or delete your lab environment, **you must delete resources in reverse order** because child resources depend on parent networks:

```
  BUILD ORDER:   VPC ➔ SGs ➔ RDS ➔ Secrets ➔ ALB ➔ ASG / EC2
  TEARDOWN:      ASG / EC2 ➔ ALB ➔ Secrets ➔ RDS ➔ SGs ➔ VPC
```

Follow this exact checklist when tearing down:

### 1. Auto Scaling Group & EC2
- [ ] Go to **EC2 Console** $\rightarrow$ **Auto Scaling Groups**.
- [ ] Select `production-asg` $\rightarrow$ Click **Delete**.
- [ ] Confirm deletion: The ASG will automatically terminate both running EC2 instances cleanly!

### 2. EC2 Launch Template
- [ ] Go to **EC2 Console** $\rightarrow$ **Launch Templates**.
- [ ] Select `production-lt` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete template**.

### 3. Application Load Balancer & Target Group
- [ ] Go to **EC2 Console** $\rightarrow$ **Load Balancers**.
- [ ] Select `production-alb` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete load balancer**.
- [ ] Go to **Target Groups** $\rightarrow$ Select `production-tg` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete**.

### 4. Amazon RDS Database & Subnet Group
- [ ] Go to **RDS Console** $\rightarrow$ **Databases**.
- [ ] Select `production-postgres` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete**.
- [ ] In the confirmation dialog:
  - Uncheck: "Create final snapshot".
  - Check: "I acknowledge that upon instance deletion, automated backups are no longer available".
  - Type `delete me` and click **Delete**.
- [ ] Once deleted, go to **Subnet groups** $\rightarrow$ Select `production-db-subnet-group` $\rightarrow$ Click **Delete**.

### 5. AWS Secrets Manager
- [ ] Go to **Secrets Manager Console**.
- [ ] Select `production/database/credentials` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete secret** (Set recovery window to 7 days or force deletion).

### 6. Amazon S3 Bucket
- [ ] Go to **S3 Console** $\rightarrow$ Select your bucket `production-app-assets-xxx`.
- [ ] Click **Empty** $\rightarrow$ Type `permanently delete`.
- [ ] Click **Delete bucket** $\rightarrow$ Confirm bucket name.

### 7. Security Groups
- [ ] Go to **EC2 Console** $\rightarrow$ **Security Groups**.
- [ ] Select and delete in this order:
  1. `production-rds-db-sg`
  2. `production-ec2-app-sg`
  3. `production-alb-sg`

### 8. Custom VPC & Internet Gateway
- [ ] Go to **VPC Console** $\rightarrow$ **Your VPCs**.
- [ ] Select `production-vpc` $\rightarrow$ Click **Actions** $\rightarrow$ **Delete VPC**.
- [ ] AWS will show you all attached subnets, route tables, and the internet gateway:
  - Check the confirmation box $\rightarrow$ Type `delete` $\rightarrow$ Click **Delete**!  
  *(AWS deletes the entire VPC cleanly in one click!)* 🧹✨

---

## ⏭️ Ready for Step 10?

Now let's master the DevOps & Cloud Architecture interview questions, elevator pitch, and portfolio resume bullets:  
👉 **[Go to Step 10: 10-interview-masterclass.md](./10-interview-masterclass.md)**
