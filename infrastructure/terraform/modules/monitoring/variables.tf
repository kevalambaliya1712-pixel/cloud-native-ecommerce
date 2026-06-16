variable "project_name" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "daily_quota_gb" {
  description = "Daily ingestion quota in GB for non-prod"
  type        = number
  default     = 1
}
variable "alert_email_addresses" {
  description = "List of email addresses for alert notifications"
  type        = list(string)
  default     = []
}
variable "tags" {
  type    = map(string)
  default = {}
}
