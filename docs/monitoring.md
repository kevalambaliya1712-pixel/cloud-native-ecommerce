# CloudCommerce — Monitoring & Observability Guide

## Overview

CloudCommerce uses a three-pillar observability stack:
- **Metrics**: Prometheus + Grafana
- **Logs**: Fluent Bit + Azure Log Analytics
- **Traces**: Azure Application Insights (future integration)

---

## 1. Metrics (Prometheus)

### Service Metrics Exposed
Each microservice exposes `/metrics` endpoint with the following:

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `http_requests_total` | Counter | method, path, status, service | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | method, path, service | Request latency distribution |
| `http_request_size_bytes` | Histogram | method, service | Request payload size |
| `http_response_size_bytes` | Histogram | method, service | Response payload size |
| `nodejs_heap_size_total_bytes` | Gauge | service | Node.js heap total |
| `nodejs_active_handles_total` | Gauge | service | Active handles (connections) |

### Dashboard Panels (Grafana)

#### Platform Overview Dashboard
1. **Request Rate by Service** — Real-time RPS per microservice
2. **Error Rate by Service** — 5xx percentage with color thresholds
3. **P99 Latency** — 99th percentile response time
4. **Pod CPU Usage** — Per-container CPU utilization
5. **Pod Memory Usage** — Gauge showing memory vs. limits
6. **Active Pods** — Stat panel showing running pod count

---

## 2. Logging (Fluent Bit → Azure Log Analytics)

### Log Format
All services emit structured JSON logs:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "service": "order-service",
  "traceId": "abc123def456",
  "message": "Order created successfully",
  "metadata": {
    "orderId": "ORD-001",
    "userId": "USR-123",
    "totalAmount": 299.99
  }
}
```

### KQL Queries (Azure Log Analytics)

```kql
// Error logs in last hour
CloudCommerce_CL
| where TimeGenerated > ago(1h)
| where level_s == "error"
| project TimeGenerated, service_s, message_s
| order by TimeGenerated desc

// Request latency distribution
CloudCommerce_CL
| where service_s == "api-gateway"
| summarize percentiles(duration_d, 50, 90, 99) by bin(TimeGenerated, 5m)
| render timechart

// Top errors by service
CloudCommerce_CL
| where level_s == "error"
| summarize count() by service_s, message_s
| top 10 by count_
```

---

## 3. Alerting

### Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| HighErrorRate | 5xx > 5% for 5min | Critical | Page on-call, auto-scale |
| HighLatency | P99 > 2s for 5min | Warning | Notify Slack |
| PodNotReady | Pod unready for 3min | Critical | Page on-call |
| HighMemoryUsage | Memory > 85% limit | Warning | Notify Slack |
| HPAMaxedOut | At max replicas 10min | Warning | Review capacity |

### Alert Routing
- **Critical**: PagerDuty → On-call engineer
- **Warning**: Slack #cloudcommerce-alerts
- **Info**: Email digest (daily)

---

## 4. Health Checks

### Endpoint Specification
Every service exposes `GET /health`:
```json
{
  "status": "healthy",
  "service": "order-service",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": "connected",
    "memory": "ok"
  }
}
```

### Kubernetes Integration
- **Liveness Probe**: Restarts pod if `/health` fails 3 times
- **Readiness Probe**: Removes from service if `/health` fails 2 times

---

## 5. SLI / SLO / SLA

| Service | SLI | SLO Target | Error Budget (30d) |
|---------|-----|-----------|-------------------|
| API Gateway | Availability | 99.95% | 21.6 min downtime |
| User Service | Login Success Rate | 99.9% | 43.2 min |
| Product Service | Query Latency P99 | < 200ms | N/A |
| Cart Service | Availability | 99.9% | 43.2 min |
| Order Service | Transaction Success | 99.99% | 4.3 min |
| Overall Platform | Availability | 99.9% | 43.2 min |
