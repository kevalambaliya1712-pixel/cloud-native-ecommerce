# CloudCommerce — Cost Optimization Strategy

## Executive Summary
This document outlines the cost optimization strategies implemented across the CloudCommerce platform to minimize Azure spend while maintaining production-grade reliability and performance.

---

## 1. Compute Optimization

### AKS Node Pool Strategy
| Node Pool | VM SKU | Min Nodes | Max Nodes | Purpose |
|-----------|--------|-----------|-----------|---------|
| system | Standard_D2s_v5 | 1 | 3 | System pods (CoreDNS, kube-proxy) |
| workload | Standard_D4s_v5 | 2 | 10 | Application workloads |
| spot | Standard_D4s_v5 (Spot) | 0 | 5 | Batch jobs, non-critical workloads |

### Autoscaling
- **HPA** (Horizontal Pod Autoscaler): CPU 70%, Memory 80% thresholds
- **Cluster Autoscaler**: Scales nodes based on pending pod scheduling
- **Scale-to-Zero**: Dev/staging environments scale down during non-business hours

### Reserved Instances
- **Recommendation**: Purchase 1-year reserved instances for baseline node pools
- **Estimated Savings**: ~35% vs. pay-as-you-go for consistent workloads

---

## 2. Database Optimization

### Azure SQL Elastic Pools
- Pool all microservice databases into a shared elastic pool
- **DTU Model**: 200 eDTUs shared across 5 databases
- Individual databases burst as needed without dedicated provisioning

### Tiered Storage
| Environment | Tier | Estimated Cost |
|-------------|------|---------------|
| Dev | Basic (5 DTU) | ~$5/mo per DB |
| Staging | Standard S1 (20 DTU) | ~$15/mo per DB |
| Production | Elastic Pool (200 eDTU) | ~$450/mo total |

---

## 3. Container Registry

### ACR Lifecycle Policies
```json
{
  "rules": [
    {
      "name": "purge-untagged",
      "type": "Lifecycle",
      "definition": {
        "filters": { "tagStatus": "untagged" },
        "actions": { "purge": { "daysAfterCreation": 7 } }
      }
    },
    {
      "name": "purge-old-dev",
      "type": "Lifecycle",
      "definition": {
        "filters": { "tagStatus": "tagged", "tagPattern": "dev-*" },
        "actions": { "purge": { "daysAfterCreation": 30 } }
      }
    }
  ]
}
```

---

## 4. Network Cost Reduction

### Private Endpoints
- Use Azure Private Link for SQL, Key Vault, Storage to avoid egress charges
- VNet integration for ACR pull (no public endpoint traffic)

### Application Gateway WAF v2
- Single instance with autoscaling (min: 1, max: 10)
- ~60% cheaper than running dedicated WAF + LB separately

---

## 5. Environment Cost Controls

### Dev Environment
- Single replica per service (no HPA)
- Spot VM node pool
- Auto-shutdown: 7 PM - 7 AM EST weekdays, all weekend
- **Monthly estimate: ~$150**

### Staging Environment
- 2 replicas baseline, HPA max 4
- Regular VM pricing (needed for realistic testing)
- **Monthly estimate: ~$400**

### Production Environment
- 3+ replicas with HPA up to 10
- Reserved instance pricing
- Zone-redundant deployments
- **Monthly estimate: ~$1,200-2,000**

---

## 6. Monitoring Cost Controls

### Log Analytics
- Retain production logs for 90 days (regulatory)
- Retain dev/staging logs for 30 days
- Use Basic tier for non-critical log types
- **Sampling**: Enable Application Insights adaptive sampling at 50% for dev

### Alert Budget
- Set Azure Cost Management budgets per environment
- Alert at 80%, 100%, 120% of monthly budget
- Auto-scale-down action at 120%

---

## 7. Monthly Cost Summary

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| AKS Compute | $50 | $200 | $600-1,000 |
| Azure SQL | $25 | $75 | $450 |
| ACR | $5 | $5 | $5 |
| App Gateway | $30 | $60 | $200 |
| Key Vault | $1 | $1 | $5 |
| Log Analytics | $10 | $20 | $100 |
| Storage | $5 | $10 | $30 |
| **Total** | **~$130** | **~$370** | **~$1,400-1,800** |

---

## 8. Recommendations & Next Steps

1. **Azure Advisor**: Review weekly for right-sizing recommendations
2. **Commitment Discounts**: Evaluate Azure Savings Plans for 1-year commitment
3. **Azure Hybrid Benefit**: Apply Windows Server / SQL Server licenses if available
4. **Orphan Resource Cleanup**: Monthly audit for unattached disks, unused IPs
5. **Cost Anomaly Detection**: Enable Azure Cost Management anomaly alerts
