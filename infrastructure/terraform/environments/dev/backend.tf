terraform {
  backend "azurerm" {
    resource_group_name  = "rg-cloudcommerce-tfstate"
    storage_account_name = "cloudcommercetfstate"
    container_name       = "tfstate-dev"
    key                  = "cloudcommerce-dev.tfstate"
  }
}
