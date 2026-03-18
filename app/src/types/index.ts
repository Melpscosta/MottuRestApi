export interface Moto {
  id: string;
  placa?: string;
  modelo?: string;
  x: number;
  y: number;
  status: 'ativa' | 'oficina' | 'baixa';
  zona?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Anchor {
  id: string;
  x: number;
  y: number;
  type: 'parede' | 'chao';
  txPower: number;
}

export interface Topology {
  id: string;
  name: string;
  anchors: Anchor[];
}

export interface BLEConfig {
  txPower: number;
  pathLoss: number;
  sigma: number;
  rangeMax: number;
  tickMs: number;
  alpha: number;
  yardWidth: number;
  yardHeight: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

// Re-export dos tipos da API
export * from './api.types';

export interface Metrics {
  p50: number;
  p90: number;
  efficacy: number;
  totalCost: number;
}

export interface Position {
  x: number;
  y: number;
  timestamp: number;
}

export type TopologyType = 'A' | 'B' | 'C';