export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  NETWORK = 'NETWORK',
  TERMINAL = 'TERMINAL',
  SECURITY = 'SECURITY',
  PROJECTS = 'PROJECTS',
  ARCHITECTURE = 'ARCHITECTURE'
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string[];
  techStack: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  // Deep Dive Fields
  objective?: string;
  challenge?: string;
  solution?: string;
  outcome: string;
  tech: string[];
  images?: string[]; // For future use
}

export interface SkillNode {
  id: string;
  group: number; // 1: Cloud, 2: Network, 3: OS, 4: Tools
  radius: number;
  label: string;
}

export interface SkillLink {
  source: string;
  target: string;
  value: number;
}

export interface ArchNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'firewall' | 'server' | 'cloud' | 'device' | 'network';
  details: string;
  ports?: string[];
}

export interface ArchLink {
  source: string;
  target: string;
  label?: string;
  type?: 'encrypted' | 'standard';
}
