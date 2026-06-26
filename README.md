# ☁️ CloudCommerce — Enterprise Cloud-Native E-Commerce Platform

[![CI Pipeline](https://github.com/your-org/cloudcommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/cloudcommerce/actions/workflows/ci.yml)
[![Build & Push](https://github.com/your-org/cloudcommerce/actions/workflows/build-push.yml/badge.svg)](https://github.com/your-org/cloudcommerce/actions/workflows/build-push.yml)
[![Deploy](https://github.com/your-org/cloudcommerce/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-org/cloudcommerce/actions/workflows/deploy.yml)
[![Terraform](https://github.com/your-org/cloudcommerce/actions/workflows/terraform.yml/badge.svg)](https://github.com/your-org/cloudcommerce/actions/workflows/terraform.yml)

> A production-grade, cloud-native e-commerce platform built on **microservices architecture** and deployed on **Azure Kubernetes Service (AKS)** with comprehensive IaC, CI/CD, observability, and security.

---

## 🏗️ Architecture

```
                    ┌──────────────────────────────────────┐
                    │   Azure Application Gateway (WAF v2) │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │         Azure Kubernetes Service      │
                    │  ┌─────────────────────────────────┐  │
                    │  │        API Gateway (:3000)       │  │
                    │  │   JWT • Rate Limit • Proxy       │  │
                    │  └───┬───┬───┬───┬───┬─────────────┘  │
                    │      │   │   │   │   │                 │
                    │  ┌───▼┐┌─▼──┐┌▼──┐┌─▼──┐┌──▼──────┐  │
                    │  │User││Prod││Cart││Ordr││Notif    │  │
                    │  │Svc ││Svc ││Svc ││Svc ││Svc      │  │
                    │  └────┘└────┘└────┘└────┘└─────────┘  │
                    └───────────────────────────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │     Azure SQL  •  Key Vault  •  ACR  │
                    └──────────────────────────────────────┘
```

### Key Design Patterns
- **Microservices Architecture** with Domain-Driven Design (DDD)
- **API Gateway Pattern** — Unified entry, JWT validation, rate limiting
- **Database-per-Service** — Isolated data stores via Azure SQL Elastic Pool
- **Zero Trust Security** — Network policies, managed identities, WAF
- **Infrastructure as Code** — Terraform modules with environment compositions
- **GitOps CI/CD** — GitHub Actions with environment promotion gates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **API Gateway** | Node.js + Express + http-proxy-middleware |
| **Microservices** | Node.js + Express + TypeORM |
| **Database** | Azure SQL (SQLite for local dev) |
| **Containerization** | Docker + Docker Compose |
| **Orchestration** | Kubernetes (AKS) + Kustomize |
| **Infrastructure** | Terraform (Azure Provider) |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Prometheus + Grafana + Fluent Bit |
| **Security** | Azure Key Vault + WAF v2 + Workload Identity |
| **AI Integration** | Google Gemini API |

---

## 📁 Repository Structure

```
cloudcommerce/
├── frontend/                  # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── services/          # API client layer
│   │   └── App.tsx
│   ├── Dockerfile             # Multi-stage Nginx build
│   └── package.json
│
├── services/                  # Backend microservices
│   ├── api-gateway/           # Request routing, JWT, rate limiting
│   ├── user-service/          # Authentication & user management
│   ├── product-service/       # Product catalog & AI consultation
│   ├── cart-service/          # Shopping cart management
│   ├── order-service/         # Order processing & payments
│   └── notification-service/  # Email & push notifications
│
├── infrastructure/            # Terraform IaC
│   ├── modules/               # Reusable modules (AKS, ACR, SQL, etc.)
│   ├── environments/          # Dev, Staging, Production compositions
│   └── backend/               # Remote state bootstrap
│
├── kubernetes/                # K8s manifests (Kustomize)
│   ├── base/                  # Base resources
│   │   ├── services/          # Deployments, Services, HPA, PDB
│   │   ├── ingress/           # AGIC Ingress
│   │   ├── network-policies/  # Zero-trust microsegmentation
│   │   ├── rbac/              # ServiceAccounts, Roles, Bindings
│   │   ├── monitoring/        # Prometheus, Grafana, Fluent Bit
│   │   └── configmaps/        # Application configuration
│   └── overlays/              # Environment-specific overrides
│       ├── dev/
│       ├── staging/
│       └── production/
│
├── .github/workflows/         # CI/CD pipelines
│   ├── ci.yml                 # Lint, test, security scan
│   ├── build-push.yml         # Docker build & ACR push
│   ├── deploy.yml             # AKS deployment (dev/stg/prod)
│   └── terraform.yml          # IaC plan & apply
│
├── docs/                      # Enterprise documentation
│   ├── architecture.md
│   ├── deployment-guide.md
│   ├── operations-runbook.md
│   ├── security.md
│   ├── monitoring.md
│   ├── disaster-recovery.md
│   └── cost-optimization.md
│
├── docker-compose.yml         # Local development orchestration
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20 LTS
- Docker Desktop ≥ 24.0
- Azure CLI ≥ 2.55 (for cloud deployment)

### Local Development (Docker Compose)
```bash
# Clone the repository
git clone https://github.com/your-org/cloudcommerce.git
cd cloudcommerce

# Start all services
docker compose up --build

# Access the application:
# Frontend:     http://localhost:5173
# API Gateway:  http://localhost:3000
# Prometheus:   http://localhost:9090
# Grafana:      http://localhost:3001
```

### Individual Service Development
```bash
# Start a specific service
cd services/user-service
npm install
npm run dev

# Start frontend (with API proxy to gateway)
cd frontend
npm install
npm run dev
```

---

## ☁️ Cloud Deployment

### Infrastructure
```bash
# Bootstrap Terraform state
cd infrastructure/terraform/backend-init && terraform init && terraform apply

# Deploy dev environment
cd infrastructure/terraform/environments/dev && terraform init && terraform apply

# Get AKS credentials
az aks get-credentials -g rg-cloudcommerce-dev -n aks-cloudcommerce-dev
```

### Application
```bash
# Deploy to Kubernetes (dev)
kubectl apply -k kubernetes/overlays/dev/

# Deploy to production
kubectl apply -k kubernetes/overlays/production/
```

> See [Deployment Guide](docs/deployment-guide.md) for complete instructions.

---

## 🔄 CI/CD Pipeline

```
Commit → CI (lint/test/scan) → Build & Push (ACR) → Deploy
                                                      ├── Dev    (auto)
                                                      ├── Staging (manual + approval)
                                                      └── Prod   (manual + approval + auto-rollback)
```

### Pipeline Features
- **Matrix testing** across all 7 services in parallel
- **Change detection** — only build modified services
- **Security scanning** — Trivy CVE + OWASP dependency check
- **Environment gates** — manual approval for staging/production
- **Auto-rollback** — health check failure triggers `kubectl rollout undo`

---

## 📊 Monitoring & Observability

| Pillar | Tool | Purpose |
|--------|------|---------|
| Metrics | Prometheus | Time-series collection (15s scrape) |
| Dashboards | Grafana | Platform overview, per-service panels |
| Logging | Fluent Bit → Log Analytics | Structured JSON log aggregation |
| Alerting | Alertmanager | SLA-based routing (PagerDuty/Slack) |

### SLO Targets
- **Availability**: 99.9% (43 min/month error budget)
- **Latency P99**: < 500ms
- **Error Rate**: < 0.1%

> See [Monitoring Guide](docs/monitoring.md) for KQL queries and dashboard details.

---

## 🔐 Security

- **Edge**: Azure WAF v2 (OWASP 3.2 + DDoS Standard)
- **Network**: Zero-trust network policies + private endpoints
- **Auth**: JWT bearer tokens with API Gateway validation
- **Secrets**: Azure Key Vault via CSI driver (never in code)
- **Supply Chain**: Trivy image scanning + OWASP dependency audit
- **Identity**: Azure Workload Identity (no stored credentials)

> See [Security Documentation](docs/security.md) for full details.

---

## 💰 Cost Optimization

| Environment | Estimated Monthly Cost |
|-------------|----------------------|
| Development | ~$130 |
| Staging | ~$370 |
| Production | ~$1,400-1,800 |

Key strategies: Reserved instances, elastic pools, spot VMs, auto-shutdown for non-prod.

> See [Cost Optimization](docs/cost-optimization.md) for breakdown.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, DDD contexts, communication patterns |
| [Deployment Guide](docs/deployment-guide.md) | Step-by-step deployment for all environments |
| [Operations Runbook](docs/operations-runbook.md) | Incident response, scaling, common procedures |
| [Security](docs/security.md) | Defense-in-depth layers, RBAC, compliance |
| [Monitoring](docs/monitoring.md) | Prometheus queries, Grafana dashboards, SLI/SLO |
| [Disaster Recovery](docs/disaster-recovery.md) | Multi-region failover, RPO/RTO, backup strategy |
| [Cost Optimization](docs/cost-optimization.md) | Azure spend analysis and optimization strategies |

---

## 🧪 Testing

```bash
# Run all service tests
cd services/user-service && npm test
cd services/product-service && npm test

# Run with coverage
npm test -- --coverage

# Lint check
npx eslint . --ext .ts,.tsx
```

---

## 📜 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

> All PRs must pass CI pipeline (lint, test, security scan) before merge.
