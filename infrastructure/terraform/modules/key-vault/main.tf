# =============================================================================
# CloudCommerce - Key Vault Module
# =============================================================================
# Provisions Azure Key Vault for centralized secrets management with
# RBAC authorization, soft delete, purge protection, and network rules.
# =============================================================================

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                          = "kv-${var.project_name}-${var.environment}"
  location                      = var.location
  resource_group_name           = var.resource_group_name
  tenant_id                     = data.azurerm_client_config.current.tenant_id
  sku_name                      = "standard"
  enabled_for_disk_encryption   = true
  soft_delete_retention_days    = 90
  purge_protection_enabled      = var.environment == "prod" ? true : false
  enable_rbac_authorization     = true # Use RBAC instead of access policies
  enabled_for_template_deployment = true

  network_acls {
    default_action             = "Deny"
    bypass                     = "AzureServices"
    virtual_network_subnet_ids = var.allowed_subnet_ids
  }

  tags = merge(var.tags, {
    Component = "Security"
  })
}

# -----------------------------------------------------------------------------
# RBAC: Grant AKS identity access to read secrets
# -----------------------------------------------------------------------------
resource "azurerm_role_assignment" "aks_secrets_reader" {
  count                = var.aks_identity_principal_id != "" ? 1 : 0
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = var.aks_identity_principal_id
}

# -----------------------------------------------------------------------------
# RBAC: Grant current user/SP full access for bootstrapping
# -----------------------------------------------------------------------------
resource "azurerm_role_assignment" "admin_secrets" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# -----------------------------------------------------------------------------
# Initial Secrets (JWT signing key, SQL connection strings)
# -----------------------------------------------------------------------------
resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-signing-key"
  value        = var.jwt_signing_key
  key_vault_id = azurerm_key_vault.main.id
  content_type = "text/plain"

  expiration_date = timeadd(timestamp(), "8760h") # 1 year rotation

  tags = {
    Purpose = "JWT Token Signing"
    Service = "user-service"
  }

  depends_on = [azurerm_role_assignment.admin_secrets]
}

resource "azurerm_key_vault_secret" "sql_connection_string" {
  for_each = var.sql_connection_strings

  name         = "sql-${each.key}-connection-string"
  value        = each.value
  key_vault_id = azurerm_key_vault.main.id
  content_type = "text/plain"

  tags = {
    Purpose = "Database Connection"
    Service = each.key
  }

  depends_on = [azurerm_role_assignment.admin_secrets]
}
