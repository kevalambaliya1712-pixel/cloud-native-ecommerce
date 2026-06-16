# CloudCommerce — Security Documentation

## Security Architecture Overview

CloudCommerce implements a **defense-in-depth** security model with seven layers of protection from edge to data.

---

## 1. Edge Security — Azure Application Gateway WAF v2

### Configuration
- **OWASP Core Rule Set**: v3.2 (Prevention mode)
- **Custom Rules**: Rate limiting (100 req/min per IP), geo-blocking
- **Bot Protection**: Enabled with Microsoft managed rules
- **DDoS Protection**: Azure DDoS Standard integrated at VNet level

### WAF Exclusions
| Rule ID | Reason | Scope |
|---------|--------|-------|
| 942430 | JSON body content | /api/orders |
| 920300 | Accept header | Global |

---

## 2. Network Security

### Virtual Network Design
```
VNet: 10.0.0.0/16
├── AKS Subnet:      10.0.0.0/22   (1024 IPs)
├── App Gateway:     10.0.4.0/24   (256 IPs)
├── SQL PE Subnet:   10.0.5.0/24   (Private Endpoints)
├── Key Vault PE:    10.0.6.0/24   (Private Endpoints)
└── Management:      10.0.7.0/24   (Bastion, Jump box)
```

### Network Security Groups (NSGs)
- AKS subnet: Allow 443/80 from App Gateway only
- SQL PE subnet: Allow 1433 from AKS subnet only
- Management: Allow 22/3389 from corporate IP ranges only

### Kubernetes Network Policies (Zero Trust)
- **Default**: Deny all ingress and egress
- **Selective Allow**: Each service has explicit ingress/egress rules
- See `kubernetes/base/network-policies/network-policies.yaml`

---

## 3. Identity & Access Management

### Azure Workload Identity
- Pods authenticate to Azure services via federated tokens
- No service principal credentials stored in cluster
- Scoped managed identities per service

### RBAC Model
| Principal | Role | Scope |
|-----------|------|-------|
| AKS Kubelet MI | AcrPull | Container Registry |
| App MI | Key Vault Secrets User | Key Vault |
| CI/CD SP | Contributor | Resource Group |
| Dev Team | Reader | Resource Group (prod) |
| SRE Team | Contributor | AKS Cluster |

### Kubernetes RBAC
- ServiceAccount `cloudcommerce-sa` — read ConfigMaps, Secrets
- ClusterRole `cloudcommerce-metrics-reader` — Prometheus scraping

---

## 4. Application Security

### Authentication
- **JWT Bearer Tokens** issued by User Service
- Token lifetime: 24 hours (access), 7 days (refresh)
- Validated at API Gateway layer before proxying

### Security Headers (Helmet.js)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0 (CSP preferred)
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/auth/login | 5 req | 15 min |
| /api/auth/register | 3 req | 15 min |
| /api/* (general) | 100 req | 1 min |
| /api/ai/consult | 10 req | 1 min |

### Input Validation
- All request bodies validated via Express middleware
- SQL injection prevention via parameterized queries (TypeORM)
- XSS prevention via output encoding

---

## 5. Secrets Management

### Azure Key Vault Integration
- **CSI Driver**: Secrets Store CSI Driver mounts Key Vault secrets as volumes
- **Sync**: Secrets synced to Kubernetes secrets for env var injection
- **Rotation**: Key Vault supports automatic rotation (30-day policy)

### Secret Inventory
| Secret Name | Purpose | Rotation |
|------------|---------|----------|
| jwt-signing-key | JWT token signing | 90 days |
| sql-connection-* | Database connections | On credential rotate |
| gemini-api-key | AI service | On regeneration |

### What's NOT in Source Control
- ❌ Connection strings
- ❌ API keys
- ❌ JWT secrets
- ❌ Certificates / private keys
- ❌ Azure credentials

---

## 6. Supply Chain Security

### Container Image Security
- **Base Images**: Official Node.js Alpine (minimal attack surface)
- **Multi-stage Builds**: Build dependencies excluded from runtime image
- **Non-root User**: All containers run as non-root (UID 1001)
- **Trivy Scan**: Every image scanned for CVEs in CI pipeline
- **OWASP Dependency Check**: npm packages audited on every PR

### Image Signing (Planned)
- Cosign/Sigstore for image provenance attestation
- Admission controller to reject unsigned images

---

## 7. Compliance & Audit

### Logging
- All authentication events logged (login, register, token refresh)
- All admin actions logged with user identity
- Logs retained: 90 days (prod), 30 days (dev/staging)

### Audit Trail
- Kubernetes audit logs enabled on AKS
- Azure Activity Log for infrastructure changes
- Git history for IaC and application code changes

### Data Protection
- Encryption at rest: Azure SQL TDE enabled
- Encryption in transit: TLS 1.2+ enforced everywhere
- PII minimization: Only essential user data stored
