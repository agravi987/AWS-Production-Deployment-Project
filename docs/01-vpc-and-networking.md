# 🌐 Step 1: Virtual Private Cloud (VPC) & Multi-AZ Networking

Welcome to Day 1! 🚀  
One of the biggest mistakes beginners make in AWS is launching everything into the "Default VPC".  
In professional cloud engineering, **we build a custom VPC with strict network isolation**.

---

## 🏰 The Analogy: Building a Secure Gated Castle

Think of your cloud infrastructure like a secure medieval castle:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏰 CUSTOM VPC (10.0.0.0/16) - Your Private Estate           │
│                                                             │
│  [PUBLIC SUB-DISTRICT] (Front Gate & Courtyard)             │
│   • Internet Gateway (Drawbridge to the outside world 🌍)   │
│   • Application Load Balancer (Security guards checking IDs)│
│                                                             │
│  [PRIVATE RESIDENTIAL DISTRICT] (Inside the Castle Walls)   │
│   • EC2 Application Servers (Cooks & Staff)                 │
│   • Cannot be seen from outside the castle! 🛡️              │
│                                                             │
│  [UNDERGROUND VAULT] (Deepest Secret Chamber)               │
│   • Amazon RDS Database (The Royal Treasure 👑)             │
│   • ZERO outside doors. Only accessible by castle staff!    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔢 Understanding CIDR Notation (Without the Headache!)

When creating networks in AWS, you will see numbers like `10.0.0.0/16`.

| CIDR Block | What It Means | Usable IP Addresses | Best For |
| :--- | :--- | :---: | :--- |
| **`10.0.0.0/16`** | A giant private network. | **65,536 IPs** | Your entire VPC. |
| **`10.0.1.0/24`** | A smaller slice of the network. | **251 IPs** | Individual Subnets. |

> [!NOTE]
> AWS reserves 5 IP addresses in every subnet for network routing, DNS, and broadcast. So a `/24` gives you $256 - 5 = 251$ usable server IPs.

---

## 🗺️ Our 6-Subnet Architecture Across 2 Availability Zones

To ensure high availability (so your website stays online even if an entire AWS data center suffers a power outage), we span across **two Availability Zones** (`us-east-1a` and `us-east-1b`):

```
VPC: 10.0.0.0/16
│
├── 📍 Availability Zone A (e.g., us-east-1a)
│   ├── 🌐 Public Subnet A:     10.0.1.0/24   (For ALB)
│   ├── 🔒 Private App Subnet A: 10.0.11.0/24  (For EC2 #1)
│   └── 🐘 Private DB Subnet A:  10.0.21.0/24  (For RDS Primary)
│
└── 📍 Availability Zone B (e.g., us-east-1b)
    ├── 🌐 Public Subnet B:     10.0.2.0/24   (For ALB)
    ├── 🔒 Private App Subnet B: 10.0.12.0/24  (For EC2 #2)
    └── 🐘 Private DB Subnet B:  10.0.22.0/24  (For RDS Standby)
```

---

## 🖱️ Step-by-Step AWS Management Console Walkthrough

### Part 1: Create the Custom VPC
1. Log into your [AWS Console](https://console.aws.amazon.com/).
2. In the top search bar, type **VPC** and click **VPC**.
3. In the left menu, click **Your VPCs** $\rightarrow$ Click the orange **Create VPC** button.
4. Settings:
   - Select: **VPC only**
   - **Name tag**: `production-vpc`
   - **IPv4 CIDR block**: `10.0.0.0/16`
   - **Tenancy**: `Default`
5. Click **Create VPC**.

---

### Part 2: Create the 6 Subnets
In the left menu, click **Subnets** $\rightarrow$ Click **Create subnet**.
Select your `production-vpc`, then create the subnets using this exact table:

| # | Subnet Name | Availability Zone | IPv4 CIDR Block | Type |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `public-subnet-1a` | `us-east-1a` | `10.0.1.0/24` | 🌐 Public (ALB) |
| **2** | `public-subnet-1b` | `us-east-1b` | `10.0.2.0/24` | 🌐 Public (ALB) |
| **3** | `private-app-subnet-1a` | `us-east-1a` | `10.0.11.0/24` | 🔒 Private (App) |
| **4** | `private-app-subnet-1b` | `us-east-1b` | `10.0.12.0/24` | 🔒 Private (App) |
| **5** | `private-db-subnet-1a` | `us-east-1a` | `10.0.21.0/24` | 🐘 Private (Database) |
| **6** | `private-db-subnet-1b` | `us-east-1b` | `10.0.22.0/24` | 🐘 Private (Database) |

#### 💡 Enable Auto-assign Public IP for Public Subnets:
1. Select `public-subnet-1a` $\rightarrow$ Click **Actions** $\rightarrow$ **Edit subnet settings**.
2. Check ✅ **Enable auto-assign public IPv4 address** $\rightarrow$ Click **Save**.
3. Repeat for `public-subnet-1b`.

---

### Part 3: Create and Attach the Internet Gateway (IGW)
An Internet Gateway is the gateway that connects your VPC to the public internet:

1. In the left menu, click **Internet Gateways** $\rightarrow$ Click **Create internet gateway**.
2. **Name tag**: `production-igw` $\rightarrow$ Click **Create internet gateway**.
3. On the next screen, click **Actions** $\rightarrow$ **Attach to VPC**.
4. Select `production-vpc` $\rightarrow$ Click **Attach internet gateway**.

---

### Part 4: Configure Route Tables
A **Route Table** is the highway road signs determining where network packets travel.

#### 1. Public Route Table:
1. In the left menu, click **Route Tables** $\rightarrow$ Click **Create route table**.
2. **Name**: `public-route-table` $\rightarrow$ Select `production-vpc` $\rightarrow$ Click **Create**.
3. Click the **Routes** tab $\rightarrow$ Click **Edit routes**.
4. Click **Add route**:
   - **Destination**: `0.0.0.0/0` (All internet traffic)
   - **Target**: Select **Internet Gateway** $\rightarrow$ choose `production-igw`.
   - Click **Save changes**.
5. Click the **Subnet associations** tab $\rightarrow$ Click **Edit subnet associations**.
6. Check both `public-subnet-1a` and `public-subnet-1b` $\rightarrow$ Click **Save associations**.

#### 2. Private Route Table:
1. Click **Create route table**.
2. **Name**: `private-route-table` $\rightarrow$ Select `production-vpc` $\rightarrow$ Click **Create**.
3. Click the **Subnet associations** tab $\rightarrow$ Click **Edit subnet associations**.
4. Check all 4 private subnets (`private-app-1a`, `private-app-1b`, `private-db-1a`, `private-db-1b`) $\rightarrow$ Click **Save associations**.
*(Notice: The private route table has NO route to the Internet Gateway. This makes it completely invisible to internet port scanners!)* 🛡️

---

## 📸 Proof of Work: Screenshots

> [!TIP]
> Save your screenshots into `docs/screenshots/` and update these links:

### 🖼️ Screenshot 1: Custom VPC Created in AWS Console
<!-- Replace with your screenshot path once taken -->
![VPC Created](./screenshots/01-custom-vpc-created.png)
*Caption: AWS VPC Console displaying production-vpc with CIDR block 10.0.0.0/16.*

### 🖼️ Screenshot 2: Six Multi-AZ Subnets Created
<!-- Replace with your screenshot path once taken -->
![Subnets Created](./screenshots/02-subnets-created.png)
*Caption: AWS Subnets Console displaying 2 Public, 2 Private App, and 2 Private DB subnets across Availability Zones.*

### 🖼️ Screenshot 3: Internet Gateway Attached & Route Table Configured
<!-- Replace with your screenshot path once taken -->
![Route Table Configured](./screenshots/03-route-table-igw.png)
*Caption: Public route table showing route 0.0.0.0/0 targeted to production-igw.*

---

## ⏭️ Ready for Day 2?
Now let's build our layered firewall defense with Security Groups:  
👉 **[Go to Step 2: 02-security-groups-defense.md](./02-security-groups-defense.md)**
