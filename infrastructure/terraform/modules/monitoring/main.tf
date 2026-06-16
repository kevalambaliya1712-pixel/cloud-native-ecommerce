# =============================================================================
# CloudCommerce - Monitoring Module
# =============================================================================
# Provisions Log Analytics Workspace and Application Insights for
# centralized logging, APM, and distributed tracing.
# =============================================================================

# -----------------------------------------------------------------------------
# Log Analytics Workspace
# -----------------------------------------------------------------------------
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "prod" ? 90 : 30

  # Daily cap for cost control in dev/staging
  daily_quota_gb = var.environment == "prod" ? -1 : var.daily_quota_gb

  tags = merge(var.tags, {
    Component = "Monitoring"
  })
}

# -----------------------------------------------------------------------------
# Application Insights
# -----------------------------------------------------------------------------
resource "azurerm_application_insights" "main" {
  name                = "appi-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "Node.JS"
  retention_in_days   = var.environment == "prod" ? 90 : 30
  sampling_percentage = var.environment == "prod" ? 100 : 50

  tags = merge(var.tags, {
    Component = "Monitoring"
  })
}

# -----------------------------------------------------------------------------
# Azure Monitor Action Group (for alerts)
# -----------------------------------------------------------------------------
resource "azurerm_monitor_action_group" "critical" {
  name                = "ag-critical-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  short_name          = "critical"

  dynamic "email_receiver" {
    for_each = var.alert_email_addresses
    content {
      name          = "email-${email_receiver.key}"
      email_address = email_receiver.value
    }
  }

  tags = merge(var.tags, {
    Component = "Monitoring"
  })
}

# -----------------------------------------------------------------------------
# Metric Alerts
# -----------------------------------------------------------------------------

# High Error Rate Alert
resource "azurerm_monitor_metric_alert" "high_error_rate" {
  name                = "alert-high-error-rate-${var.environment}"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when server error rate exceeds 5%"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/failed"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 50
  }

  action {
    action_group_id = azurerm_monitor_action_group.critical.id
  }

  tags = var.tags
}

# High Response Time Alert
resource "azurerm_monitor_metric_alert" "high_latency" {
  name                = "alert-high-latency-${var.environment}"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when average response time exceeds 2 seconds"
  severity            = 2
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/duration"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 2000
  }

  action {
    action_group_id = azurerm_monitor_action_group.critical.id
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Log Analytics Solutions (Container Insights)
# -----------------------------------------------------------------------------
resource "azurerm_log_analytics_solution" "containers" {
  solution_name         = "ContainerInsights"
  location              = var.location
  resource_group_name   = var.resource_group_name
  workspace_resource_id = azurerm_log_analytics_workspace.main.id
  workspace_name        = azurerm_log_analytics_workspace.main.name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/ContainerInsights"
  }

  tags = var.tags
}
