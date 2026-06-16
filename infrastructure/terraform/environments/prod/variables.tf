variable "location" { type = string; default = "eastus" }
variable "sql_admin_password" { type = string; sensitive = true }
variable "aad_admin_object_id" { type = string }
variable "jwt_signing_key" { type = string; sensitive = true }
variable "alert_email_addresses" { type = list(string); default = [] }
