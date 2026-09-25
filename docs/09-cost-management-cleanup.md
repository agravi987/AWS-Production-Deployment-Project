# 💰 Step 9: AWS Cost Management & Safe Teardown Checklist

🎯 **Mission**: Create a **$1.00 AWS Budget alert** to stay 100% Free Tier, and master the **exact reverse-order teardown sequence** when you want to safely delete or pause your lab resources.

---

## 🛡️ Action 1: Create an AWS \$1.00 Budget Alert

1. In the AWS search bar, type **AWS Budgets**.
2. Click **Create budget** $\rightarrow$ select **Use a template (simplified)**.
3. Choose **Zero spend budget** (or Monthly cost: `$1.00`).
4. Enter your personal email address $\rightarrow$ Click **Create budget**! 🎉  
   *(AWS will immediately notify you if your bill reaches $0.01).*

---

## 🧹 Action 2: Safe Reverse-Order Teardown Checklist

In AWS, you cannot delete a parent network (like a VPC) while child resources (like an ALB or EC2) are still inside it.  
Always tear down in **exact reverse order**:

```
BUILD ORDER:    VPC ➔ SGs ➔ RDS ➔ Secrets ➔ ALB ➔ ASG / EC2
TEARDOWN:       ASG / EC2 ➔ ALB ➔ Secrets ➔ RDS ➔ SGs ➔ VPC
```

### 1. Delete Auto Scaling Group (ASG)
- [ ] Go to **EC2 Console** $\rightarrow$ **Auto Scaling Groups**.
- [ ] Select `production-asg` $\rightarrow$ Click **Delete**.  
  *(The ASG automatically terminates both running EC2 instances cleanly!)*

### 2. Delete Launch Template
- [ ] Go to **EC2** $\rightarrow$ **Launch Templates** $\rightarrow$ select `production-lt` $\rightarrow$ **Actions** $\rightarrow$ **Delete template**.

### 3. Delete Application Load Balancer & Target Group
- [ ] Go to **EC2** $\rightarrow$ **Load Balancers** $\rightarrow$ select `production-alb` $\rightarrow$ **Actions** $\rightarrow$ **Delete load balancer**.
- [ ] Go to **Target Groups** $\rightarrow$ select `production-tg` $\rightarrow$ **Actions** $\rightarrow$ **Delete**.

### 4. Delete Amazon RDS Database & Subnet Group
- [ ] Go to **RDS Console** $\rightarrow$ **Databases** $\rightarrow$ select `production-postgres` $\rightarrow$ **Actions** $\rightarrow$ **Delete**:
  - Uncheck "Create final snapshot".
  - Check "I acknowledge that upon instance deletion, automated backups are no longer available".
  - Type `delete me` and confirm.
- [ ] In **Subnet groups**, select `production-db-subnet-group` $\rightarrow$ Click **Delete**.

### 5. Delete Secrets Manager Secret
- [ ] Go to **Secrets Manager Console** $\rightarrow$ select `production/database/credentials` $\rightarrow$ **Actions** $\rightarrow$ **Delete secret**.

### 6. Delete S3 Bucket
- [ ] Go to **S3 Console** $\rightarrow$ select your bucket $\rightarrow$ Click **Empty** $\rightarrow$ Click **Delete**.

### 7. Delete Security Groups
- [ ] Go to **EC2** $\rightarrow$ **Security Groups**. Delete in this order:
  1. `production-rds-db-sg`
  2. `production-ec2-app-sg`
  3. `production-alb-sg`

### 8. Delete Custom VPC
- [ ] Go to **VPC Console** $\rightarrow$ **Your VPCs** $\rightarrow$ select `production-vpc` $\rightarrow$ **Actions** $\rightarrow$ **Delete VPC**.  
  *(AWS automatically detaches the Internet Gateway, deletes all 6 subnets, and removes route tables in one click!)* 🧹✨

---

## ⏭️ Ready for Step 10?

Now let's practice the top DevOps & Cloud Architecture interview questions and prepare your resume bullet points:  
👉 **[Go to Step 10: 10-interview-masterclass.md](./10-interview-masterclass.md)**
