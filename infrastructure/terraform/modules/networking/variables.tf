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

variable "vnet_address_space" {
  description = "VNet address space CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "aks_subnet_prefix" {
  description = "AKS subnet CIDR"
  type        = string
  default     = "10.0.1.0/24"
}

variable "appgw_subnet_prefix" {
  description = "Application Gateway subnet CIDR"
  type        = string
  default     = "10.0.2.0/24"
}

variable "data_subnet_prefix" {
  description = "Data tier subnet CIDR"
  type        = string
  default     = "10.0.3.0/24"
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}
