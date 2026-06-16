terraform {
  backend "azurerm" {
    resource_group_name  = "rg-cloudcommerce-tfstate"
    storage_account_name = "cloudcommercetfstate"
    container_name       = "tfstate-prod"
    key                  = "cloudcommerce-prod.tfstate"
  }
}
