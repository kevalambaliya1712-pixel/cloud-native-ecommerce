output "vnet_id" {
  value       = azurerm_virtual_network.main.id
  description = "Virtual Network resource ID"
}

output "vnet_name" {
  value       = azurerm_virtual_network.main.name
  description = "Virtual Network name"
}

output "aks_subnet_id" {
  value       = azurerm_subnet.aks.id
  description = "AKS subnet resource ID"
}

output "appgw_subnet_id" {
  value       = azurerm_subnet.appgw.id
  description = "Application Gateway subnet resource ID"
}

output "data_subnet_id" {
  value       = azurerm_subnet.data.id
  description = "Data tier subnet resource ID"
}

output "aks_nsg_id" {
  value       = azurerm_network_security_group.aks.id
  description = "AKS NSG resource ID"
}
