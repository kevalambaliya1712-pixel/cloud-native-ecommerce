variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
}

variable "admin_username" {
  description = "SQL Server administrator username"
  type        = string
  default     = "sqladmin"
  sensitive   = true
}

variable "admin_password" {
  description = "SQL Server administrator password"
  type        = string
  sensitive   = true
}

variable "aad_admin_login" {
  description = "Azure AD admin login username"
  type        = string
  default     = "aad-admin@cloudcommerce.com"
}

variable "aad_admin_object_id" {
  description = "Azure AD admin object ID"
  type        = string
}

variable "database_names" {
  description = "List of database names (one per service)"
  type        = list(string)
  default     = ["users-db", "products-db", "carts-db", "orders-db"]
}

variable "aks_subnet_id" {
  description = "AKS subnet ID for VNet rule"
  type        = string
}

variable "max_size_gb" {
  description = "Maximum database size in GB"
  type        = number
  default     = 32
}

variable "prod_sku_name" {
  description = "SKU for production databases"
  type        = string
  default     = "GP_Gen5_2"
}

variable "security_alert_emails" {
  description = "Email addresses for security alerts"
  type        = list(string)
  default     = []
}

variable "audit_storage_endpoint" {
  description = "Storage account endpoint for audit logs"
  type        = string
  default     = ""
}

variable "audit_storage_access_key" {
  description = "Storage account access key for audit logs"
  type        = string
  default     = ""
  sensitive   = true
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}
