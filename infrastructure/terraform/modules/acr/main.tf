# =============================================================================
# CloudCommerce - ACR Module
# =============================================================================
# Provisions Azure Container Registry with geo-replication for production,
# admin access disabled, and content trust enabled for premium tier.
# =============================================================================

resource "azurerm_container_registry" "main" {
  name                = "${replace(var.project_name, "-", "")}${var.environment}acr"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  admin_enabled       = false # Security: use managed identity instead

  # Enable content trust for production (Premium only)
  dynamic "trust_policy" {
    for_each = var.sku == "Premium" ? [1] : []
    content {
      enabled = true
    }
  }

  # Retention policy for untagged manifests (Premium only)
  dynamic "retention_policy" {
    for_each = var.sku == "Premium" ? [1] : []
    content {
      days    = 30
      enabled = true
    }
  }

  # Geo-replication for prod (Premium only)
  dynamic "georeplications" {
    for_each = var.sku == "Premium" ? var.geo_replication_locations : []
    content {
      location                = georeplications.value
      zone_redundancy_enabled = true
    }
  }

  # Network rules (Premium only)
  network_rule_set {
    default_action = var.sku == "Premium" ? "Deny" : "Allow"

    # Allow AKS VNet
    dynamic "virtual_network" {
      for_each = var.sku == "Premium" && var.aks_subnet_id != "" ? [1] : []
      content {
        action    = "Allow"
        subnet_id = var.aks_subnet_id
      }
    }
  }

  tags = merge(var.tags, {
    Component = "ContainerRegistry"
  })
}
