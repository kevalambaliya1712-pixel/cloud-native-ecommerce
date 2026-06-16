output "sql_server_id" {
  value       = azurerm_mssql_server.main.id
  description = "SQL Server resource ID"
}

output "sql_server_fqdn" {
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
  description = "SQL Server FQDN for connection strings"
}

output "sql_server_name" {
  value       = azurerm_mssql_server.main.name
  description = "SQL Server name"
}

output "database_ids" {
  value       = { for k, v in azurerm_mssql_database.databases : k => v.id }
  description = "Map of database name to resource ID"
}

output "database_names" {
  value       = { for k, v in azurerm_mssql_database.databases : k => v.name }
  description = "Map of database names"
}
