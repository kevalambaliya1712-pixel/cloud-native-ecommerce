output "acr_id" {
  value       = azurerm_container_registry.main.id
  description = "ACR resource ID"
}

output "acr_name" {
  value       = azurerm_container_registry.main.name
  description = "ACR name"
}

output "acr_login_server" {
  value       = azurerm_container_registry.main.login_server
  description = "ACR login server URL"
}
