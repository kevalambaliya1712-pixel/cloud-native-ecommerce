# =============================================================================
# CloudCommerce - Terraform Remote State Backend Bootstrap
# =============================================================================
# This must be applied FIRST to create the Azure Storage Account that holds
# Terraform remote state for all environments.
#
# Usage:
#   cd infrastructure/terraform/backend-init
#   terraform init
#   terraform apply -var="location=eastus"
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

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
variable "location" {
  description = "Azure region for the state backend resources"
  type        = string
  default     = "eastus"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "cloudcommerce"
}

# -----------------------------------------------------------------------------
# Resource Group for Terraform State
# -----------------------------------------------------------------------------
resource "azurerm_resource_group" "tfstate" {
  name     = "rg-${var.project_name}-tfstate"
  location = var.location

  tags = {
    Project     = var.project_name
    Purpose     = "Terraform Remote State"
    ManagedBy   = "Terraform"
    Environment = "shared"
  }
}

# -----------------------------------------------------------------------------
# Storage Account for Terraform State
# NOTE: Storage account names must be globally unique, 3-24 chars, lowercase
# -----------------------------------------------------------------------------
resource "azurerm_storage_account" "tfstate" {
  name                            = "${replace(var.project_name, "-", "")}tfstate"
  resource_group_name             = azurerm_resource_group.tfstate.name
  location                        = azurerm_resource_group.tfstate.location
  account_tier                    = "Standard"
  account_replication_type        = "GRS" # Geo-redundant for state safety
  min_tls_version                 = "TLS1_2"
  enable_https_traffic_only       = true
  allow_nested_items_to_be_public = false

  blob_properties {
    versioning_enabled = true # Enables state file version history

    delete_retention_policy {
      days = 30
    }

    container_delete_retention_policy {
      days = 30
    }
  }

  tags = {
    Project     = var.project_name
    Purpose     = "Terraform Remote State"
    ManagedBy   = "Terraform"
    Environment = "shared"
  }
}

# -----------------------------------------------------------------------------
# Storage Containers - One per Environment
# -----------------------------------------------------------------------------
resource "azurerm_storage_container" "tfstate_dev" {
  name                  = "tfstate-dev"
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "tfstate_staging" {
  name                  = "tfstate-staging"
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "tfstate_prod" {
  name                  = "tfstate-prod"
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "resource_group_name" {
  value       = azurerm_resource_group.tfstate.name
  description = "Resource group containing state backend"
}

output "storage_account_name" {
  value       = azurerm_storage_account.tfstate.name
  description = "Storage account name for backend config"
}

output "storage_account_id" {
  value       = azurerm_storage_account.tfstate.id
  description = "Storage account resource ID"
}

output "container_names" {
  value = {
    dev     = azurerm_storage_container.tfstate_dev.name
    staging = azurerm_storage_container.tfstate_staging.name
    prod    = azurerm_storage_container.tfstate_prod.name
  }
  description = "Container names per environment"
}
