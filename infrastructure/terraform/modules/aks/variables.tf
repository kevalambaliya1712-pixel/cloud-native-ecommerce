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

variable "kubernetes_version" {
  description = "Kubernetes version for AKS"
  type        = string
  default     = "1.29"
}

variable "aks_subnet_id" {
  description = "Subnet ID for AKS nodes"
  type        = string
}

variable "system_node_vm_size" {
  description = "VM size for system node pool"
  type        = string
  default     = "Standard_B2s"
}

variable "system_node_count" {
  description = "Initial system node count"
  type        = number
  default     = 1
}

variable "system_node_min_count" {
  description = "Minimum system node count"
  type        = number
  default     = 1
}

variable "system_node_max_count" {
  description = "Maximum system node count"
  type        = number
  default     = 3
}

variable "user_node_vm_size" {
  description = "VM size for user node pool"
  type        = string
  default     = "Standard_B2ms"
}

variable "user_node_count" {
  description = "Initial user node count"
  type        = number
  default     = 1
}

variable "user_node_min_count" {
  description = "Minimum user node count"
  type        = number
  default     = 1
}

variable "user_node_max_count" {
  description = "Maximum user node count"
  type        = number
  default     = 5
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID for monitoring"
  type        = string
}

variable "acr_id" {
  description = "ACR resource ID for AcrPull role assignment"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}
