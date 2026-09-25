# 📊 Step 8: Amazon CloudWatch Monitoring & Alerts

🎯 **Mission**: Set up automated **SNS email alerts** and build a **CloudWatch CPU Alarm** that notifies you when your Auto Scaling Group experiences high traffic or CPU spikes.

---

## 💡 The Concept: Real-Time Observability

A production system must never fail silently.  
With **CloudWatch + SNS**:
1. CloudWatch monitors EC2 CPU utilization every 60 seconds.
2. If average CPU exceeds 70%, it fires an alarm.
3. Amazon SNS sends an immediate incident email to your phone or team!

---

## 🖱️ Step-by-Step AWS Console Recipe

### 1. Create SNS Topic for Email Alerts
1. Open the [Amazon SNS Console](https://console.aws.amazon.com/sns/) $\rightarrow$ click **Topics** $\rightarrow$ Click **Create topic**.
2. Type: **Standard** | Name: `production-devops-alerts` $\rightarrow$ Click **Create topic**.
3. Under **Subscriptions**, click **Create subscription**:
   - Protocol: **Email**
   - Endpoint: Enter your personal email address.
   - Click **Create subscription**.
4. 📩 **Check your email inbox!** Click **Confirm subscription** in the confirmation email from AWS. *(Status turns Confirmed)*!

---

### 2. Create CloudWatch CPU Alarm
1. Open the [Amazon CloudWatch Console](https://console.aws.amazon.com/cloudwatch/) $\rightarrow$ click **All alarms** $\rightarrow$ Click **Create alarm**.
2. Click **Select metric** $\rightarrow$ **EC2** $\rightarrow$ **By Auto Scaling Group** $\rightarrow$ select `production-asg` $\rightarrow$ choose **CPUUtilization**.
3. Conditions:
   - Threshold type: **Static**
   - Condition: **Greater/Equal (>=)** `70` %
   - Period: **1 minute**.
4. Actions:
   - Alarm state trigger: **In alarm**
   - Send notification to: `production-devops-alerts`
5. Alarm name: `production-asg-high-cpu-alarm` $\rightarrow$ Click **Create alarm**! 🚨

---

### 3. Create CloudWatch Dashboard
1. In CloudWatch, click **Dashboards** $\rightarrow$ Click **Create dashboard**.
2. Name: `production-overview-dashboard`.
3. Add Widgets:
   - Widget 1: Line graph for ALB `RequestCount`
   - Widget 2: Line graph for ALB `TargetResponseTime`
   - Widget 3: Line graph for RDS `DatabaseConnections`
4. Click **Save dashboard**! 📈

---

## 🔍 Checkpoints: How to Test Your Alarm Live!

Want to see your alarm trigger with a real spike?
1. Connect to one of your running EC2 instances via EC2 Instance Connect.
2. Run a CPU load generator:
   ```bash
   sudo apt-get install -y stress
   stress --cpu 2 --timeout 180s
   ```
3. Watch the **CloudWatch Console**:
   - Within 2 minutes, the CPU graph spikes above 70%.
   - The alarm state changes to **In alarm** 🔴!
4. **Check your email**: You will receive an incident alert from AWS Notifications! 📬

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: CloudWatch CPU Alarm Configured
`docs/screenshots/20-cloudwatch-cpu-alarm.png`

### 🖼️ Screenshot 2: Amazon SNS Subscription Confirmed
`docs/screenshots/21-sns-email-confirmed.png`

### 🖼️ Screenshot 3: CloudWatch Live Overview Dashboard
`docs/screenshots/22-cloudwatch-dashboard-live.png`

---

## ⏭️ Ready for Step 9?

Now let's set up cost monitoring and review the safe reverse-order teardown guide:  
👉 **[Go to Step 9: 09-cost-management-cleanup.md](./09-cost-management-cleanup.md)**
