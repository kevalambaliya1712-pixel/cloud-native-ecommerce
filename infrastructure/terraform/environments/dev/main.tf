# =============================================================================
# CloudCommerce - Dev Environment
# =============================================================================
# Composes all Terraform modules for the development environment.
# Uses minimal sizing, spot instances, and serverless SQL.
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
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

# -----------------------------------------------------------------------------
# Local Variables
# -----------------------------------------------------------------------------
locals {
  project_name = "cloudcommerce"
  environment  = "dev"
  location     = var.location

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "Terraform"
    CostCenter  = "Engineering"
  }
}

# -----------------------------------------------------------------------------
# Resource Group
# -----------------------------------------------------------------------------
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.project_name}-${local.environment}"
  location = local.location
  tags     = local.common_tags
}

# -----------------------------------------------------------------------------
# Module: Networking
# -----------------------------------------------------------------------------
module "networking" {
  source = "../../modules/networking"

  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  vnet_address_space  = "10.0.0.0/16"
  aks_subnet_prefix   = "10.0.1.0/24"
  appgw_subnet_prefix = "10.0.2.0/24"
  data_subnet_prefix  = "10.0.3.0/24"
  tags                = local.common_tags
}

# -----------------------------------------------------------------------------
# Module: Monitoring (must be created before AKS)
# -----------------------------------------------------------------------------
module "monitoring" {
  source = "../../modules/monitoring"

  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  daily_quota_gb      = 1
  alert_email_addresses = var.alert_email_addresses
  tags                = local.common_tags
}

# -----------------------------------------------------------------------------
# Module: ACR
# -----------------------------------------------------------------------------
module "acr" {
  source = "../../modules/acr"

  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Basic"
  tags                = local.common_tags
}

# -----------------------------------------------------------------------------
# Module: AKS
# -----------------------------------------------------------------------------
module "aks" {
  source = "../../modules/aks"

  project_name               = local.project_name
  environment                = local.environment
  location                   = local.location
  resource_group_name        = azurerm_resource_group.main.name
  kubernetes_version         = "1.29"
  aks_subnet_id              = module.networking.aks_subnet_id
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id
  acr_id                     = module.acr.acr_id

  # Dev: minimal sizing
  system_node_vm_size   = "Standard_B2s"
  system_node_count     = 1
  system_node_min_count = 1
  system_node_max_count = 2
  user_node_vm_size     = "Standard_B2ms"
  user_node_count       = 1
  user_node_min_count   = 1
  user_node_max_count   = 3

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Module: SQL Database
# -----------------------------------------------------------------------------
module "sql" {
  source = "../../modules/sql-database"

  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  admin_password      = var.sql_admin_password
  aad_admin_object_id = var.aad_admin_object_id
  aks_subnet_id       = module.networking.aks_subnet_id
  database_names      = ["users-db", "products-db", "carts-db", "orders-db"]
  max_size_gb         = 4
  security_alert_emails  = var.alert_email_addresses
  audit_storage_endpoint = module.storage.primary_blob_endpoint
  audit_storage_access_key = module.storage.primary_access_key
  tags                = local.common_tags
}

# -----------------------------------------------------------------------------
# Module: Key Vault
# -----------------------------------------------------------------------------
module "key_vault" {
  source = "../../modules/key-vault"

  project_name              = local.project_name
  environment               = local.environment
  location                  = local.location
  resource_group_name       = azurerm_resource_group.main.name
  allowed_subnet_ids        = [module.networking.aks_subnet_id]
  aks_identity_principal_id = module.aks.key_vault_secrets_provider_object_id
  jwt_signing_key           = var.jwt_signing_key
  tags                      = local.common_tags
}

# -----------------------------------------------------------------------------
# Module: Storage
# -----------------------------------------------------------------------------
module "storage" {
  source = "../../modules/storage"

  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}
