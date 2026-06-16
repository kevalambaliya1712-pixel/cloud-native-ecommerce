# CloudCommerce — Disaster Recovery Plan

## 1. Overview

This document defines the disaster recovery (DR) strategy for the CloudCommerce platform, ensuring business continuity in the event of regional outages, data corruption, or infrastructure failures.

---

## 2. RPO / RTO Targets

| Component | RPO | RTO | Strategy |
|-----------|-----|-----|----------|
| Azure SQL Database | 5 minutes | 1 hour | Active geo-replication |
| Application State | 0 (stateless) | 15 minutes | Multi-region AKS |
| Terraform State | 0 | 5 minutes | GRS Storage Account |
| Container Images | 0 | 10 minutes | ACR geo-replication |
| Secrets (Key Vault) | 0 | 5 minutes | Soft-delete + purge protection |

---

## 3. Multi-Region Architecture

```
Primary Region: East US 2                Secondary Region: West US 2
┌─────────────────────────┐              ┌─────────────────────────┐
│  AKS Cluster (Active)   │              │  AKS Cluster (Standby)  │
│  App Gateway + WAF      │              │  App Gateway + WAF      │
│  Azure SQL (Primary)    │──Geo-Rep──▶ │  Azure SQL (Secondary)  │
│  Key Vault              │              │  Key Vault              │
│  ACR (Primary)          │──Geo-Rep──▶ │  ACR (Replica)          │
└─────────────────────────┘              └─────────────────────────┘
           │                                          │
           └──────────── Azure Traffic Manager ───────┘
                    (Priority-based routing)
```

---

## 4. Failover Procedures

### 4.1 Automated Failover (Azure Traffic Manager)
Azure Traffic Manager monitors primary endpoint health. If unhealthy for 3 consecutive checks (30 seconds each), traffic automatically routes to the secondary region.

### 4.2 Manual Failover Procedure
```bash
# Step 1: Confirm primary region failure
az aks show -g cloudcommerce-rg-prod -n cloudcommerce-aks-prod --query provisioningState

# Step 2: Failover Azure SQL
az sql db failover \
  --resource-group cloudcommerce-rg-dr \
  --server cloudcommerce-sql-dr \
  --name users-db
# Repeat for products-db, carts-db, orders-db

# Step 3: Get DR cluster credentials
az aks get-credentials \
  --resource-group cloudcommerce-rg-dr \
  --name cloudcommerce-aks-dr \
  --overwrite-existing

# Step 4: Deploy latest application
kubectl apply -k kubernetes/overlays/production/

# Step 5: Verify deployment
kubectl get pods -n cloudcommerce-prod
kubectl get ingress -n cloudcommerce-prod

# Step 6: Update Traffic Manager (if not automatic)
az network traffic-manager endpoint update \
  --resource-group cloudcommerce-rg \
  --profile-name cloudcommerce-tm \
  --name primary --type azureEndpoints \
  --endpoint-status Disabled

az network traffic-manager endpoint update \
  --resource-group cloudcommerce-rg \
  --profile-name cloudcommerce-tm \
  --name secondary --type azureEndpoints \
  --endpoint-status Enabled --priority 1
```

### 4.3 Failback Procedure
```bash
# After primary region recovers:
# 1. Reverse SQL geo-replication
# 2. Redeploy to primary AKS
# 3. Update Traffic Manager priorities
# 4. Monitor for 1 hour before disabling DR
```

---

## 5. Backup Strategy

| Data | Backup Type | Frequency | Retention |
|------|------------|-----------|-----------|
| Azure SQL | Automated (PITR) | Continuous | 35 days |
| Azure SQL | Long-term (LTR) | Weekly | 1 year |
| Terraform State | GRS Storage | On every apply | Versioned |
| ACR Images | Geo-replicated | On every push | Per lifecycle policy |
| Key Vault Secrets | Soft-delete | N/A | 90 days recoverability |
| Kubernetes Configs | Git repository | On every commit | Unlimited |

---

## 6. DR Testing Schedule

| Test Type | Frequency | Duration | Scope |
|-----------|-----------|----------|-------|
| Tabletop Exercise | Quarterly | 2 hours | All teams |
| SQL Failover Test | Monthly | 1 hour | DBA + SRE |
| Full DR Drill | Semi-annually | 4 hours | All teams |
| Chaos Engineering | Weekly (automated) | Continuous | Kubernetes pods |

---

## 7. Communication Plan

### Escalation Matrix
| Severity | First Responder | Escalation (15 min) | Escalation (30 min) |
|----------|----------------|--------------------|--------------------|
| SEV-1 | On-call SRE | Engineering Lead | VP Engineering |
| SEV-2 | On-call SRE | Engineering Lead | — |

### Stakeholder Notifications
- **Internal**: Slack #incident-response, email to engineering-all
- **External**: Status page update (statuspage.io)
- **Executive**: SEV-1 only, immediate Slack + email
