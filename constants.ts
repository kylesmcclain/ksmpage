
import { Experience, Project, SkillNode, SkillLink, ArchNode, ArchLink } from './types';

export const KYLE_BIO = `
Results-driven IT Systems Administrator with 10+ years of experience managing IT infrastructures across diverse organizations spanning government, healthcare, finance, and law. Skilled in Windows, macOS, and Linux system support, advanced network administration, cloud services, cybersecurity, and disaster recovery.
`;

export const EXPERIENCES: Experience[] = [
  {
    id: 'renegade',
    role: 'Systems Administrator',
    company: 'Renegade.bio',
    period: 'Feb 2022 – Oct 2025',
    description: [
      'Supported 150 users across clinical, corporate, and remote teams.',
      'Managed hybrid environment: Google Workspace, Microsoft 365, GCP. 99.9% uptime.',
      'Deployed Fortinet/Cisco network infrastructure; reduced security incidents by 40%.',
      'Authored PowerShell/Bash scripts for automation, reducing support requests by 30%.',
      'Led LIS Migration and HIPAA compliance validations.',
    ],
    techStack: ['GCP', 'Google Workspace', 'Fortinet', 'Cisco', 'Hyper-V', 'CyberCNS', 'SentinelOne', 'Python', 'Bash']
  },
  {
    id: 'techordia',
    role: 'IT Consultant',
    company: 'Techordia LLC',
    period: 'Oct 2017 – Feb 2022',
    description: [
      'Managed IT infrastructure for 17 diverse clients (healthcare, finance, public sector).',
      'Integrated Okta IAM with M365 for SSO/MFA.',
      'Deployed SonicWall/Meraki firewalls and VMware environments.',
      'Led migrations from on-prem to Azure/Office 365.'
    ],
    techStack: ['Okta', 'Azure', 'SonicWall', 'Meraki', 'VMware', 'ConnectWise']
  },
  {
    id: 'dublin',
    role: 'Computer Technician II',
    company: 'Dublin Unified',
    period: 'Jun 2013 – Sep 2017',
    description: [
      'Maintained network, server, and endpoint infrastructure across school sites.',
      'Delivered classroom hands-on troubleshooting for desktops, printers, Chromebooks.',
      'Oversee IT asset management and hardware repairs.'
    ],
    techStack: ['Windows Server', 'Active Directory', 'Hardware Support', 'Education Tech']
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'lab-relocation',
    title: 'Lab Relocation',
    category: 'Infrastructure',
    shortDescription: 'Led IT preparations for relocating laboratory to a new facility with zero downtime.',
    objective: 'Relocate laboratory and R&D infrastructure to a new facility while maintaining business continuity and ensuring immediate operational readiness.',
    challenge: 'Moving critical lab equipment and IT infrastructure over a single weekend to ensure zero downtime for Monday operations, involving complex vendor coordination.',
    solution: 'Designed new network topology with Fortinet hardware. Mapped all network drops for offices and labs. Coordinated cabling and ISP vendors. Managed physical move of equipment.',
    outcome: 'Achieved full operational readiness by Monday morning with zero downtime for critical workflows, successfully migrating the entire lab infrastructure.',
    tech: ['Fortinet', 'Network Design', 'Vendor Management', 'Cabling', 'ISP Activation'],
    images: [
      'https://placehold.co/600x400/c4d600/000000?text=Fortinet+Topology',
      'https://placehold.co/600x400/0ea5e9/ffffff?text=Server+Rack+Layout',
      'https://placehold.co/600x400/ff6700/ffffff?text=Site+Floorplan'
    ]
  },
  {
    id: 'security-upgrade',
    title: 'Security Upgrade',
    category: 'Infrastructure',
    shortDescription: 'Led the coordination for a comprehensive security system upgrade at the 2850 Seventh Street facility.',
    objective: 'Upgrade physical and network security for the main facility to enhance monitoring and access control capabilities without disrupting daily operations.',
    challenge: 'Coordinating with multiple vendors (Sonitrol, Dell) while ensuring network prerequisites (PoE, VLANs) were in place within a strict timeline.',
    solution: 'Served as primary IT contact, defining technical requirements and scheduling installation phases. Ensured PoE switch availability and configured network segments for security traffic.',
    outcome: 'Successfully oversaw the project to completion, resulting in enhanced physical security and centralized monitoring capabilities with no operational downtime.',
    tech: ['Sonitrol', 'PoE Switching', 'VLAN Configuration', 'Physical Security'],
    images: [
      'https://placehold.co/600x400/ef4444/ffffff?text=VLAN+Segmentation',
      'https://placehold.co/600x400/c4d600/000000?text=Surveillance+Matrix'
    ]
  },
  {
    id: 'lis-migration',
    title: 'LIS Cloud Migration',
    category: 'DevOps',
    shortDescription: 'Migrated legacy LIS from Raspberry Pi to GCP and integrated with Roche cobas systems.',
    objective: 'Modernize the Laboratory Information System (LIS) infrastructure to improve reliability, scalability, and HIPAA compliance.',
    challenge: 'Legacy LIS was running on a Raspberry Pi. Needed to migrate to Google Cloud Platform (GCP) while maintaining integration with on-prem Roche cobas testing instruments and external healthcare portals.',
    solution: 'Migrated legacy system to GCP. Worked with software team to build, test, and deploy a new LIS/LIMS. Facilitated data processing between PRSQRL and Orchard Enterprise Labs (OEL).',
    outcome: 'Established robust, scalable cloud infrastructure. Enabled seamless processing of results for COVID and Monkeypox assays. Ensured 99.9% uptime for clinical operations.',
    tech: ['GCP', 'Roche cobas', 'Orchard OEL', 'HIPAA', 'Postgres', 'GitLab'],
    images: [
      'https://placehold.co/600x400/0ea5e9/ffffff?text=GCP+Architecture',
      'https://placehold.co/600x400/ffffff/000000?text=Roche+Cobas+Integration'
    ]
  },
  {
    id: 'vuln-mgmt',
    title: 'Vuln Management',
    category: 'Security',
    shortDescription: 'Spearheaded deployment of CyberCNS for recurring scanning and reporting.',
    objective: 'Proactively identify and remediate security weaknesses across the IT environment to reduce the organizational attack surface.',
    challenge: 'Lack of visibility into potential threats and patch status across a hybrid environment of Windows, macOS, and Linux devices.',
    solution: 'Deployed CyberCNS as the primary vulnerability management solution. Established a recurring process for scanning, reporting, and tracking vulnerabilities. Integrated with SentinelOne and Perch Security.',
    outcome: 'Significantly improved security posture. Systematically reduced attack surface and established strict patching protocols.',
    tech: ['CyberCNS', 'SentinelOne', 'Perch', 'Patch Management', 'Vulnerability Scanning'],
    images: [
      'https://placehold.co/600x400/8b5cf6/ffffff?text=CyberCNS+Dashboard',
      'https://placehold.co/600x400/c4d600/000000?text=SentinelOne+Threat+Map'
    ]
  },
  {
    id: 'devops-portal',
    title: 'DevOps & Portals',
    category: 'DevOps',
    shortDescription: 'Managed GCP infrastructure and CI/CD pipelines for patient/provider healthcare portals.',
    objective: 'Support the software engineering team in deploying and managing a HIPAA-compliant patient/provider portal.',
    challenge: 'Bridging the gap between complex technical requirements for a Ruby-based application and the underlying cloud infrastructure.',
    solution: 'Managed GCP systems: CI/CD pipelines via GitLab, networking, DNS, Cloud Armor firewalls, IAM policies, and load balancers. Deployed VMs, CloudRun containers, and SQL database backup policies.',
    outcome: 'Enabled rapid deployment of new features. Assisted in troubleshooting API and database issues, ensuring high availability for the renegade.health platform.',
    tech: ['GCP', 'CloudRun', 'GitLab CI/CD', 'SQL', 'Cloud Armor', 'Load Balancing'],
    images: [
      'https://placehold.co/600x400/0ea5e9/ffffff?text=CI%2FCD+Pipeline',
      'https://placehold.co/600x400/facc15/000000?text=Cloud+Armor+Rules'
    ]
  },
  {
    id: 'sat-office',
    title: 'Satellite Office',
    category: 'Network',
    shortDescription: 'Directed comprehensive IT setup for a new executive satellite office.',
    objective: 'Provide secure, seamless network connectivity for a new remote office location.',
    challenge: 'Connecting the satellite office to HQ resources securely with minimal latency.',
    solution: 'Configured Fortinet firewall and switches. Implemented an IPSEC Site-to-Site VPN tunnel back to headquarters. Coordinated ISP activation and cabling vendors.',
    outcome: 'Delivered fully functional secure network access ahead of schedule, enabling executive team operations immediately upon move-in.',
    tech: ['IPSEC VPN', 'Fortinet', 'Network Design', 'ISP Management'],
    images: [
      'https://placehold.co/600x400/ff6700/ffffff?text=VPN+Tunnel+Diagram',
      'https://placehold.co/600x400/c4d600/000000?text=Office+Hardware+Setup'
    ]
  }
];

// Data for Network Graph
export const SKILL_NODES: SkillNode[] = [
  { id: 'Kyle McClain', group: 0, radius: 30, label: 'Kyle McClain' },
  // Cloud
  { id: 'GCP', group: 1, radius: 15, label: 'GCP' },
  { id: 'Azure', group: 1, radius: 15, label: 'Azure' },
  { id: 'M365', group: 1, radius: 12, label: 'M365' },
  { id: 'Workspace', group: 1, radius: 12, label: 'Workspace' },
  // Network
  { id: 'Fortinet', group: 2, radius: 18, label: 'Fortinet' },
  { id: 'Cisco', group: 2, radius: 15, label: 'Cisco' },
  { id: 'Meraki', group: 2, radius: 15, label: 'Meraki' },
  { id: 'SonicWall', group: 2, radius: 12, label: 'SonicWall' },
  { id: 'VPN', group: 2, radius: 10, label: 'VPN' },
  // Security
  { id: 'SentinelOne', group: 3, radius: 15, label: 'SentinelOne' },
  { id: 'CyberCNS', group: 3, radius: 15, label: 'CyberCNS' },
  { id: 'Okta', group: 3, radius: 15, label: 'Okta' },
  { id: 'Proofpoint', group: 3, radius: 12, label: 'Proofpoint' },
  // Tools
  { id: 'PowerShell', group: 4, radius: 14, label: 'PowerShell' },
  { id: 'Bash', group: 4, radius: 14, label: 'Bash' },
  { id: 'GitLab', group: 4, radius: 12, label: 'GitLab' },
  { id: 'Hyper-V', group: 4, radius: 12, label: 'Hyper-V' }
];

export const SKILL_LINKS: SkillLink[] = [
  { source: 'Kyle McClain', target: 'GCP', value: 5 },
  { source: 'Kyle McClain', target: 'Azure', value: 4 },
  { source: 'Kyle McClain', target: 'Fortinet', value: 8 },
  { source: 'Kyle McClain', target: 'SentinelOne', value: 6 },
  { source: 'Kyle McClain', target: 'PowerShell', value: 7 },
  { source: 'GCP', target: 'GitLab', value: 3 },
  { source: 'GCP', target: 'Workspace', value: 4 },
  { source: 'Azure', target: 'M365', value: 5 },
  { source: 'Azure', target: 'Okta', value: 4 },
  { source: 'Fortinet', target: 'VPN', value: 6 },
  { source: 'Fortinet', target: 'Cisco', value: 2 },
  { source: 'SentinelOne', target: 'CyberCNS', value: 4 },
  { source: 'PowerShell', target: 'Azure', value: 3 },
  { source: 'Bash', target: 'GCP', value: 3 },
];

// Data extracted from Fortinet RBI Report PDF
export const SECURITY_STATS = [
  { name: 'Update', value: 102.72, fill: '#0ea5e9' },
  { name: 'Web.Client', value: 73.80, fill: '#ef4444' },
  { name: 'Unscanned', value: 71.10, fill: '#eab308' },
  { name: 'Net.Svc', value: 45.60, fill: '#10b981' },
  { name: 'Collab', value: 35.62, fill: '#8b5cf6' },
];

export const RISK_APPS = [
  { name: 'Tunneling', value: 11049, risk: 'High' },
  { name: 'Cloud', value: 75271, risk: 'Medium' },
  { name: 'Remote', value: 6423, risk: 'Critical' },
  { name: 'Proxy', value: 1421, risk: 'High' },
];

// Architecture Diagram Data: Roche Core Network (Simulated from PDF)
export const ROCHE_NODES: ArchNode[] = [
  { id: 'roche-fw', x: 100, y: 100, label: 'Roche Firewall', type: 'firewall', details: 'Mandatory Roche system firewall. Filters inbound traffic.' },
  { id: 'internet', x: 300, y: 50, label: 'Internet', type: 'cloud', details: 'Public Network (62.209.44.11)' },
  { id: 'cust-fw', x: 500, y: 100, label: 'Customer Firewall', type: 'firewall', details: 'Customer Premise Firewall.' },
  { id: 'axeda', x: 100, y: 250, label: 'Axeda Gateway', type: 'server', details: 'Decrypts certificate based web tunnel. HTTPS/443.' },
  { id: 'infinity', x: 500, y: 250, label: 'cobas Infinity', type: 'server', details: 'HL7 Default Port TCP/3120. Lab Middleware.' },
  { id: 'cust-lis', x: 700, y: 250, label: 'Customer LIS', type: 'server', details: 'Laboratory Information System. Receives HL7 data.' },
  { id: 'cobas-inst', x: 500, y: 400, label: 'Cobas 6800/8800', type: 'device', details: 'PCR Testing Instrument. Connected via Roche Lab Network.' },
];

export const ROCHE_LINKS: ArchLink[] = [
  { source: 'internet', target: 'roche-fw', type: 'standard' },
  { source: 'internet', target: 'cust-fw', type: 'standard' },
  { source: 'roche-fw', target: 'axeda', type: 'encrypted', label: 'Encrypted Web Tunnel' },
  { source: 'axeda', target: 'cust-fw', type: 'encrypted', label: 'HTTPS/443' },
  { source: 'cust-fw', target: 'infinity', type: 'standard' },
  { source: 'infinity', target: 'cust-lis', type: 'standard', label: 'HL7 TCP/3120' },
  { source: 'infinity', target: 'cobas-inst', type: 'standard' },
];

// Heinz Network Data (From Heinz PDF)
export const HEINZ_NODES: ArchNode[] = [
  { id: 'internet-h', x: 400, y: 50, label: 'Internet', type: 'cloud', details: 'ISP Connection' },
  { id: 'firewall-h', x: 400, y: 150, label: 'Firewall', type: 'firewall', details: 'Gateway Device' },
  { id: 'switch-h', x: 400, y: 300, label: 'Managed Switch', type: 'device', details: 'Core Switching Layer (192.168.0.10-20)' },
  { id: 'wifi-pub', x: 200, y: 200, label: 'Public WiFi', type: 'device', details: 'Renegade PUBLIC (192.168.10.x)' },
  { id: 'wifi-priv', x: 600, y: 200, label: 'Private WiFi', type: 'device', details: 'Renegade PRIVATE (192.168.20.x)' },
  { id: 'printer', x: 200, y: 400, label: 'Printers', type: 'device', details: 'Network Printers (192.168.0.80-90)' },
  { id: 'lab-pc', x: 600, y: 400, label: 'Lab PCs', type: 'device', details: 'Lab Workstations (192.168.0.x)' },
];

export const HEINZ_LINKS: ArchLink[] = [
  { source: 'internet-h', target: 'firewall-h', type: 'standard' },
  { source: 'firewall-h', target: 'switch-h', type: 'standard' },
  { source: 'switch-h', target: 'wifi-pub', type: 'standard', label: 'VLAN 10' },
  { source: 'switch-h', target: 'wifi-priv', type: 'standard', label: 'VLAN 20' },
  { source: 'switch-h', target: 'printer', type: 'standard', label: 'VLAN 1' },
  { source: 'switch-h', target: 'lab-pc', type: 'standard', label: 'VLAN 1' },
];
