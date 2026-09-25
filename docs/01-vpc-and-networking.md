# 🌐 Step 1: Virtual Private Cloud (VPC) & Multi-AZ Networking

🎯 **Mission**: Build an isolated custom cloud network spanning **2 Availability Zones** with dedicated public, application, and database subnets.

---

## 💡 The Concept: Building a Secure Gated Castle

Think of your custom VPC like a secure medieval castle:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏰 CUSTOM VPC (10.0.0.0/16) - Your Private Estate           │
│                                                             │
│  [PUBLIC FRONT GATE] (10.0.1.0/24 & 10.0.2.0/24)            │
│   • Internet Gateway (Drawbridge to the outside world 🌍)   │
│   • Application Load Balancer (Security guards checking IDs)│
│                                                             │
│  [PRIVATE RESIDENTIAL DISTRICT] (10.0.11.0/24 & 10.0.12.0/24│
│   • EC2 Application Servers (Cooks & Staff)                 │
│   • Protected from direct internet attacks 🛡️               │
│                                                             │
│  [UNDERGROUND VAULT] (10.0.21.0/24 & 10.0.22.0/24)          │
│   • Amazon RDS Database (The Royal Treasure 👑)             │
│   • ZERO internet route. Accessible ONLY from App servers!  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Copy-Paste Configuration Table

Use these exact values in the AWS Management Console:

| Resource | Name | IPv4 CIDR | Availability Zone | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **VPC** | `production-vpc` | `10.0.0.0/16` | All | Entire isolated network |
| **Subnet 1** | `public-subnet-1a` | `10.0.1.0/24` | `us-east-1a` | Load Balancer (AZ A) |
| **Subnet 2** | `public-subnet-1b` | `10.0.2.0/24` | `us-east-1b` | Load Balancer (AZ B) |
| **Subnet 3** | `private-app-subnet-1a` | `10.0.11.0/24` | `us-east-1a` | EC2 App Fleet (AZ A) |
| **Subnet 4** | `private-app-subnet-1b` | `10.0.12.0/24` | `us-east-1b` | EC2 App Fleet (AZ B) |
| **Subnet 5** | `private-db-subnet-1a` | `10.0.21.0/24` | `us-east-1a` | RDS Primary Database |
| **Subnet 6** | `private-db-subnet-1b` | `10.0.22.0/24` | `us-east-1b` | RDS Standby Replica |

---

## 🖱️ Step-by-Step AWS Console Recipe

### 1. Create the VPC
1. Open the [AWS VPC Console](https://console.aws.amazon.com/vpc/).
2. Click **Your VPCs** $\rightarrow$ Click **Create VPC**.
3. Choose **VPC only**.
4. **Name tag**: `production-vpc`
5. **IPv4 CIDR**: `10.0.0.0/16`
6. Click **Create VPC**.

---

### 2. Create the 6 Subnets
In the left menu, click **Subnets** $\rightarrow$ Click **Create subnet** $\rightarrow$ Select `production-vpc`.

Add each subnet from the table above:
1. `public-subnet-1a` $\rightarrow$ AZ: `us-east-1a` $\rightarrow$ CIDR: `10.0.1.0/24`
2. `public-subnet-1b` $\rightarrow$ AZ: `us-east-1b` $\rightarrow$ CIDR: `10.0.2.0/24`
3. `private-app-subnet-1a` $\rightarrow$ AZ: `us-east-1a` $\rightarrow$ CIDR: `10.0.11.0/24`
4. `private-app-subnet-1b` $\rightarrow$ AZ: `us-east-1b` $\rightarrow$ CIDR: `10.0.12.0/24`
5. `private-db-subnet-1a` $\rightarrow$ AZ: `us-east-1a` $\rightarrow$ CIDR: `10.0.21.0/24`
6. `private-db-subnet-1b` $\rightarrow$ AZ: `us-east-1b` $\rightarrow$ CIDR: `10.0.22.0/24`

Click **Create subnet**.

> [!IMPORTANT]
> **Enable Auto-Assign Public IP for Outbound Downloads**:
> 1. In **Subnets**, select `public-subnet-1a` $\rightarrow$ **Actions** $\rightarrow$ **Edit subnet settings**.
> 2. Check ✅ **Enable auto-assign public IPv4 address** $\rightarrow$ Click **Save**.
> 3. Repeat for `public-subnet-1b`, `private-app-subnet-1a`, and `private-app-subnet-1b`.  
> *(Leave `private-db-subnet-1a` and `1b` unchecked so the database remains 100% private!)*

---

### 3. Create & Attach Internet Gateway (IGW)
1. Click **Internet Gateways** $\rightarrow$ Click **Create internet gateway**.
2. **Name tag**: `production-igw` $\rightarrow$ Click **Create internet gateway**.
3. Click **Actions** $\rightarrow$ **Attach to VPC** $\rightarrow$ Select `production-vpc` $\rightarrow$ Click **Attach internet gateway**.

---

### 4. Configure Route Tables

#### A. Public / App Route Table (With Internet Route):
1. Click **Route Tables** $\rightarrow$ Click **Create route table**.
2. **Name**: `public-route-table` $\rightarrow$ Select `production-vpc` $\rightarrow$ Click **Create**.
3. Click the **Routes** tab $\rightarrow$ Click **Edit routes**:
   - Add route: Destination `0.0.0.0/0` $\rightarrow$ Target: **Internet Gateway** (`production-igw`).
   - Click **Save changes**.
4. Click **Subnet associations** tab $\rightarrow$ Click **Edit subnet associations**:
   - Check: `public-subnet-1a`, `public-subnet-1b`, `private-app-subnet-1a`, `private-app-subnet-1b`.
   - Click **Save associations**.

#### B. Database Route Table (Zero Internet Exposure):
1. Click **Create route table**.
2. **Name**: `database-private-route-table` $\rightarrow$ Select `production-vpc` $\rightarrow$ Click **Create**.
3. Click **Subnet associations** tab $\rightarrow$ Click **Edit subnet associations**:
   - Check only: `private-db-subnet-1a` and `private-db-subnet-1b`.
   - Click **Save associations**.  
   *(Notice: No route to the Internet Gateway exists here, isolating your database completely!)*

---

## 🔍 Checkpoints: How to Verify

1. Open the [VPC Console](https://console.aws.amazon.com/vpc/) $\rightarrow$ click `production-vpc`.
2. Scroll down to the **Resource map** tab:
   - You will see `production-vpc` connected to 6 subnets, 2 route tables, and `production-igw`.
   - If all green lines connect properly, your network is 100% ready! 🟢

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: Custom VPC Created
![Custom VPC Created](./screenshots/01-vpc-created.png)

### 🖼️ Screenshot 2: Six Multi-AZ Subnets Created
![Six Multi-AZ Subnets Created](./screenshots/02-vpc-subnets-created.png)

### 🖼️ Screenshot 3: Internet Gateway Attached & Route Table Configured
![Internet Gateway Attached & Route Table Configured](./screenshots/03-vpc-igw-route-table.png)

---

## ⏭️ Ready for Step 2?

Now let's configure your 3-tier firewall defense with Security Groups:  
👉 **[Go to Step 2: 02-security-groups-defense.md](./02-security-groups-defense.md)**
