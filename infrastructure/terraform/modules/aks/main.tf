# =============================================================================
# CloudCommerce - AKS Module
# =============================================================================
# Provisions Azure Kubernetes Service with system + user node pools,
# managed identity, Azure CNI networking, and cluster autoscaler.
# =============================================================================

# -----------------------------------------------------------------------------
# User-Assigned Managed Identity for AKS
# -----------------------------------------------------------------------------
resource "azurerm_user_assigned_identity" "aks" {
  name                = "id-aks-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = merge(var.tags, { Component = "AKS" })
}

# -----------------------------------------------------------------------------
# AKS Cluster
# -----------------------------------------------------------------------------
resource "azurerm_kubernetes_cluster" "main" {
  name                = "aks-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = "${var.project_name}-${var.environment}"
  kubernetes_version  = var.kubernetes_version
  sku_tier            = var.environment == "prod" ? "Standard" : "Free"

  # System node pool - runs kube-system components
  default_node_pool {
    name                = "system"
    vm_size             = var.system_node_vm_size
    node_count          = var.system_node_count
    min_count           = var.system_node_min_count
    max_count           = var.system_node_max_count
    enable_auto_scaling = true
    os_disk_size_gb     = 50
    os_disk_type        = "Managed"
    vnet_subnet_id      = var.aks_subnet_id
    max_pods            = 110
    type                = "VirtualMachineScaleSets"

    node_labels = {
      "nodepool-type" = "system"
      "environment"   = var.environment
    }

    tags = merge(var.tags, { NodePool = "system" })
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.aks.id]
  }

  # Azure CNI networking for VNet integration
  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure" # Enables K8s Network Policies
    load_balancer_sku = "standard"
    service_cidr      = "172.16.0.0/16"
    dns_service_ip    = "172.16.0.10"
  }

  # Azure Monitor integration
  oms_agent {
    log_analytics_workspace_id = var.log_analytics_workspace_id
  }

  # Azure Policy for Kubernetes
  azure_policy_enabled = true

  # Key Vault Secrets Provider (CSI driver)
  key_vault_secrets_provider {
    secret_rotation_enabled  = true
    secret_rotation_interval = "2m"
  }

  # Auto-upgrade channel
  automatic_channel_upgrade = var.environment == "prod" ? "stable" : "rapid"

  # Maintenance window for prod
  dynamic "maintenance_window" {
    for_each = var.environment == "prod" ? [1] : []
    content {
      allowed {
        day   = "Sunday"
        hours = [0, 1, 2, 3, 4]
      }
    }
  }

  tags = merge(var.tags, {
    Component   = "AKS"
    Environment = var.environment
  })

  lifecycle {
    ignore_changes = [
      default_node_pool[0].node_count, # Managed by autoscaler
    ]
  }
}

# -----------------------------------------------------------------------------
# User Node Pool - runs application workloads
# -----------------------------------------------------------------------------
resource "azurerm_kubernetes_cluster_node_pool" "user" {
  name                  = "user"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size               = var.user_node_vm_size
  node_count            = var.user_node_count
  min_count             = var.user_node_min_count
  max_count             = var.user_node_max_count
  enable_auto_scaling   = true
  os_disk_size_gb       = 100
  os_disk_type          = "Managed"
  vnet_subnet_id        = var.aks_subnet_id
  max_pods              = 110
  mode                  = "User"

  # Use Spot instances for dev/staging to save costs
  priority        = var.environment == "prod" ? "Regular" : "Spot"
  eviction_policy = var.environment == "prod" ? null : "Delete"
  spot_max_price  = var.environment == "prod" ? null : -1

  node_labels = {
    "nodepool-type" = "user"
    "environment"   = var.environment
    "workload"      = "application"
  }

  node_taints = var.environment == "prod" ? [] : [
    "kubernetes.azure.com/scalesetpriority=spot:NoSchedule"
  ]

  tags = merge(var.tags, { NodePool = "user" })

  lifecycle {
    ignore_changes = [node_count]
  }
}

# -----------------------------------------------------------------------------
# Role Assignment: AKS -> ACR Pull
# -----------------------------------------------------------------------------
resource "azurerm_role_assignment" "aks_acr_pull" {
  count                            = var.acr_id != "" ? 1 : 0
  scope                            = var.acr_id
  role_definition_name             = "AcrPull"
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  skip_service_principal_aad_check = true
}

# -----------------------------------------------------------------------------
# Role Assignment: AKS -> VNet Network Contributor
# -----------------------------------------------------------------------------
resource "azurerm_role_assignment" "aks_network" {
  scope                            = var.aks_subnet_id
  role_definition_name             = "Network Contributor"
  principal_id                     = azurerm_user_assigned_identity.aks.principal_id
  skip_service_principal_aad_check = true
}
