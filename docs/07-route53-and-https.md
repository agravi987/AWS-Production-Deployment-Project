# 🌍 Step 7: Amazon Route 53 & HTTPS (SSL/TLS Encryption)

🎯 **Mission**: Connect a custom domain name using **Amazon Route 53** and attach a free, auto-renewing **SSL/TLS certificate** from **AWS Certificate Manager (ACM)** to secure your site with HTTPS!

---

## 💡 The Concept: DNS & The Green Padlock

```
┌─────────────────────────────────┐
│     Client Web Browser 🌍       │
└────────────────┬────────────────┘
                 │ 1. DNS Query: "Where is app.mydomain.com?"
                 ▼
┌─────────────────────────────────┐
│     Amazon Route 53 🧭          │  Maps your domain directly to
│     (Authoritative DNS)         │  your Application Load Balancer
└────────────────┬────────────────┘
                 │ 2. Routes to ALB with TLS 1.3
                 ▼
┌─────────────────────────────────┐
│  [ALB - HTTPS 443 Listener] 🔒  │  Decrypts TLS traffic using ACM
│  AWS Certificate Manager (ACM)  │  Certificate before forwarding
└────────────────┬────────────────┘
                 │ 3. Internal routing
                 ▼
┌─────────────────────────────────┐
│     EC2 Application Fleet       │
└─────────────────────────────────┘
```

---

## 🖱️ Step-by-Step AWS Console Recipe

### 1. Request Free SSL Certificate in ACM
1. Open the [AWS Certificate Manager (ACM) Console](https://console.aws.amazon.com/acm/) in the same region (e.g. `us-east-1`).
2. Click **Request certificate** $\rightarrow$ select **Request a public certificate** $\rightarrow$ Click **Next**.
3. Domain names: `yourdomain.com` (and `*.yourdomain.com`).
4. Validation method: **DNS validation - recommended** $\rightarrow$ Click **Request**.
5. Click on the pending certificate $\rightarrow$ Click **Create records in Route 53** $\rightarrow$ Click **Create records**.  
   *(Status changes to **Issued** 🟢 in 3-5 minutes).*

---

### 2. Create Route 53 Alias Record
1. Open the [Amazon Route 53 Console](https://console.aws.amazon.com/route53/) $\rightarrow$ click **Hosted zones** $\rightarrow$ select your domain.
2. Click **Create record**:
   - Record name: `app` (or leave blank for apex domain).
   - Record type: `A`.
   - Toggle **Alias** to **ON** ✅.
   - Choose endpoint: **Alias to Application and Classic Load Balancer**.
   - Region: Select your region (e.g. `us-east-1`).
   - Load Balancer: Select `production-alb`.
3. Click **Create records**! 🎉

---

### 3. Add HTTPS Listener & HTTP-to-HTTPS Redirect
1. Open [EC2 Console](https://console.aws.amazon.com/ec2/) $\rightarrow$ **Load Balancers** $\rightarrow$ select `production-alb`.
2. Under **Listeners and rules**, click **Add listener**:
   - Protocol: `HTTPS` | Port: `443`
   - Default action: Forward to $\rightarrow$ `production-tg`
   - Certificate: Select **From ACM** $\rightarrow$ choose your issued certificate.
   - Click **Add**.
3. Edit the existing **HTTP:80** listener:
   - Change default action to **Redirect to URL**.
   - Protocol: `HTTPS` | Port: `443` | Status code: `301 - Permanently moved`.
   - Click **Save changes**! 🔒

---

## 🔍 Checkpoints: How to Verify

1. Run in terminal:
   ```bash
   curl -I http://app.yourdomain.com
   ```
   *Expected output*: `HTTP/1.1 301 Moved Permanently` $\rightarrow$ `Location: https://app.yourdomain.com:443/`.
2. Open `https://app.yourdomain.com` in your browser:  
   **The green padlock 🔒 is displayed, and your site is 100% encrypted!**

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: ACM Certificate Issued
<!-- Save screenshot from ACM Console -->
`docs/screenshots/14-acm-ssl-issued.png`

### 🖼️ Screenshot 2: Application Load Balancer HTTPS Listener
<!-- Save screenshot from ALB Listeners tab -->
`docs/screenshots/15-alb-https-listener.png`

### 🖼️ Screenshot 3: Route 53 Alias Record Pointing to ALB
<!-- Save screenshot from Route 53 Hosted Zone -->
`docs/screenshots/16-route53-alias-record.png`

---

## ⏭️ Ready for Step 8?

Now let's configure observability, CloudWatch alarms, and automated SNS email alerts:  
👉 **[Go to Step 8: 08-cloudwatch-monitoring.md](./08-cloudwatch-monitoring.md)**
