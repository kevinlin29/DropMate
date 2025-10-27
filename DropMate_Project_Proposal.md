# Project Proposal — DropMate: Cloud-Native Local Delivery Management System

## 1. Motivation

### Problem Identification
Small businesses—such as **local restaurants, cafés, small retailers, and campus services**—continue to face challenges in efficiently managing deliveries. Many still depend on **manual tools** like spreadsheets, phone calls, or messaging apps to coordinate among managers, drivers, and customers. This results in:

- **Poor transparency:** Customers cannot track orders or ETAs in real time.  
- **Communication gaps:** Drivers receive updates through fragmented channels.  
- **Limited scalability:** Manual coordination breaks down as order volume grows.  
- **Dependency on expensive third-party apps:** Platforms such as Uber Eats or DoorDash take 25–35 % commissions and give little data control.

### Why the Project Is Worth Pursuing
With the rapid growth of **hyperlocal delivery** and **micro-logistics**, small businesses increasingly need affordable digital solutions to compete. **DropMate** addresses this need by providing a **lightweight, cloud-native, and scalable delivery-management platform** deployable on **Fly.io**.  
It allows local merchants to modernize operations, gain delivery transparency, and retain ownership of their customer data—without relying on costly intermediaries.

### Target Users

| User Group | Primary Needs |
|-------------|----------------|
| **Small Businesses / Dispatch Managers** | Dashboard for orders, drivers, and delivery analytics. |
| **Drivers / Couriers** | View assigned deliveries, update statuses, share live location. |
| **Customers** | Real-time tracking, notifications, and communication with drivers. |

### Existing Solutions and Limitations
Commercial platforms (Uber Eats, DoorDash) provide excellent infrastructure but are **closed and expensive**.  
Open-source logistics tools exist but rarely support **scalable deployment**, **persistent data**, or **real-time updates**.  
DropMate bridges this gap using **Dockerized microservices**, **Kubernetes orchestration**, and **persistent PostgreSQL storage** with built-in observability.

---

## 2. Objective and Key Features

### Project Objective
To **design, deploy, and operate** a **cloud-native local delivery management system** enabling managers, drivers, and customers to interact in real time through a **containerized, Kubernetes-orchestrated microservice architecture** hosted on **Fly.io**.  
The system demonstrates mastery of **containerization, orchestration, scalability, monitoring, and persistence**—core technologies of this course.

### Core Features

| Category | Feature | Description / Technology |
|-----------|----------|---------------------------|
| **Architecture** | **Containerized Microservices** | Independent modules (orders, drivers, customers, notifications) in Docker containers. |
| **Orchestration** | **Kubernetes Auto-Scaling** | Pods scale automatically based on CPU and request load. |
| **Persistence** | **PostgreSQL + Fly Volumes** | Durable storage for users, orders, and logs. |
| **Monitoring** | **Prometheus + Grafana (optional)** | Collects and visualizes CPU, latency, and uptime metrics. |
| **API Layer** | **REST + WebSocket** | REST endpoints for CRUD operations; WebSocket for live updates. |
| **Security** | **JWT Authentication / RBAC** | Role-based access for managers, drivers, and customers. |

### Planned Advanced Features
1. **Automated Backup and Recovery**  
   - Scheduled PostgreSQL dumps stored in Fly.io volumes.  
   - Restore scripts to recover from data loss.  
   - Demonstrates stateful cloud storage and fault tolerance.

2. **CI/CD Pipeline (DevOps Automation)**  
   - GitHub Actions for automatic build-test-deploy to Fly.io.  
   - Enforces continuous integration and fast iteration.

3. **Horizontal Pod Auto-Scaling (optional extension)**  
   - Scales pods dynamically based on custom Prometheus metrics.

### Database Schema (Tentative)

| Table | Key Fields | Description |
|--------|-------------|-------------|
| `users` | id, name, email, role, password_hash | Stores user credentials and access level. |
| `orders` | id, customer_id, driver_id, status, pickup_time, delivery_time | Tracks each delivery order. |
| `drivers` | id, name, vehicle_type, location, status | Monitors driver status and current route. |
| `delivery_updates` | id, order_id, timestamp, status_update | Logs delivery events for tracking. |

### Deployment Provider
**Fly.io** is chosen for its simplicity, cost efficiency, and built-in Kubernetes-style orchestration with persistent volumes and load balancing.  
It allows deployment of multiple Dockerized services and integrates smoothly with GitHub Actions for automated CI/CD.

### Monitoring Setup
- **Prometheus:** collects service-level metrics (CPU, memory, latency).  
- **Grafana (optional):** visual dashboard for visualizing trends.  
- Alerts configured for high error rates or storage limits.

### Scope and Feasibility
The project scope is focused on a **functional backend** demonstrating:
- Containerized services  
- Kubernetes orchestration & scaling  
- Persistent PostgreSQL storage  
- Monitoring & backup  
- CI/CD automation  

A lightweight Postman demo or mock frontend will verify end-to-end functionality.  
All goals are achievable within the project timeframe (≈ 4–5 weeks) by parallelizing development among four members.

---

## 3. Tentative Plan

| **Team Member** | **Responsibilities** |
|------------------|----------------------|
| **Kevin Lin (Lead Developer & Architect)** | Design overall system architecture, define APIs, implement WebSocket communication, integrate Fly.io deployment. |
| **Liz Zhu (DevOps & Orchestration Lead)** | Configure Kubernetes cluster, set up Helm charts, implement auto-scaling policies, manage GitHub Actions CI/CD. |
| **Paul Xiao (Database & Storage Engineer)** | Design PostgreSQL schema, implement backup/recovery scripts, manage Fly Volumes and data persistence testing. |
| **David Cao (Monitoring & Testing Engineer)** | Integrate Prometheus, configure monitoring dashboards and alerts, write unit/integration tests, validate system reliability. |

**Collaboration Tools:** GitHub (Version Control), Fly.io (Deployment), Slack / Discord (Communication).  
**Testing Plan:** Automated test suite runs in CI/CD pipeline; manual verification of backup/recovery and scaling.  
**Deliverable:** Deployed backend endpoint with Prometheus metrics and documented API routes.

---

## 4. Expected Outcome

Upon completion, **DropMate** will deliver:
- A **fully containerized, orchestrated, cloud-native backend**.  
- **Persistent database** with automated backup/recovery.  
- **Live metrics dashboard** demonstrating observability.  
- **CI/CD automation** showcasing modern DevOps workflow.  
- A scalable foundation for small-business delivery operations.

---

