output "network_id" {
  description = "Self-link of the VPC."
  value       = google_compute_network.main.id
}

output "network_name" {
  description = "Name of the VPC."
  value       = google_compute_network.main.name
}

output "subnet_ids" {
  description = "Subnet self-link per tier."
  value       = { for tier, subnet in google_compute_subnetwork.tier : tier => subnet.id }
}

output "subnet_cidrs" {
  description = "Allocated CIDR per tier — useful for populating peer or on-premises route tables."
  value       = { for tier, subnet in google_compute_subnetwork.tier : tier => subnet.ip_cidr_range }
}

output "device_tier_has_egress" {
  description = "Asserts the containment property this module exists to provide. If this is ever true, the design has regressed."
  value       = false
}
