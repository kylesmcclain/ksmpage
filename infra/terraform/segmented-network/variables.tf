variable "project_id" {
  description = "Target Google Cloud project ID."
  type        = string
}

variable "region" {
  description = "Region for the VPC's regional resources."
  type        = string
  default     = "us-west1"
}

variable "name_prefix" {
  description = "Prefix applied to every resource name. Keep it short — names have length limits."
  type        = string
  default     = "regulated"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,18}$", var.name_prefix))
    error_message = "name_prefix must be lowercase alphanumeric with hyphens, 2-19 characters, starting with a letter."
  }
}

variable "network_cidr" {
  description = "Supernet from which each tier's subnet is carved."
  type        = string
  default     = "10.64.0.0/16"

  validation {
    condition     = can(cidrhost(var.network_cidr, 0))
    error_message = "network_cidr must be valid CIDR notation."
  }
}

variable "subnet_newbits" {
  description = "Bits added to network_cidr's prefix per subnet. 4 yields /20s from a /16."
  type        = number
  default     = 4

  validation {
    condition     = var.subnet_newbits >= 2 && var.subnet_newbits <= 8
    error_message = "subnet_newbits must be between 2 and 8 to leave room for growth."
  }
}

variable "app_service_account" {
  description = "Service account attached to application-tier workloads. Firewall rules key off identity rather than address so they survive re-addressing."
  type        = string
}

variable "data_service_account" {
  description = "Service account attached to data-tier workloads."
  type        = string
}

variable "application_port" {
  description = "Port the application listens on for load-balancer health checks and traffic."
  type        = number
  default     = 8080
}

variable "database_port" {
  description = "Port the data tier accepts from the application tier."
  type        = number
  default     = 5432
}

variable "collector_port" {
  description = "Port the device tier is permitted to reach on its collector."
  type        = number
  default     = 8443
}

variable "flow_log_sampling" {
  description = "Fraction of flows logged (0.0-1.0). Full capture is rarely worth the cost; 0.5 is enough to answer 'did anything reach the data tier'."
  type        = number
  default     = 0.5

  validation {
    condition     = var.flow_log_sampling > 0 && var.flow_log_sampling <= 1
    error_message = "flow_log_sampling must be greater than 0 and at most 1. Disabling flow logs removes the evidence trail entirely."
  }
}

variable "compliance_scope" {
  description = "Regulatory scope, applied as a label so cost and audit reporting can filter on it."
  type        = string
  default     = "hipaa"
}

variable "labels" {
  description = "Additional labels merged into every resource."
  type        = map(string)
  default     = {}
}
