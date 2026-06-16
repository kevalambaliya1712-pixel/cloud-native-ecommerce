# CloudCommerce — Architecture Documentation

## 1. System Overview

CloudCommerce is a cloud-native e-commerce platform built on microservices architecture, deployed on Azure Kubernetes Service (AKS). The platform demonstrates enterprise-grade patterns including:

- **Microservices Architecture** with Domain-Driven Design (DDD)
- **API Gateway Pattern** for unified entry point and cross-cutting concerns
- **Infrastructure as Code** via Terraform modules
- **GitOps CI/CD** with GitHub Actions
- **Zero Trust Security** with network policies and managed identities
- **Observability** via Prometheus, Grafana, and Fluent Bit

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Azure Cloud                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Azure Application Gateway (WAF v2 + TLS Termination)        │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                           │
│  ┌──────────────────────▼───────────────────────────────────────┐   │
│  │  Azure Kubernetes Service (AKS)                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐  │   │
│  │  │  cloudcommerce namespace                                 │  │   │
│  │  │                                                          │  │   │
│  │  │  ┌──────────┐    ┌──────────────────────────────────┐   │  │   │
│  │  │  │ Frontend  │    │        API Gateway (:3000)       │   │  │   │
│  │  │  │ (Nginx)   │    │   JWT Validation / Rate Limit    │   │  │   │
│  │  │  │  :80      │    │   Request Routing / Proxy        │   │  │   │
│  │  │  └──────────┘    └──────┬───┬───┬───┬───┬──────────┘   │  │   │
│  │  │                         │   │   │   │   │               │  │   │
│  │  │    ┌────────────────────┘   │   │   │   └───────────┐  │  │   │
│  │  │    ▼                        ▼   │   ▼               ▼  │  │   │
│  │  │  ┌──────┐  ┌─────────┐  ┌──┴──┐│ ┌──────┐  ┌──────┐  │  │   │
│  │  │  │User  │  │Product  │  │Cart ││ │Order │  │Notif │  │  │   │
│  │  │  │Svc   │  │Svc      │  │Svc  ││ │Svc   │  │Svc   │  │  │   │
│  │  │  │:3001 │  │:3002    │  │:3003││ │:3004 │  │:3005 │  │  │   │
│  │  │  └──┬───┘  └──┬──────┘  └──┬──┘│ └──┬───┘  └──────┘  │  │   │
│  │  │     │         │            │    │    │                  │  │   │
│  │  └─────┼─────────┼────────────┼────┼────┼─────────────────┘  │   │
│  │        │         │            │    │    │                      │   │
│  │  ┌─────▼─────────▼────────────▼────┼────▼──────────────────┐  │   │
│  │  │         Azure SQL Elastic Pool  │                        │  │   │
│  │  │  ┌───────┐ ┌────────┐ ┌──────┐ │ ┌───────┐             │  │   │
│  │  │  │UsersDB│ │ProdDB  │ │CartDB│ │ │OrderDB│             │  │   │
│  │  │  └───────┘ └────────┘ └──────┘ │ └───────┘             │  │   │
│  │  └─────────────────────────────────┘                       │  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │ Azure Key   │  │ Azure       │  │ Azure Log    │               │
│  │ Vault       │  │ Container   │  │ Analytics    │               │
│  │ (Secrets)   │  │ Registry    │  │ (Logs)       │               │
│  └─────────────┘  └─────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Domain-Driven Design (DDD) Bounded Contexts

| Bounded Context | Service | Aggregate Root | Key Entities |
|----------------|---------|----------------|--------------|
| Identity & Access | User Service | User | Profile, Credentials, Session |
| Product Catalog | Product Service | Product | Category, Price, Inventory |
| Shopping Cart | Cart Service | Cart | CartItem, CartTotal |
| Order Management | Order Service | Order | OrderItem, Payment, Shipping |
| Notifications | Notification Service | Notification | Template, Channel, Delivery |

---

## 4. Service Communication

### Synchronous (HTTP/REST)
- All inter-service communication routes through the **API Gateway**
- Gateway performs JWT validation, rate limiting, and request proxying
- Services use K8s DNS for internal discovery: `<service>.cloudcommerce.svc.cluster.local`

### Asynchronous (Event-Driven — Future)
- Order → Notification: Event-based via Azure Service Bus (planned)
- Order → Product: Inventory decrement via saga pattern (planned)

---

## 5. Security Architecture

### Defense in Depth
1. **Edge**: Azure Application Gateway WAF v2 (OWASP 3.2 rules)
2. **Network**: Zero-trust network policies (default deny, explicit allow)
3. **Transport**: TLS everywhere (terminated at App Gateway, re-encrypted internally)
4. **Application**: JWT bearer tokens, Helmet.js headers, rate limiting
5. **Secrets**: Azure Key Vault with CSI driver (secrets never in manifests)
6. **Identity**: Azure Workload Identity (pod-level managed identity)

### RBAC
- Kubernetes RBAC: ServiceAccount per namespace, least-privilege roles
- Azure RBAC: Managed identities with scoped Key Vault/ACR access

---

## 6. Observability Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Metrics | Prometheus | Time-series metrics collection |
| Visualization | Grafana | Dashboards and alerting UI |
| Logging | Fluent Bit → Log Analytics | Structured log aggregation |
| Tracing | Application Insights | Distributed tracing (future) |
| Alerting | Prometheus Alertmanager | SLA-based alert routing |

### Key SLIs/SLOs
| SLI | SLO Target | Alert Threshold |
|-----|-----------|-----------------|
| Availability | 99.9% | < 99.5% for 5m |
| Latency (p99) | < 500ms | > 2s for 5m |
| Error Rate | < 0.1% | > 5% for 5m |

---

## 7. Infrastructure as Code

### Terraform Module Structure
```
infrastructure/
├── modules/
│   ├── aks/           # Azure Kubernetes Service
│   ├── acr/           # Azure Container Registry
│   ├── sql-database/  # Azure SQL with elastic pool
│   ├── key-vault/     # Azure Key Vault + policies
│   ├── monitoring/    # App Insights + Log Analytics
│   ├── networking/    # VNet, Subnets, NSGs
│   ├── app-gateway/   # Application Gateway WAF v2
│   └── storage/       # Azure Blob Storage
├── environments/
│   ├── dev/           # Dev composition
│   ├── staging/       # Staging composition
│   └── prod/          # Production composition
└── backend/           # Remote state (Azure Storage)
```

---

## 8. CI/CD Pipeline

```
┌──────────┐     ┌───────────┐     ┌─────────────┐     ┌──────────────┐
│  Commit  │────▶│  CI       │────▶│ Build &     │────▶│  Deploy      │
│  to main │     │  Pipeline │     │ Push (ACR)  │     │  (Kustomize) │
└──────────┘     │           │     └─────────────┘     │              │
                 │ • Lint    │                          │ Dev ──auto── │
                 │ • Test    │                          │ Stg ──gate── │
                 │ • Trivy   │                          │ Prod ─gate── │
                 │ • OWASP   │                          └──────────────┘
                 └───────────┘
```

### Pipeline Features
- **Matrix strategy**: Parallel lint/test across all 7 services
- **Change detection**: Only build modified services
- **Image scanning**: Trivy on every built image
- **Environment gates**: Manual approval for staging/production
- **Auto-rollback**: Health check failure triggers `kubectl rollout undo`
