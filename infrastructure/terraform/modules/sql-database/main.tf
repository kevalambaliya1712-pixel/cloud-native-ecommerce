# =============================================================================
# CloudCommerce - Azure SQL Database Module
# =============================================================================
# Provisions Azure SQL Server with database-per-service pattern.
# Includes firewall rules, audit logging, TDE, and threat detection.
# =============================================================================

# -----------------------------------------------------------------------------
# Azure SQL Server
# -----------------------------------------------------------------------------
resource "azurerm_mssql_server" "main" {
  name                         = "sql-${var.project_name}-${var.environment}"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.admin_username
  administrator_login_password = var.admin_password
  minimum_tls_version          = "1.2"

  # Azure AD authentication
  azuread_administrator {
    login_username = var.aad_admin_login
    object_id      = var.aad_admin_object_id
  }

  tags = merge(var.tags, {
    Component = "Database"
  })
}

# -----------------------------------------------------------------------------
# SQL Server Firewall Rules
# -----------------------------------------------------------------------------

# Allow Azure services (needed for AKS -> SQL connectivity)
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# -----------------------------------------------------------------------------
# SQL VNet Rule (private access from AKS subnet)
# -----------------------------------------------------------------------------
resource "azurerm_mssql_virtual_network_rule" "aks" {
  name      = "aks-vnet-rule"
  server_id = azurerm_mssql_server.main.id
  subnet_id = var.aks_subnet_id
}

# -----------------------------------------------------------------------------
# Databases (database-per-service pattern)
# -----------------------------------------------------------------------------
resource "azurerm_mssql_database" "databases" {
  for_each = toset(var.database_names)

  name      = each.value
  server_id = azurerm_mssql_server.main.id
  collation = "SQL_Latin1_General_CP1_CI_AS"

  # SKU configuration - serverless for dev/staging, provisioned for prod
  sku_name = var.environment == "prod" ? var.prod_sku_name : "GP_S_Gen5_1"

  # Serverless auto-pause for dev/staging (saves costs)
  auto_pause_delay_in_minutes = var.environment == "prod" ? -1 : 60
  min_capacity                = var.environment == "prod" ? null : 0.5

  max_size_gb = var.max_size_gb

  # Zone redundancy for production
  zone_redundant = var.environment == "prod" ? true : false

  # Short-term backup retention
  short_term_retention_policy {
    retention_days           = var.environment == "prod" ? 35 : 7
    backup_interval_in_hours = var.environment == "prod" ? 12 : 24
  }

  # Long-term backup retention for prod
  dynamic "long_term_retention_policy" {
    for_each = var.environment == "prod" ? [1] : []
    content {
      weekly_retention  = "P4W"
      monthly_retention = "P12M"
      yearly_retention  = "P5Y"
      week_of_year      = 1
    }
  }

  # Threat detection
  threat_detection_policy {
    state                      = "Enabled"
    email_addresses            = var.security_alert_emails
    retention_days             = 30
    disabled_alerts            = []
    email_account_admins       = "Enabled"
  }

  tags = merge(var.tags, {
    Component = "Database"
    Service   = each.value
  })
}

# -----------------------------------------------------------------------------
# SQL Server Audit Policy
# -----------------------------------------------------------------------------
resource "azurerm_mssql_server_extended_auditing_policy" "main" {
  server_id                               = azurerm_mssql_server.main.id
  storage_endpoint                        = var.audit_storage_endpoint
  storage_account_access_key              = var.audit_storage_access_key
  storage_account_access_key_is_secondary = false
  retention_in_days                       = var.environment == "prod" ? 90 : 30
  log_monitoring_enabled                  = true
}
