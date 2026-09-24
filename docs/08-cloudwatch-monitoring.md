# 📊 Step 8: Amazon CloudWatch Monitoring & Automated Alerts

Welcome to Day 8! 📊  
Deploying an architecture is only half the battle. **Observability**—knowing how your infrastructure is performing right now—is what keeps applications running smoothly.

---

## 👁️ What is Amazon CloudWatch?

CloudWatch is the monitoring and observability hub of AWS:
1. **Metrics**: Real-time numbers (CPU %, Memory %, Network traffic, Request counts).
2. **Alarms**: Triggers actions when a threshold is breached (e.g. send an email or trigger Auto Scaling).
3. **Logs**: Centralized place to search and analyze container logs.
4. **Dashboards**: A single customizable TV-style command center for your entire stack.

```
       [EC2 / ALB / RDS] ──► Push Metrics every 1 minute ──► [Amazon CloudWatch]
                                                                     │
                                         ┌───────────────────────────┴───────────────────────────┐
                                         ▼                                                       ▼
                            [📊 Live CloudWatch Dashboard]                     [🚨 Alarm: CPU > 75% for 5m]
                                 • ALB Request Count                                             │
                                 • Target Response Time                                          ▼
                                 • RDS Free Storage Space                           [✉️ Amazon SNS Email Alert]
                                                                                    Sends message to your phone!
```

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create an Email Alert Topic (Amazon SNS)
Before creating an alarm, we need an alert destination (an SNS Topic) so AWS can email you:

1. Open the [Amazon SNS Console](https://console.aws.amazon.com/sns/).
2. In the left menu, click **Topics** $\rightarrow$ Click **Create topic**.
3. Details:
   - Type: Select **Standard**
   - **Name**: `production-devops-alerts`
   - **Display name**: `DevOps Alerts`
4. Click **Create topic**.
5. Under the **Subscriptions** tab, click **Create subscription**:
   - **Protocol**: Select **Email** 📧.
   - **Endpoint**: Enter your personal email address.
   - Click **Create subscription**.
6. 📬 **CHECK YOUR EMAIL INBOX!**  
   Open the email from AWS Notifications and click **"Confirm subscription"**.  
   *(The status will change from "PendingConfirmation" to **Confirmed** 🟢).*

---

### Part 2: Create a CloudWatch Alarm for High CPU
1. Open the [Amazon CloudWatch Console](https://console.aws.amazon.com/cloudwatch/).
2. In the left menu, click **Alarms** $\rightarrow$ click **All alarms** $\rightarrow$ Click **Create alarm**.
3. Click **Select metric**:
   - Click **EC2** $\rightarrow$ **By Auto Scaling Group**.
   - Select your Auto Scaling Group `production-asg` $\rightarrow$ Metric: **CPUUtilization**.
   - Click **Select metric**.
4. Specify metric and conditions:
   - **Statistic**: `Average`
   - **Period**: `5 minutes`
   - **Threshold type**: `Static`
   - **Whenever CPUUtilization is...**: `Greater/Equal` than `75`.
5. Click **Next**.
6. Configure actions:
   - **Alarm state trigger**: Select **In alarm** 🚨.
   - **Send a notification to...**: Select **Select an existing SNS topic** $\rightarrow$ choose `production-devops-alerts`.
7. Click **Next**.
8. Name and description:
   - **Alarm name**: `production-high-cpu-alarm`
   - **Alarm description**: `Alerts team when EC2 CPU exceeds 75% for 5 minutes`
9. Click **Next** $\rightarrow$ Click **Create alarm**! 🎉

---

### Part 3: Build a CloudWatch Command Center Dashboard
1. In the left menu, click **Dashboards** $\rightarrow$ Click **Create dashboard**.
2. **Dashboard name**: `production-overview-dashboard` $\rightarrow$ Click **Create dashboard**.
3. Add a widget:
   - Choose widget type: **Line** $\rightarrow$ Click **Next**.
   - Select **ApplicationELB** $\rightarrow$ **Per AppELB Metrics** $\rightarrow$ Select `RequestCount`.
   - Click **Create widget**.
4. Add a second widget:
   - Click **+** (Add widget) $\rightarrow$ Choose **Number**.
   - Select **RDS** $\rightarrow$ **Per-Database Metrics** $\rightarrow$ Select `DatabaseConnections`.
   - Click **Create widget**.
5. Click **Save dashboard** (top right)! 🌟

---

## 🔍 Checkpoints: How to Verify & See Monitoring Live

1. **Verify Alarm State is "OK"**:
   - In CloudWatch $\rightarrow$ **All alarms**, check `production-high-cpu-alarm`:
   - State should show green **OK** (indicating CPU is currently under 75%).

2. **Simulate a CPU Spike (Test the Alert System!)**:
   Connect to an EC2 instance and run a quick 3-minute CPU test:
   ```bash
   # Install stress tool
   sudo apt-get install -y stress
   # Stress 2 CPU cores for 3 minutes
   stress --cpu 2 --timeout 180s
   ```
   *Within 5 minutes*:
   - CloudWatch Alarm changes state from `OK` $\rightarrow$ **In alarm** (Red) 🚨!
   - Amazon SNS dispatches an automated alert email to your inbox:  
     `"ALARM: production-high-cpu-alarm in US East (N. Virginia)"` 📧!

3. **Check Live Dashboard Metrics**:
   - Open `production-overview-dashboard`.
   - Refresh the website in your browser 10 times $\rightarrow$ Watch the `RequestCount` graph spike in real time! 📈

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: CloudWatch Alarm Configured & Active
<!-- Replace with your screenshot path once taken -->
![CloudWatch Alarm](./screenshots/20-cloudwatch-alarm-cpu.png)
*Caption: production-high-cpu-alarm showing status OK, metric CPUUtilization > 75%, and SNS notification attached.*

### 🖼️ Screenshot 2: Amazon SNS Subscription Confirmed
<!-- Replace with your screenshot path once taken -->
![SNS Subscription Confirmed](./screenshots/21-sns-email-confirmed.png)
*Caption: SNS topic production-devops-alerts showing email endpoint confirmed.*

### 🖼️ Screenshot 3: CloudWatch Live Overview Dashboard
<!-- Replace with your screenshot path once taken -->
![CloudWatch Dashboard](./screenshots/22-cloudwatch-dashboard-live.png)
*Caption: production-overview-dashboard showing real-time graphs for ALB request count and RDS database connections.*

---

## ⏭️ Ready for Day 9?
Learn how to stay 100% Free Tier and execute a safe, zero-cost cleanup:  
👉 **[Go to Step 9: 09-cost-management-cleanup.md](./09-cost-management-cleanup.md)**
