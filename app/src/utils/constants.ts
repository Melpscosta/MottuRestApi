export const DEFAULT_TOPOLOGIES = {
  A: {
    id: 'A',
    name: 'Topologia A - Básica',
    anchors: [
      { id: 'G1', x: 5, y: 0, type: 'parede' as const, txPower: -59 },
      { id: 'G2', x: 35, y: 0, type: 'parede' as const, txPower: -59 },
      { id: 'G3', x: 40, y: 20, type: 'parede' as const, txPower: -59 },
    ]
  },
  B: {
    id: 'B',
    name: 'Topologia B - Intermediária',
    anchors: [
      { id: 'G1', x: 5, y: 0, type: 'parede' as const, txPower: -59 },
      { id: 'G2', x: 35, y: 0, type: 'parede' as const, txPower: -59 },
      { id: 'G3', x: 40, y: 20, type: 'parede' as const, txPower: -59 },
      { id: 'G4', x: 35, y: 30, type: 'parede' as const, txPower: -59 },
      { id: 'G5', x: 5, y: 30, type: 'parede' as const, txPower: -59 },
    ]
  },
  C: {
    id: 'C',
    name: 'Topologia C - Avançada',
    anchors: [
      { id: 'G1', x: 5, y: 0, type: 'parede' as const, txPower: -59 },
      { id: 'G2', x: 35, y: 0, type: 'parede' as const, txPower: -59 },
      { id: 'G3', x: 40, y: 25, type: 'parede' as const, txPower: -59 },
      { id: 'G4', x: 20, y: 10, type: 'chao' as const, txPower: -59 },
      { id: 'G5', x: 12, y: 20, type: 'chao' as const, txPower: -59 },
    ]
  }
};

export const DEFAULT_BLE_CONFIG = {
  txPower: -59,
  pathLoss: 2.2,
  sigma: 2,
  rangeMax: 20,
  tickMs: 4000, // atualização a cada 4s (evita piscar/recarregar o tempo todo)
  alpha: 0.25,
  yardWidth: 40,
  yardHeight: 30,
};

export const ZONES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];

export const COSTS = {
  ANCHOR: 180,
  AGGREGATOR: 220,
  BEACON: 80,
};