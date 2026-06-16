# =============================================================================
# CloudCommerce - Production Environment
# =============================================================================
# Full production composition with HA, zone redundancy, reserved capacity,
# Premium ACR with geo-replication, and Application Gateway WAF.
# =============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.85"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  project_name = "cloudcommerce"
  environment  = "prod"
  location     = var.location

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "Terraform"
    CostCenter  = "Production"
    Compliance  = "SOC2"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.project_name}-${local.environment}"
  location = local.location
  tags     = local.common_tags
}

module "networking" {
  source              = "../../modules/networking"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  vnet_address_space  = "10.1.0.0/16"
  aks_subnet_prefix   = "10.1.1.0/24"
  appgw_subnet_prefix = "10.1.2.0/24"
  data_subnet_prefix  = "10.1.3.0/24"
  tags                = local.common_tags
}

module "monitoring" {
  source              = "../../modules/monitoring"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  daily_quota_gb      = -1 # Unlimited for prod
  alert_email_addresses = var.alert_email_addresses
  tags                = local.common_tags
}

module "acr" {
  source              = "../../modules/acr"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Premium"
  aks_subnet_id       = module.networking.aks_subnet_id
  geo_replication_locations = ["westus3", "westeurope"]
  tags                = local.common_tags
}

module "aks" {
  source              = "../../modules/aks"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  kubernetes_version  = "1.29"
  aks_subnet_id       = module.networking.aks_subnet_id
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id
  acr_id              = module.acr.acr_id

  # Production: HA sizing
  system_node_vm_size   = "Standard_D4s_v5"
  system_node_count     = 3
  system_node_min_count = 3
  system_node_max_count = 5
  user_node_vm_size     = "Standard_D4s_v5"
  user_node_count       = 3
  user_node_min_count   = 3
  user_node_max_count   = 10

  tags = local.common_tags
}

module "sql" {
  source              = "../../modules/sql-database"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  admin_password      = var.sql_admin_password
  aad_admin_object_id = var.aad_admin_object_id
  aks_subnet_id       = module.networking.aks_subnet_id
  database_names      = ["users-db", "products-db", "carts-db", "orders-db"]
  max_size_gb         = 128
  prod_sku_name       = "GP_Gen5_4"
  security_alert_emails  = var.alert_email_addresses
  audit_storage_endpoint = module.storage.primary_blob_endpoint
  audit_storage_access_key = module.storage.primary_access_key
  tags                = local.common_tags
}

module "key_vault" {
  source              = "../../modules/key-vault"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  allowed_subnet_ids  = [module.networking.aks_subnet_id]
  aks_identity_principal_id = module.aks.aks_identity_principal_id
  jwt_signing_key     = var.jwt_signing_key
  tags                = local.common_tags
}

module "app_gateway" {
  source              = "../../modules/app-gateway"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  appgw_subnet_id     = module.networking.appgw_subnet_id
  tags                = local.common_tags
}

module "storage" {
  source              = "../../modules/storage"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}
