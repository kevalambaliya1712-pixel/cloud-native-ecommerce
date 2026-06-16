variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "sql_admin_password" {
  description = "SQL Server administrator password"
  type        = string
  sensitive   = true
}

variable "aad_admin_object_id" {
  description = "Azure AD admin object ID for SQL"
  type        = string
}

variable "jwt_signing_key" {
  description = "JWT signing key"
  type        = string
  sensitive   = true
  default     = "dev-jwt-secret-change-in-prod-256-bit"
}

variable "alert_email_addresses" {
  description = "Alert notification emails"
  type        = list(string)
  default     = []
}
