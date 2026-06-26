variable "project_name" {
  type = string
}
variable "environment" {
  type = string
}
variable "location" {
  type = string
}
variable "resource_group_name" {
  type = string
}
variable "allowed_subnet_ids" {
  description = "Subnet IDs allowed to access Key Vault"
  type        = list(string)
  default     = []
}
variable "aks_identity_principal_id" {
  description = "Object ID for the AKS identity that reads Key Vault secrets"
  type        = string
  default     = ""
}
variable "jwt_signing_key" {
  description = "JWT signing key secret value"
  type        = string
  sensitive   = true
  default     = "change-me-in-production-use-256-bit-key"
}
variable "sql_connection_strings" {
  description = "Map of service name to SQL connection string"
  type        = map(string)
  default     = {}
  sensitive   = true
}
variable "tags" {
  type    = map(string)
  default = {}
}
