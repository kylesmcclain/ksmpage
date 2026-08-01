/**
 * Segmented VPC for a regulated workload.
 *
 * This is the network shape behind the clinical-platform case study, expressed as code:
 * a private application tier that cannot reach the internet directly, a data tier that
 * accepts traffic only from the application tier, and an isolated device tier for the
 * long-lived, rarely-patched equipment that every physical site accumulates.
 *
 * The organising principle is blast radius. Cameras, door controllers, and lab instruments
 * are treated as hostile by default — not because they are, but because they are the class
 * of device most likely to be compromised and least likely to be patched, and containment
 * is cheaper than trust.
 *
 * Deliberately omitted: any real project ID, CIDR, or organisation. Every value is a
 * variable with a documented default so this reads as a pattern, not as a leaked config.
 */

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

locals {
  # One tier per trust boundary. Ordering here drives subnet CIDR allocation below.
  tiers = {
    app = {
      index                 = 0
      private_google_access = true
      description           = "Application workloads. No public addressing; egress via Cloud NAT."
    }
    data = {
      index                 = 1
      private_google_access = true
      description           = "Managed data services. Reachable only from the application tier."
    }
    device = {
      index                 = 2
      private_google_access = false
      description          = "Long-lived physical devices. No egress, no lateral reach."
    }
  }

  common_labels = merge(var.labels, {
    managed_by = "terraform"
    compliance = var.compliance_scope
  })
}

resource "google_compute_network" "main" {
  name                    = "${var.name_prefix}-vpc"
  project                 = var.project_id
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"

  # Auto-created subnets hand you an unaudited address plan in every region. Opt out.
  description = "Segmented VPC for ${var.compliance_scope} workloads. Managed by Terraform."
}

resource "google_compute_subnetwork" "tier" {
  for_each = local.tiers

  name    = "${var.name_prefix}-${each.key}"
  project = var.project_id
  region  = var.region
  network = google_compute_network.main.id

  ip_cidr_range = cidrsubnet(var.network_cidr, var.subnet_newbits, each.value.index)

  # Without this, private instances must be given public IPs to reach Google APIs, which
  # defeats the entire point of a private tier.
  private_ip_google_access = each.value.private_google_access

  # Flow logs are the difference between "we believe nothing reached the data tier" and
  # being able to show it. Sampled rather than full, because the bill is real.
  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = var.flow_log_sampling
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# --------------------------------------------------------------------------- egress

resource "google_compute_router" "nat" {
  name    = "${var.name_prefix}-router"
  project = var.project_id
  region  = var.region
  network = google_compute_network.main.id
}

resource "google_compute_router_nat" "egress" {
  name    = "${var.name_prefix}-nat"
  project = var.project_id
  region  = var.region
  router  = google_compute_router.nat.name

  nat_ip_allocate_option = "AUTO_ONLY"

  # The device tier is intentionally excluded: it gets no outbound path at all.
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  dynamic "subnetwork" {
    for_each = { for k, v in local.tiers : k => v if k != "device" }
    content {
      name                    = google_compute_subnetwork.tier[subnetwork.key].id
      source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
    }
  }

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# --------------------------------------------------------------------------- firewall

# Deny everything first. Every rule after this is an explicit, reviewable exception.
resource "google_compute_firewall" "deny_all_ingress" {
  name     = "${var.name_prefix}-deny-all-ingress"
  project  = var.project_id
  network  = google_compute_network.main.name
  priority = 65534

  direction = "INGRESS"
  deny { protocol = "all" }
  source_ranges = ["0.0.0.0/0"]

  log_config { metadata = "INCLUDE_ALL_METADATA" }
}

resource "google_compute_firewall" "deny_all_egress" {
  name     = "${var.name_prefix}-deny-all-egress"
  project  = var.project_id
  network  = google_compute_network.main.name
  priority = 65534

  direction = "EGRESS"
  deny { protocol = "all" }
  destination_ranges = ["0.0.0.0/0"]

  log_config { metadata = "INCLUDE_ALL_METADATA" }
}

# The data tier accepts connections from the application tier and from nowhere else —
# expressed by service account, not by IP, so it survives re-addressing.
resource "google_compute_firewall" "app_to_data" {
  name     = "${var.name_prefix}-app-to-data"
  project  = var.project_id
  network  = google_compute_network.main.name
  priority = 1000

  direction               = "INGRESS"
  source_service_accounts = [var.app_service_account]
  target_service_accounts = [var.data_service_account]

  allow {
    protocol = "tcp"
    ports    = [tostring(var.database_port)]
  }

  log_config { metadata = "INCLUDE_ALL_METADATA" }
}

# Health checks arrive from documented Google ranges, not from the internet at large.
resource "google_compute_firewall" "health_checks" {
  name     = "${var.name_prefix}-allow-health-checks"
  project  = var.project_id
  network  = google_compute_network.main.name
  priority = 900

  direction = "INGRESS"
  # Published Google Cloud health-check ranges.
  source_ranges           = ["35.191.0.0/16", "130.211.0.0/22"]
  target_service_accounts = [var.app_service_account]

  allow {
    protocol = "tcp"
    ports    = [tostring(var.application_port)]
  }
}

# The device tier may reach its collector and nothing else. This single rule is the entire
# reason a compromised camera cannot become a foothold.
resource "google_compute_firewall" "device_to_collector" {
  name     = "${var.name_prefix}-device-to-collector"
  project  = var.project_id
  network  = google_compute_network.main.name
  priority = 1000

  direction          = "EGRESS"
  target_tags        = ["device-tier"]
  destination_ranges = [google_compute_subnetwork.tier["app"].ip_cidr_range]

  allow {
    protocol = "tcp"
    ports    = [tostring(var.collector_port)]
  }

  log_config { metadata = "INCLUDE_ALL_METADATA" }
}
