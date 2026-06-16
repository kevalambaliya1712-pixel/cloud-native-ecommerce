output "cluster_id" {
  value       = azurerm_kubernetes_cluster.main.id
  description = "AKS cluster resource ID"
}

output "cluster_name" {
  value       = azurerm_kubernetes_cluster.main.name
  description = "AKS cluster name"
}

output "cluster_fqdn" {
  value       = azurerm_kubernetes_cluster.main.fqdn
  description = "AKS cluster FQDN"
}

output "kube_config_raw" {
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  description = "Raw kubeconfig for cluster access"
  sensitive   = true
}

output "kubelet_identity_object_id" {
  value       = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  description = "Kubelet managed identity object ID"
}

output "node_resource_group" {
  value       = azurerm_kubernetes_cluster.main.node_resource_group
  description = "Auto-generated node resource group name"
}

output "aks_identity_principal_id" {
  value       = azurerm_user_assigned_identity.aks.principal_id
  description = "AKS managed identity principal ID"
}

output "oidc_issuer_url" {
  value       = azurerm_kubernetes_cluster.main.oidc_issuer_url
  description = "OIDC issuer URL for workload identity"
}
