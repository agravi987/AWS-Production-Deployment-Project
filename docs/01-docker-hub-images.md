# 🐳 Step 1: Docker Images & Docker Hub Registry Mastery

🎯 **Mission**: Build the production container images for the **React Frontend** and **Express Backend**, test them locally with Docker Compose, and push them to **Docker Hub** so AWS EC2 can download them.

---

## 💡 The Concept: Why Docker Hub in Cloud Architecture?

In traditional deployments, you would have to install Node.js, npm, Nginx, and all packages directly on every single EC2 virtual machine.  
With **Docker & Docker Hub**:
1. You package your application code, dependencies, and web server into lightweight immutable container images.
2. You push the images to **Docker Hub** (the public cloud container registry).
3. When your AWS Auto Scaling Group spins up EC2 instances in private subnets, the instances simply pull `ravi0706/devops-client:latest` and `ravi0706/devops-server:latest` and boot instantly! ⚡

```
┌─────────────────────────────────┐
│     Your Local Machine 💻       │
│  • React Frontend (Vite + Nginx)│
│  • Express Backend (Node.js)    │
└────────────────┬────────────────┘
                 │ 1. docker build & docker push
                 ▼
┌─────────────────────────────────┐
│       Docker Hub Registry 🐳    │
│  • ravi0706/devops-client       │
│  • ravi0706/devops-server       │
└────────────────┬────────────────┘
                 │ 2. Automated docker compose pull at boot
                 ▼
┌─────────────────────────────────┐
│   AWS EC2 Auto Scaling Fleet ☁️ │
│   (Running in AWS VPC Subnets)  │
└─────────────────────────────────┘
```

---

## 📋 Image & Port Specifications

| Application Tier | Technology Stack | Docker Hub Image Tag | Port | Health / Route |
| :--- | :--- | :--- | :---: | :--- |
| **Backend API** | Node.js 20, Express, PostgreSQL `pg` | `ravi0706/devops-server:latest` | `5000` | `/api/health` |
| **Frontend Web** | React 18, Vite, Nginx Alpine | `ravi0706/devops-client:latest` | `80` | `/` and reverse proxy `/api/` |

---

## 🖱️ Step-by-Step Command Walkthrough

### 1. Test the Application Locally with Docker Compose
Before pushing to Docker Hub, verify that the frontend, backend, and PostgreSQL database communicate properly on your local computer:

Open your terminal in the `aws-production-deployment-project/app` folder:
```bash
# Navigate to the app directory
cd "d:\Current Projects\Cloud and DevOps Projects\aws-production-deployment-project\app"

# Start all 3 containers (Frontend, Backend, and local PostgreSQL)
docker compose -f docker-compose.local.yml up --build -d
```

#### Test Local Health:
```bash
# Check running containers
docker ps

# Verify backend health check
curl http://localhost/api/health
```
*Expected Output*:
```json
{"status":"UP","timestamp":"...","uptimeSeconds":15,"database":"connected","environment":"development"}
```

Open your browser to `http://localhost`:
- The React Task Manager dashboard will load.
- You can add a task, check it off, and verify database persistence!

Once verified, stop the local test containers:
```bash
docker compose -f docker-compose.local.yml down
```

---

### 2. Log in to Docker Hub
Authenticate your terminal with your Docker Hub account:
```bash
docker login
```
*(Enter your Docker Hub username: `ravi0706` and your password or Personal Access Token).*

---

### 3. Build & Tag Production Images
Build the production Docker images for both services:

```bash
# 1. Build the Backend API image
docker build -t ravi0706/devops-server:latest ./server

# 2. Build the Frontend React image (Multi-stage Nginx build)
docker build -t ravi0706/devops-client:latest ./client
```

---

### 4. Push Images to Docker Hub
Push both images to your public Docker Hub repository:

```bash
# Push backend container image
docker push ravi0706/devops-server:latest

# Push frontend container image
docker push ravi0706/devops-client:latest
```

---

## 🔍 Checkpoints: How to Verify on Docker Hub

1. Open your browser and go to [hub.docker.com](https://hub.docker.com/).
2. Log in and navigate to **Repositories**:
   - Confirm repository `ravi0706/devops-server` exists with tag `latest` 🟢.
   - Confirm repository `ravi0706/devops-client` exists with tag `latest` 🟢.
   - Ensure visibility is set to **Public** so your AWS EC2 instances can download them without requiring Docker Hub credentials.

---

## 📸 Proof of Work: Screenshots

### 🖼️ Screenshot 1: Docker Containers Running Locally
<!-- Save screenshot of docker ps and browser on localhost -->
`docs/screenshots/00-docker-desktop-local.png`

### 🖼️ Screenshot 2: Docker Hub Repositories Pushed
<!-- Save screenshot of Docker Hub web page showing ravi0706 repositories -->
`docs/screenshots/00-docker-hub-repositories.png`

---

## ⏭️ Ready for Step 2?

Now that our container images are published on Docker Hub, let's build our AWS cloud network from scratch:  
👉 **[Go to Step 2: 02-vpc-and-networking.md](./02-vpc-and-networking.md)**
