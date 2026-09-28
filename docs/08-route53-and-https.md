# 🌍 Step 8: Amazon Route 53 & HTTPS (GoDaddy / Custom Domain + ACM SSL)

🎯 **Mission**: Connect your custom domain (**e.g., `rithulab.online` from GoDaddy**) to AWS using **Amazon Route 53**, and attach a free, auto-renewing **SSL/TLS certificate** from **AWS Certificate Manager (ACM)** to secure your application with HTTPS and the green padlock 🔒!

---

## 💡 The Concept: How GoDaddy Connects to AWS Route 53

You **do NOT need to buy a domain from AWS**. You can use any existing domain (from GoDaddy, Namecheap, Hostinger, etc.).

```
┌───────────────────────────────┐
│     GoDaddy Domain Registrar  │
│      Domain: rithulab.online  │
│  "Nameservers point to AWS"   │
└───────────────┬───────────────┘
                │ Delegates DNS Authority
                ▼
┌───────────────────────────────┐
│   Amazon Route 53 Hosted Zone │
│   Holds DNS records for:      │
│   • rithulab.online           │
│   • app.rithulab.online       │
└───────────────┬───────────────┘
                │ Alias A-Record (Points to ALB)
                ▼
┌───────────────────────────────┐
│ [ALB - HTTPS 443 Listener] 🔒 │
│ Terminating SSL with free ACM │
│ Certificate (rithulab.online) │
└───────────────┬───────────────┘
                │ Forwards HTTP traffic
                ▼
┌───────────────────────────────┐
│  EC2 Auto Scaling App Fleet   │
└───────────────────────────────┘
```

> [!NOTE]
> **Optional Step**: If you do not own a domain or don't want to use one right now, your application is already fully functional via your **ALB DNS URL** (`http://production-alb-xxxx.us-east-1.elb.amazonaws.com`) from Step 6. Step 8 is for production branding and HTTPS encryption.

---

## 📋 The 4-Phase Roadmap for GoDaddy (`rithulab.online`)

| Phase | Where | Action | Outcome |
| :---: | :--- | :--- | :--- |
| **1** | **AWS Route 53** | Create Hosted Zone for `rithulab.online` | Receive 4 AWS Name Servers |
| **2** | **GoDaddy Console** | Change Nameservers to AWS Name Servers | GoDaddy delegates DNS to Route 53 |
| **3** | **AWS ACM** | Request Free Public SSL Certificate | SSL Certificate Issued 🟢 |
| **4** | **AWS Route 53 & ALB** | Create Alias Record & HTTPS 443 Listener | Secure HTTPS with green padlock 🔒 |

---

## 🖱️ Step-by-Step Configuration Recipe

### Phase 1: Create Route 53 Hosted Zone in AWS

1. Open the [Amazon Route 53 Console](https://console.aws.amazon.com/route53/).
2. In the left navigation, click **Hosted zones** $\rightarrow$ Click **Create hosted zone**.
3. **Hosted zone configuration**:
   - **Domain name**: `rithulab.online` *(Enter your exact GoDaddy domain name)*.
   - **Description**: `Production hosted zone for rithulab.online`.
   - **Type**: **Public hosted zone** (Default).
4. Click **Create hosted zone**.
5. AWS creates the zone and displays a table with 2 default records (`SOA` and `NS`).
6. Click on the **NS (Name Server)** record type. You will see **4 values** that look like this:
   ```text
   ns-000.awsdns-00.com.
   ns-000.awsdns-00.net.
   ns-000.awsdns-00.org.
   ns-000.awsdns-00.co.uk.
   ```
7. 📋 **Keep this tab open or copy these 4 nameserver lines!** You need them in Phase 2.

---

### Phase 2: Point GoDaddy Nameservers to AWS Route 53

1. Log in to your [GoDaddy Account](https://dcc.godaddy.com/control/portfolio).
2. Go to **My Products** $\rightarrow$ Find **`rithulab.online`** $\rightarrow$ click **DNS** (or click the three dots `...` $\rightarrow$ **Manage DNS**).
3. Scroll to the **Nameservers** section.
4. Click **Change Nameservers** (or **Enter my own nameservers**).
5. Select **I'll use my own nameservers** (Custom).
6. Paste the **4 AWS Route 53 Name Servers** from Phase 1 into GoDaddy:
   - *Line 1*: `ns-xxx.awsdns-xx.com` *(Remove any trailing dot at the end)*
   - *Line 2*: `ns-xxx.awsdns-xx.net`
   - *Line 3*: `ns-xxx.awsdns-xx.org`
   - *Line 4*: `ns-xxx.awsdns-xx.co.uk`
7. Click **Save** $\rightarrow$ Check the confirmation box (if GoDaddy prompts for consent) $\rightarrow$ Click **Continue**.

> [!TIP]
> **DNS Propagation**: GoDaddy updates nameservers quickly (usually within 5 to 15 minutes, maximum up to a few hours). Once changed, Route 53 is the authoritative DNS manager for `rithulab.online`!

---

### Phase 3: Request Free SSL/TLS Certificate in AWS Certificate Manager (ACM)

1. Open the [AWS Certificate Manager (ACM) Console](https://console.aws.amazon.com/acm/) in **`us-east-1`** (N. Virginia).
   *(Make sure you are in the same region as your Load Balancer).*
2. Click **Request certificate** $\rightarrow$ Select **Request a public certificate** $\rightarrow$ Click **Next**.
3. **Domain names**:
   - Primary domain: `rithulab.online`
   - Click **Add another name to this certificate**: `*.rithulab.online` *(The asterisk covers all subdomains like `app.rithulab.online`, `api.rithulab.online`)*.
4. **Validation method**: Select **DNS validation - recommended** ✅.
5. **Key algorithm**: `RSA 2048` (Default).
6. Click **Request**.
7. In the Certificates list, click on the Certificate ID you just requested (it will show Status: *Pending validation*).
8. Under **Domains**, click the button **Create records in Route 53**:
   - A modal appears showing your domains.
   - Click **Create records**.  
   *(AWS automatically adds the required CNAME validation records directly into your Route 53 hosted zone!)*
9. Wait ~2 to 5 minutes and refresh the page.
   - The certificate status will turn **Issued** 🟢!

---

### Phase 4: Route Domain to ALB & Enable HTTPS

#### 1. Create Alias Record in Route 53
1. Go back to [Route 53 Hosted zones](https://console.aws.amazon.com/route53/) $\rightarrow$ click `rithulab.online`.
2. Click **Create record**:
   - **Record name**: Leave blank (for root `rithulab.online`) OR type `app` (for `app.rithulab.online`).
   - **Record type**: `A - Routes traffic to an IPv4 address and some AWS resources`.
   - **Alias**: Toggle to **ON** ✅.
   - **Route traffic to**:
     - Endpoint: **Alias to Application and Classic Load Balancer**.
     - Region: **US East (N. Virginia) [us-east-1]**.
     - Load Balancer: Select **`production-alb`**.
   - **Routing policy**: `Simple routing`.
3. Click **Create records**! 🎉

#### 2. Add HTTPS Listener to Application Load Balancer
1. Open the [EC2 Console](https://console.aws.amazon.com/ec2/) $\rightarrow$ **Load Balancers** $\rightarrow$ select `production-alb`.
2. Select the **Listeners and rules** tab $\rightarrow$ Click **Add listener**:
   - **Protocol**: `HTTPS` | **Port**: `443`
   - **Default action**: **Forward to** $\rightarrow$ choose `production-tg`
   - **Security policy**: `ELBSecurityPolicy-TLS13-1-2-2021-06` (Recommended standard)
   - **Default SSL/TLS certificate**:
     - Certificate source: **From ACM**
     - Certificate: Select `rithulab.online` (Issued)
   - Click **Add**.

#### 3. (Optional & Recommended) Redirect HTTP (80) to HTTPS (443)
1. On the same `production-alb` **Listeners and rules** tab:
2. Select the existing **HTTP:80** listener $\rightarrow$ Click **Manage listener** $\rightarrow$ **Edit listener**.
3. Under **Default actions**, remove forward to `production-tg` and choose **Redirect to URL**:
   - **URI parts**:
     - Protocol: `HTTPS`
     - Port: `443`
     - Status code: `301 - Permanently moved`
4. Click **Save changes**! 🔒

---

## 🔍 Checkpoints: How to Verify & Test

1. Open your terminal and test the redirect:
   ```bash
   curl -I http://rithulab.online
   ```
   *Expected response*: `HTTP/1.1 301 Moved Permanently` $\rightarrow$ `Location: https://rithulab.online:443/`

2. Open your web browser and navigate to:
   ```text
   https://rithulab.online
   ```
   *(or `https://app.rithulab.online` if you created the `app` record).*

3. Verify:
   - The **green padlock 🔒** appears next to the URL.
   - The connection is encrypted with **TLS 1.3**.
   - Your AWS full-stack React frontend and backend load securely! 🎉

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: Route 53 Hosted Zone with GoDaddy Name Servers
<!-- Capture screenshot of Route 53 showing rithulab.online hosted zone and NS records -->
`docs/screenshots/14-route53-hosted-zone-godaddy.png`

### 🖼️ Screenshot 2: ACM Public Certificate Issued
<!-- Capture screenshot from ACM Console showing rithulab.online status: Issued -->
`docs/screenshots/15-acm-ssl-issued.png`

### 🖼️ Screenshot 3: Application Load Balancer HTTPS:443 Listener
<!-- Capture screenshot from ALB Listeners tab showing HTTP:80 redirect and HTTPS:443 listener -->
`docs/screenshots/16-alb-https-listener.png`

### 🖼️ Screenshot 4: Live Website with HTTPS Green Padlock
<!-- Capture browser screenshot showing https://rithulab.online with padlock -->
`docs/screenshots/17-live-domain-https-padlock.png`

---

## ⏭️ Ready for Step 9?

Now that your custom domain is secured with HTTPS, let's configure observability, CloudWatch alarms, and automated SNS email alerts:  
👉 **[Go to Step 9: 09-cloudwatch-monitoring.md](./09-cloudwatch-monitoring.md)**
