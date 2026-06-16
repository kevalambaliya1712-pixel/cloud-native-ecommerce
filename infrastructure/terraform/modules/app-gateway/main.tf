# =============================================================================
# CloudCommerce - Application Gateway Module
# =============================================================================
# Provisions Azure Application Gateway with WAF v2 for L7 load balancing,
# SSL termination, and web application firewall protection.
# =============================================================================

# Public IP for Application Gateway
resource "azurerm_public_ip" "appgw" {
  name                = "pip-appgw-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = merge(var.tags, { Component = "AppGateway" })
}

# Application Gateway with WAF v2
resource "azurerm_application_gateway" "main" {
  name                = "appgw-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  sku {
    name     = "WAF_v2"
    tier     = "WAF_v2"
    capacity = var.environment == "prod" ? 2 : 1
  }

  gateway_ip_configuration {
    name      = "gateway-ip-config"
    subnet_id = var.appgw_subnet_id
  }

  frontend_ip_configuration {
    name                 = "frontend-ip"
    public_ip_address_id = azurerm_public_ip.appgw.id
  }

  frontend_port {
    name = "http-port"
    port = 80
  }

  frontend_port {
    name = "https-port"
    port = 443
  }

  backend_address_pool {
    name = "aks-backend-pool"
  }

  backend_http_settings {
    name                  = "http-settings"
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 30
    probe_name            = "health-probe"

    connection_draining {
      enabled           = true
      drain_timeout_sec = 60
    }
  }

  probe {
    name                = "health-probe"
    host                = "127.0.0.1"
    interval            = 30
    timeout             = 30
    unhealthy_threshold = 3
    protocol            = "Http"
    path                = "/health"
    port                = 80

    match {
      status_code = ["200"]
    }
  }

  http_listener {
    name                           = "http-listener"
    frontend_ip_configuration_name = "frontend-ip"
    frontend_port_name             = "http-port"
    protocol                       = "Http"
  }

  # HTTP to HTTPS redirect
  redirect_configuration {
    name                 = "http-to-https-redirect"
    redirect_type        = "Permanent"
    target_listener_name = "http-listener"
    include_path         = true
    include_query_string = true
  }

  request_routing_rule {
    name                       = "routing-rule"
    rule_type                  = "Basic"
    http_listener_name         = "http-listener"
    backend_address_pool_name  = "aks-backend-pool"
    backend_http_settings_name = "http-settings"
    priority                   = 100
  }

  # WAF Configuration
  waf_configuration {
    enabled                  = true
    firewall_mode            = var.environment == "prod" ? "Prevention" : "Detection"
    rule_set_type            = "OWASP"
    rule_set_version         = "3.2"
    file_upload_limit_mb     = 100
    max_request_body_size_kb = 128
    request_body_check       = true

    disabled_rule_group {
      rule_group_name = "REQUEST-920-PROTOCOL-ENFORCEMENT"
      rules           = [920300, 920320]
    }
  }

  tags = merge(var.tags, { Component = "AppGateway" })
}
