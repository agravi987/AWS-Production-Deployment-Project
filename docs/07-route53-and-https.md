# 🌍 Step 7: Amazon Route 53 & HTTPS (SSL/TLS Encryption)

Welcome to Day 7! 🔒🌍  
In modern cloud engineering, **HTTP is unacceptable for production**.  
In this step, you will configure a custom domain name using **Amazon Route 53** and attach a free, auto-renewing SSL/TLS certificate from **AWS Certificate Manager (ACM)**.

---

## 🌐 The Analogy: DNS & The Green Padlock

1. **Amazon Route 53 (DNS)**: The internet's phonebook.  
   Instead of memorizing `production-alb-123456789.us-east-1.elb.amazonaws.com`, users type `myapp.yourdomain.com`.
2. **AWS Certificate Manager (ACM)**: The digital passport verifying your website is authentic and encrypting all traffic over the wire (HTTPS).

```
User visits: https://myapp.yourdomain.com 🌐
                     │
                     ▼
             [🌍 Amazon Route 53]
             Resolves Alias Record to ALB DNS
                     │
                     ▼
    [⚖️ Application Load Balancer (Port 443)]
    Decrypts traffic using ACM SSL Certificate 🔒
                     │ (Plain HTTP internally within private VPC)
                     ▼
            [💻 EC2 App Instances]
```

---

## 💡 The Superpower of Route 53 "Alias" Records

Normally in DNS, you use an `A` record for an IP address or a `CNAME` for a domain name.
However, AWS Application Load Balancers do **NOT** have static IP addresses (their IPs change dynamically).

AWS invented the **Alias Record**:
- It acts like an `A` record, but points directly to an AWS resource (like an ALB, CloudFront distribution, or S3 website).
- **Bonus**: AWS does not charge you for Route 53 DNS queries when resolving an Alias record to an ALB! 💰

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Request a Free SSL/TLS Certificate (ACM)
1. Open the [AWS Certificate Manager (ACM) Console](https://console.aws.amazon.com/acm/).
2. Make sure you are in the same AWS region as your ALB (e.g. `us-east-1`).
3. Click the orange **Request certificate** button.
4. Select **Request a public certificate** $\rightarrow$ Click **Next**.
5. Domain names:
   - **Fully qualified domain name**: `*.yourdomain.com` (or `myapp.yourdomain.com`).
6. Validation method:
   - Select **DNS validation** (Recommended) 🌐.
7. Click **Request**.
8. Click on your newly requested certificate $\rightarrow$ Under **Domains**, click the button:  
   **Create records in Route 53** $\rightarrow$ Click **Create records**.
   *(ACM automatically inserts the DNS validation CNAME into your Route 53 hosted zone! Within 5 to 10 minutes, the certificate status turns to **Issued** 🟢).*

---

### Part 2: Add HTTPS Listener to Your ALB (Port 443)
Now that your certificate is Issued, attach it to your Load Balancer:

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/) $\rightarrow$ click **Load Balancers**.
2. Click on `production-alb`.
3. Under the **Listeners and rules** tab, click **Add listener**.
4. Settings:
   - **Protocol**: `HTTPS` | **Port**: `443`
   - **Default action**: Select **Forward to** $\rightarrow$ choose `production-tg` 🎯.
   - **Secure listener settings**:
     - Certificate source: Select **From ACM**.
     - Certificate (from ACM): Select your issued certificate.
5. Click **Add**.

---

### Part 3: Automatic HTTP to HTTPS Redirection (Best Practice!)
Never let users stay on insecure HTTP! Let's redirect Port 80 to Port 443 automatically:

1. In the `production-alb` listeners tab, select the **HTTP : 80** listener.
2. Click **Manage listener** $\rightarrow$ **Edit listener**.
3. Under **Default action**:
   - Change from *Forward to* $\rightarrow$ select **Redirect to URL** 🔀.
   - **Protocol**: `HTTPS`
   - **Port**: `443`
   - **Status code**: Select `301 - Permanently moved`.
4. Click **Save changes**.

*Now, any user visiting `http://...` is automatically redirected to secure `https://...`!* 🔒

---

### Part 4: Point Your Domain to the ALB in Route 53
1. Open the [Amazon Route 53 Console](https://console.aws.amazon.com/route53/).
2. In the left menu, click **Hosted zones** $\rightarrow$ click your domain name.
3. Click the orange **Create record** button.
4. Record details:
   - **Record name**: `app` (e.g., `app.yourdomain.com`) or leave blank for root domain.
   - **Record type**: `A - Routes traffic to an IPv4 address and some AWS resources`.
   - Toggle the switch: ✅ **Alias**.
   - **Route traffic to**:
     - Choose endpoint: Select **Alias to Application and Classic Load Balancer**.
     - Choose Region: Select your region (e.g., `us-east-1`).
     - Choose load balancer: Select your `production-alb`!
5. Click **Create records**! 🎉

---

## 🔍 Checkpoints: How to Verify HTTPS & DNS Live

1. **Test DNS Resolution**:
   Open terminal and test your domain:
   ```bash
   nslookup app.yourdomain.com
   ```
   *Expected Output*: Returns the dynamic IP addresses of your Application Load Balancer! 🌍

2. **Verify Automated HTTP to HTTPS Redirection**:
   Open browser and type:
   `http://app.yourdomain.com` (Explicitly typing `http://`)
   *Expected Result*: Instantly redirects to `https://app.yourdomain.com` with the secure padlock icon 🔒!

3. **Inspect the SSL Certificate**:
   Click the padlock icon in the browser address bar $\rightarrow$ **Connection is secure** $\rightarrow$ **Certificate is valid**:
   - Issuer: **Amazon**
   - Valid for: `*.yourdomain.com`

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: AWS Certificate Manager SSL Certificate Issued
<!-- Replace with your screenshot path once taken -->
![ACM Certificate Issued](./screenshots/14-acm-ssl-issued.png)
*Caption: AWS Certificate Manager showing public certificate with status Issued.*

### 🖼️ Screenshot 2: Application Load Balancer HTTPS 443 Listener
<!-- Replace with your screenshot path once taken -->
![ALB HTTPS Listener](./screenshots/15-alb-https-listener.png)
*Caption: production-alb listeners showing HTTP 80 redirecting to HTTPS 443 and HTTPS 443 forwarding to production-tg.*

### 🖼️ Screenshot 3: Route 53 Alias Record Pointing to ALB
<!-- Replace with your screenshot path once taken -->
![Route 53 Alias Record](./screenshots/16-route53-alias-record.png)
*Caption: Route 53 record details showing Alias targeting dualstack.production-alb.*

---

## ⏭️ Ready for Day 8?
Learn how to monitor metrics and set up automated CloudWatch alerts:  
👉 **[Go to Step 8: 08-cloudwatch-monitoring.md](./08-cloudwatch-monitoring.md)**
