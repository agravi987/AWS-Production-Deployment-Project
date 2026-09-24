# 📊 Step 8: Amazon CloudWatch Monitoring & Automated Alerts

Welcome to **Step 8**! 📊  
Deploying infrastructure is only half of the cloud engineer's responsibility. **Observability**—knowing how your system is performing in real-time and receiving automated alerts before customers notice outages—is what keeps production online.

---

## 👁️ What is Amazon CloudWatch?

CloudWatch is the monitoring and observability hub of AWS:

```
┌─────────────────────────────────┐
│       Cloud Resources           │
│  • EC2 (CPU, Disk, Network)     │
│  • ALB (Requests, Latency, 5XX) │
│  • RDS (Connections, IOPS, CPU) │
└────────────────┬────────────────┘
                 │ Emits real-time metrics every 60s
                 ▼
┌─────────────────────────────────┐
│     Amazon CloudWatch 📊        │
│  • Compares against thresholds  │
│  • Displays live dashboard      │
└────────────────┬────────────────┘
                 │ CPU > 70% triggered!
                 ▼
┌─────────────────────────────────┐
│     Amazon SNS (Email/SMS) 📬   │ ➔ Sends incident email to DevOps team!
└─────────────────────────────────┘
```

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create an SNS Topic for Alerts

Before creating an alarm, we need an **Amazon Simple Notification Service (SNS)** topic to deliver email alerts:

1. Open the [Amazon SNS Console](https://console.aws.amazon.com/sns/).
2. In the left navigation menu, click **Topics** $\rightarrow$ Click **Create topic**.
3. **Details**:
   - Type: Select **Standard**.
   - Name: `production-devops-alerts`
   - Display name: `AWS Alerts`
4. Click **Create topic**.
5. Under the **Subscriptions** tab, click **Create subscription**:
   - Protocol: Select **Email**.
   - Endpoint: Enter your personal email address.
   - Click **Create subscription**.
6. 📩 **Check your email inbox!** You will receive an email titled *AWS Notification - Subscription Confirmation*. Click the **Confirm subscription** link. *(Status changes to Confirmed)*!

---

### Part 2: Create a CloudWatch CPU Alarm for EC2 Auto Scaling

1. Open the [Amazon CloudWatch Console](https://console.aws.amazon.com/cloudwatch/).
2. In the left menu, click **Alarms** $\rightarrow$ **All alarms** $\rightarrow$ Click **Create alarm**.
3. Click **Select metric**:
   - Browse to: **EC2** $\rightarrow$ **By Auto Scaling Group**.
   - Find your group: `production-asg`.
   - Select metric: **CPUUtilization** $\rightarrow$ Click **Select metric**.
4. Specify metric and conditions:
   - Statistic: **Average**
   - Period: **1 minute**
   - Threshold type: **Static**
   - Whenever CPUUtilization is: **Greater/Equal (>=)**
   - Define threshold value: `70` (%)
5. Click **Next**.
6. **Configure actions**:
   - Alarm state trigger: Select **In alarm**.
   - Send notification to: Select **Select an existing SNS topic** $\rightarrow$ choose `production-devops-alerts`.
7. Click **Next**.
8. **Name and description**:
   - Alarm name: `production-asg-high-cpu-alarm`
   - Alarm description: `Triggers when ASG average CPU utilization exceeds 70%`
9. Click **Next** $\rightarrow$ Click **Create alarm**! 🚨

---

### Part 3: Build a CloudWatch Unified Operations Dashboard

1. In the left CloudWatch menu, click **Dashboards** $\rightarrow$ Click **Create dashboard**.
2. Dashboard name: `production-overview-dashboard` $\rightarrow$ Click **Create dashboard**.
3. Add Widget 1: **Number of Web Requests (ALB)**:
   - Widget type: **Line** $\rightarrow$ **Metrics** $\rightarrow$ **ApplicationELB** $\rightarrow$ **Per AppELB Metrics**.
   - Select `RequestCount` for `production-alb` $\rightarrow$ Click **Create widget**.
4. Add Widget 2: **Backend Target Response Time**:
   - Click **Add widget** (+) $\rightarrow$ **Line** $\rightarrow$ **TargetResponseTime** for `production-tg`.
5. Add Widget 3: **Active Database Connections (RDS)**:
   - Click **Add widget** (+) $\rightarrow$ **Line** $\rightarrow$ **RDS** $\rightarrow$ **Per-Database Metrics**.
   - Select `DatabaseConnections` for `production-postgres`.
6. Click **Save dashboard**! 📈

---

## 🔍 Checkpoints: How to Verify Alarms with a Live Stress Test

Want to see your CloudWatch alarm and SNS email fire live?

1. Connect to one of your running EC2 instances via EC2 Instance Connect.
2. Run a CPU load generator command:
   ```bash
   # Generates 100% CPU utilization on all cores for 3 minutes
   sudo apt-get install -y stress
   stress --cpu 2 --timeout 180s
   ```
3. Watch the **CloudWatch Console**:
   - Within 2 minutes, the metric graph for `production-asg-high-cpu-alarm` spikes above 70%.
   - Alarm status changes from **OK** 🟢 to **In alarm** 🔴!
4. **Check your email**: You will receive an incident email from AWS Notifications alerting you that CPU has exceeded the 70% threshold!

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: CloudWatch CPU Alarm Configured
<!-- Save your screenshot here as proof of work -->
![CloudWatch CPU Alarm](./screenshots/20-cloudwatch-cpu-alarm.png)
*Caption: CloudWatch alarm configured for production-asg with threshold >= 70%.*

### 🖼️ Screenshot 2: Amazon SNS Subscription Confirmed
<!-- Save your screenshot here as proof of work -->
![SNS Subscription Confirmed](./screenshots/21-sns-email-confirmed.png)
*Caption: SNS topic production-devops-alerts showing email endpoint confirmed.*

### 🖼️ Screenshot 3: CloudWatch Live Overview Dashboard
<!-- Save your screenshot here as proof of work -->
![CloudWatch Dashboard](./screenshots/22-cloudwatch-dashboard-live.png)
*Caption: production-overview-dashboard showing real-time graphs for ALB and RDS.*

---

## ⏭️ Ready for Step 9?

Now let's set up cost monitoring and review the safe reverse-order teardown guide:  
👉 **[Go to Step 9: 09-cost-management-cleanup.md](./09-cost-management-cleanup.md)**
