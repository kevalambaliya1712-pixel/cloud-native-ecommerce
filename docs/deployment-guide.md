# CloudCommerce — Deployment Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Azure CLI | ≥ 2.55 | Azure resource management |
| Terraform | ≥ 1.7.0 | Infrastructure provisioning |
| kubectl | ≥ 1.28 | Kubernetes cluster management |
| kustomize | ≥ 5.0 | K8s manifest composition |
| Docker | ≥ 24.0 | Local container development |
| Node.js | ≥ 20 LTS | Service development |
| Helm | ≥ 3.14 | Optional chart management |

---

## 1. Azure Account Setup

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "<SUBSCRIPTION_ID>"

# Register required providers
az provider register --namespace Microsoft.ContainerService
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.Sql
az provider register --namespace Microsoft.KeyVault
az provider register --namespace Microsoft.Network
az provider register --namespace Microsoft.OperationalInsights
```

---

## 2. Infrastructure Provisioning (Terraform)

### 2.1 Bootstrap Remote State
```bash
cd infrastructure/backend
terraform init
terraform apply -auto-approve
```

### 2.2 Deploy Dev Environment
```bash
cd infrastructure/environments/dev
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 2.3 Retrieve AKS Credentials
```bash
az aks get-credentials \
  --resource-group cloudcommerce-rg-dev \
  --name cloudcommerce-aks-dev
```

---

## 3. Container Registry Setup

```bash
# Login to ACR
az acr login --name cloudcommercedevcr

# Build and push all service images
docker compose build
docker compose push

# Or build individually:
docker build -t cloudcommercedevcr.azurecr.io/api-gateway:latest services/api-gateway/
docker push cloudcommercedevcr.azurecr.io/api-gateway:latest
```

---

## 4. Kubernetes Deployment

### 4.1 Deploy using Kustomize
```bash
# Dev environment
kubectl apply -k kubernetes/overlays/dev/

# Staging environment
kubectl apply -k kubernetes/overlays/staging/

# Production environment
kubectl apply -k kubernetes/overlays/production/
```

### 4.2 Verify Deployment
```bash
# Check all pods
kubectl get pods -n cloudcommerce-dev

# Check services
kubectl get svc -n cloudcommerce-dev

# Check HPA status
kubectl get hpa -n cloudcommerce-dev

# Check ingress
kubectl get ingress -n cloudcommerce-dev
```

---

## 5. Secret Configuration

### 5.1 Azure Key Vault Secrets
```bash
KV_NAME="cloudcommerce-kv-dev"

az keyvault secret set --vault-name $KV_NAME --name jwt-signing-key --value "<JWT_SECRET>"
az keyvault secret set --vault-name $KV_NAME --name gemini-api-key --value "<GEMINI_KEY>"
az keyvault secret set --vault-name $KV_NAME --name sql-connection-users --value "<CONNECTION_STRING>"
az keyvault secret set --vault-name $KV_NAME --name sql-connection-products --value "<CONNECTION_STRING>"
az keyvault secret set --vault-name $KV_NAME --name sql-connection-carts --value "<CONNECTION_STRING>"
az keyvault secret set --vault-name $KV_NAME --name sql-connection-orders --value "<CONNECTION_STRING>"
```

---

## 6. Local Development

### 6.1 Docker Compose (Recommended)
```bash
# Start all services locally
docker compose up --build

# Access:
# Frontend: http://localhost:5173
# API Gateway: http://localhost:3000
```

### 6.2 Individual Service Development
```bash
# Terminal 1: API Gateway
cd services/api-gateway && npm install && npm run dev

# Terminal 2: User Service
cd services/user-service && npm install && npm run dev

# Terminal 3: Frontend
cd frontend && npm install && npm run dev
```

---

## 7. DNS & TLS Configuration

### 7.1 Azure DNS Zone
```bash
# Create DNS zone
az network dns zone create -g cloudcommerce-rg -n cloudcommerce.example.com

# Add A record pointing to App Gateway public IP
APP_GW_IP=$(az network public-ip show -g cloudcommerce-rg -n cloudcommerce-pip --query ipAddress -o tsv)
az network dns record-set a add-record -g cloudcommerce-rg -z cloudcommerce.example.com -n @ -a $APP_GW_IP
```

### 7.2 TLS Certificate
```bash
# Option A: Azure managed certificate (recommended)
# Configured via Terraform in the app-gateway module

# Option B: Let's Encrypt via cert-manager
helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace
```

---

## 8. Post-Deployment Verification

```bash
# Health check all services
for port in 3000 3001 3002 3003 3004 3005; do
  echo "Port $port: $(curl -s http://localhost:$port/health)"
done

# Run smoke tests
curl -s https://cloudcommerce.example.com/api/health
curl -s https://cloudcommerce.example.com/api/products
curl -s https://cloudcommerce.example.com/
```
