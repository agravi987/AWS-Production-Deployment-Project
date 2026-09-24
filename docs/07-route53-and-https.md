# 🌍 Step 7: Amazon Route 53 & HTTPS (SSL/TLS Encryption)

Welcome to **Step 7**! 🔒🌍  
In production cloud environments, raw HTTP over port 80 is insecure because traffic is sent in unencrypted cleartext.  
In this step, you will configure a custom domain name using **Amazon Route 53** and attach a free, auto-renewing SSL/TLS certificate from **AWS Certificate Manager (ACM)** to secure your Application Load Balancer with HTTPS!

---

## 🌐 The Analogy: DNS & The Green Padlock

```
┌─────────────────────────────────┐
│     Client Web Browser 🌍       │
└────────────────┬────────────────┘
                 │ 1. DNS Query: "Where is app.mydomain.com?"
                 ▼
┌─────────────────────────────────┐
│     Amazon Route 53 🧭          │  Translates human domain names
│     (Authoritative DNS)         │  into AWS Load Balancer targets
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

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Request a Free SSL/TLS Certificate in ACM

1. Open the [AWS Certificate Manager (ACM) Console](https://console.aws.amazon.com/acm/).
2. Ensure you are in the **same region** as your ALB (e.g., `us-east-1`).
3. Click the orange **Request certificate** button.
4. Select **Request a public certificate** $\rightarrow$ Click **Next**.
5. Domain names:
   - Fully qualified domain name: `yourdomain.com` (or `*.yourdomain.com` for a wildcard certificate).
   - Add another name: `app.yourdomain.com`.
6. Validation method:
   - Select **DNS validation - recommended** *(Fastest and automates renewals!)*.
7. Click **Request**.
8. In the Certificate list, click your pending certificate $\rightarrow$ Click **Create records in Route 53** $\rightarrow$ Click **Create records**.
   *(ACM automatically inserts the CNAME validation record into Route 53. Within 3-5 minutes, status changes to **Issued**!)* 🟢

---

### Part 2: Create a Route 53 Alias Record

1. Open the [Amazon Route 53 Console](https://console.aws.amazon.com/route53/).
2. In the left menu, click **Hosted zones** $\rightarrow$ select your domain's hosted zone.
3. Click **Create record**.
4. Configure record:
   - Record name: `app` (or leave empty for apex domain `yourdomain.com`).
   - Record type: `A - Routes traffic to an IPv4 address and some AWS resources`.
   - Toggle **Alias** to **ON** ✅.
   - Route traffic to:
     - Select: **Alias to Application and Classic Load Balancer**.
     - Region: Select your region (e.g. `us-east-1`).
     - Choose load balancer: Select `production-alb`!
   - Routing policy: `Simple routing`.
5. Click **Create records**! 🎉

---

### Part 3: Add HTTPS Listener & HTTP Redirect to ALB

Now tell the Load Balancer to listen on HTTPS port 443 and auto-redirect HTTP port 80 traffic:

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/) $\rightarrow$ **Load Balancers** $\rightarrow$ select `production-alb`.
2. Under the **Listeners and rules** tab, click **Add listener**:
   - **Protocol**: `HTTPS` | **Port**: `443`
   - **Default action**: Select **Forward to** $\rightarrow$ choose `production-tg`.
   - **Secure listener settings**:
     - Default SSL/TLS certificate: Select **From ACM** $\rightarrow$ choose your issued ACM certificate.
   - Click **Add**.
3. Now configure the **HTTP:80** listener to automatically redirect to HTTPS:
   - Select the **HTTP:80** listener $\rightarrow$ Click **Edit listener**.
   - Change Default action to **Redirect to URL**.
   - Protocol: `HTTPS` | Port: `443`
   - Status code: `301 - Permanently moved`.
   - Click **Save changes**! 🔒

---

## 🔍 Checkpoints: How to Verify HTTPS is Working

### 1. Test DNS Resolution
Run in your local terminal:
```bash
nslookup app.yourdomain.com
```
*Expected Result*: Returns the IP addresses of your Application Load Balancer!

### 2. Verify Automated HTTP to HTTPS Redirection
```bash
curl -I http://app.yourdomain.com
```
*Expected Response*:
```text
HTTP/1.1 301 Moved Permanently
Location: https://app.yourdomain.com:443/
```

### 3. Open in Web Browser
Navigate to `https://app.yourdomain.com`:
- The browser shows the **secure green padlock** 🔒!
- Clicking the padlock displays: **Certificate is valid (Issued by Amazon)**.

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: ACM SSL Certificate Issued
<!-- Save your screenshot here as proof of work -->
![ACM Certificate Issued](./screenshots/14-acm-ssl-issued.png)
*Caption: ACM console displaying public certificate status Issued.*

### 🖼️ Screenshot 2: Application Load Balancer HTTPS 443 Listener
<!-- Save your screenshot here as proof of work -->
![ALB HTTPS Listener](./screenshots/15-alb-https-listener.png)
*Caption: production-alb listeners showing HTTP:80 redirecting to HTTPS:443.*

### 🖼️ Screenshot 3: Route 53 Alias Record Pointing to ALB
<!-- Save your screenshot here as proof of work -->
![Route 53 Alias Record](./screenshots/16-route53-alias-record.png)
*Caption: Route 53 record details targeting dualstack.production-alb.*

---

## ⏭️ Ready for Step 8?

Now let's configure observability, CloudWatch alarms, and automated SNS alerts:  
👉 **[Go to Step 8: 08-cloudwatch-monitoring.md](./08-cloudwatch-monitoring.md)**
