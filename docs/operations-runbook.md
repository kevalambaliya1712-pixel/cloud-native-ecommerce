# CloudCommerce — Operations Runbook

## Table of Contents
1. [Incident Response](#1-incident-response)
2. [Common Operational Procedures](#2-common-operational-procedures)
3. [Scaling Operations](#3-scaling-operations)
4. [Database Operations](#4-database-operations)
5. [Monitoring & Alerting](#5-monitoring--alerting)
6. [Disaster Recovery](#6-disaster-recovery)

---

## 1. Incident Response

### Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| SEV-1 | Platform down, revenue impact | 15 min | All services unreachable |
| SEV-2 | Major feature degraded | 30 min | Order processing failing |
| SEV-3 | Minor feature impacted | 2 hours | Notification delays |
| SEV-4 | Cosmetic / low-impact | Next business day | Dashboard widget broken |

### SEV-1 Response Procedure
```bash
# 1. Check cluster health
kubectl get nodes
kubectl get pods -n cloudcommerce-prod --field-selector status.phase!=Running

# 2. Check recent deployments (potential root cause)
kubectl rollout history deployment -n cloudcommerce-prod

# 3. Rollback last deployment if suspected
kubectl rollout undo deployment/<service-name> -n cloudcommerce-prod

# 4. Check Application Gateway health probes
az network application-gateway show-backend-health \
  --resource-group cloudcommerce-rg-prod \
  --name cloudcommerce-agw-prod

# 5. Scale up if load-related
kubectl scale deployment api-gateway --replicas=10 -n cloudcommerce-prod
```

---

## 2. Common Operational Procedures

### 2.1 View Logs
```bash
# Real-time logs for a service
kubectl logs -f deployment/api-gateway -n cloudcommerce-prod --tail=100

# Logs from all pods of a service
kubectl logs -l app=order-service -n cloudcommerce-prod --all-containers

# Search in Azure Log Analytics (KQL)
# CloudCommerce_CL | where service_s == "order-service" | where level_s == "error" | top 50 by TimeGenerated
```

### 2.2 Pod Management
```bash
# Restart a deployment (rolling restart)
kubectl rollout restart deployment/user-service -n cloudcommerce-prod

# Force delete a stuck pod
kubectl delete pod <pod-name> -n cloudcommerce-prod --grace-period=0 --force

# Exec into a pod for debugging
kubectl exec -it deployment/api-gateway -n cloudcommerce-prod -- sh
```

### 2.3 Certificate Renewal
```bash
# Check certificate expiry
kubectl get secret cloudcommerce-tls -n cloudcommerce-prod -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -enddate -noout

# Renew (if using cert-manager)
kubectl delete certificate cloudcommerce-tls -n cloudcommerce-prod
# cert-manager will auto-recreate
```

---

## 3. Scaling Operations

### Manual Scaling
```bash
# Scale a specific service
kubectl scale deployment/product-service --replicas=5 -n cloudcommerce-prod

# Scale all services for Black Friday
for svc in api-gateway user-service product-service cart-service order-service; do
  kubectl patch hpa ${svc}-hpa -n cloudcommerce-prod \
    --type merge -p '{"spec":{"minReplicas":5,"maxReplicas":20}}'
done
```

### Cluster Node Scaling
```bash
# Scale node pool
az aks nodepool scale \
  --resource-group cloudcommerce-rg-prod \
  --cluster-name cloudcommerce-aks-prod \
  --name workload \
  --node-count 10
```

---

## 4. Database Operations

### 4.1 Connection Verification
```bash
# Test SQL connectivity from a pod
kubectl exec -it deployment/user-service -n cloudcommerce-prod -- \
  node -e "const sql=require('mssql'); sql.connect(process.env.DATABASE_URL).then(()=>console.log('OK')).catch(console.error)"
```

### 4.2 Elastic Pool Monitoring
```bash
az sql elastic-pool show \
  --resource-group cloudcommerce-rg-prod \
  --server cloudcommerce-sql-prod \
  --name cloudcommerce-pool \
  --query '{utilization: dtu_consumption_percent, storage: storage_mb}'
```

### 4.3 Backup & Restore
```bash
# Azure SQL automated backups (7-35 day retention)
# Point-in-time restore:
az sql db restore \
  --resource-group cloudcommerce-rg-prod \
  --server cloudcommerce-sql-prod \
  --name users-db \
  --dest-name users-db-restored \
  --time "2024-01-15T10:00:00Z"
```

---

## 5. Monitoring & Alerting

### Grafana Access
- **URL**: https://grafana.cloudcommerce.example.com
- **Dashboard**: CloudCommerce — Platform Overview
- Key panels: Request Rate, Error Rate, P99 Latency, Pod CPU/Memory

### Prometheus Queries (useful)
```promql
# Request rate by service (last 5m)
sum(rate(http_requests_total[5m])) by (service)

# Error rate percentage
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service) * 100

# P99 latency
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))

# Memory usage vs limit
container_memory_working_set_bytes{namespace="cloudcommerce"} / container_spec_memory_limit_bytes{namespace="cloudcommerce"}
```

### Alert Silence (during maintenance)
```bash
# Create silence in Alertmanager
amtool silence add --alertmanager.url=http://alertmanager:9093 \
  --comment="Planned maintenance" \
  --duration=2h \
  alertname=~".*"
```

---

## 6. Disaster Recovery

### RPO/RTO Targets
| Tier | RPO | RTO | Strategy |
|------|-----|-----|----------|
| Database | 5 min | 1 hour | Geo-replicated Azure SQL |
| Application | 0 (stateless) | 15 min | Multi-region AKS |
| Configuration | 0 | 5 min | Git-stored, Kustomize |

### Recovery Procedure
```bash
# 1. Verify primary region is unavailable
az aks show -g cloudcommerce-rg-prod -n cloudcommerce-aks-prod --query provisioningState

# 2. Failover SQL to secondary region
az sql db failover -g cloudcommerce-rg-dr -s cloudcommerce-sql-dr -n users-db

# 3. Deploy to DR cluster
az aks get-credentials -g cloudcommerce-rg-dr -n cloudcommerce-aks-dr
kubectl apply -k kubernetes/overlays/production/

# 4. Update DNS (Azure Traffic Manager handles automatically if configured)
az network traffic-manager endpoint update \
  --resource-group cloudcommerce-rg \
  --profile-name cloudcommerce-tm \
  --name primary --type azureEndpoints \
  --endpoint-status Disabled
```
