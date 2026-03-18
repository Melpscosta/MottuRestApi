import type { Anchor, Position } from '../types';

export interface RSSIReading {
  anchorId: string;
  rssi: number;
  distance: number;
}

export class TrilatereacaoService {
  static simulateRSSI(distance: number, txPower = -59, pathLoss = 2.2, sigma = 2): number {
    const minDistance = Math.max(distance, 0.5);
    const rssi = txPower - 10 * pathLoss * Math.log10(minDistance);
    const noise = (Math.random() - 0.5) * 2 * sigma;
    return rssi + noise;
  }

  static rssiToDistance(rssi: number, txPower = -59, pathLoss = 2.2): number {
    const distance = Math.pow(10, (txPower - rssi) / (10 * pathLoss));
    return Math.max(distance, 0.5);
  }

  static calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  static trilaterate(
    anchors: Anchor[], 
    rssiReadings: RSSIReading[], 
    yardWidth = 40, 
    yardHeight = 30
  ): Position | null {
    if (anchors.length < 3 || rssiReadings.length < 3) return null;

    const validReadings = rssiReadings.filter(r => 
      anchors.some(a => a.id === r.anchorId)
    );

    if (validReadings.length < 3) return null;

    // Método dos mínimos quadrados
    let sumX = 0, sumY = 0, count = 0;
    
    for (let i = 0; i < validReadings.length - 1; i++) {
      for (let j = i + 1; j < validReadings.length; j++) {
        const anchor1 = anchors.find(a => a.id === validReadings[i].anchorId);
        const anchor2 = anchors.find(a => a.id === validReadings[j].anchorId);
        
        if (!anchor1 || !anchor2) continue;

        const r1 = validReadings[i].distance;
        const r2 = validReadings[j].distance;

        const dx = anchor2.x - anchor1.x;
        const dy = anchor2.y - anchor1.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d === 0) continue;

        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));

        const cx = anchor1.x + a * dx / d;
        const cy = anchor1.y + a * dy / d;

        // Duas possíveis posições
        const pos1x = cx + h * dy / d;
        const pos1y = cy - h * dx / d;
        const pos2x = cx - h * dy / d;
        const pos2y = cy + h * dx / d;

        // Escolher a posição que melhor se ajusta às outras âncoras
        let minError1 = 0, minError2 = 0;
        for (const reading of validReadings) {
          const anchor = anchors.find(a => a.id === reading.anchorId);
          if (!anchor) continue;

          const dist1 = this.calculateDistance({ x: pos1x, y: pos1y }, anchor);
          const dist2 = this.calculateDistance({ x: pos2x, y: pos2y }, anchor);

          minError1 += Math.abs(dist1 - reading.distance);
          minError2 += Math.abs(dist2 - reading.distance);
        }

        if (minError1 < minError2) {
          sumX += pos1x;
          sumY += pos1y;
        } else {
          sumX += pos2x;
          sumY += pos2y;
        }
        count++;
      }
    }

    if (count === 0) return null;

    const estimatedX = Math.max(0, Math.min(yardWidth, sumX / count));
    const estimatedY = Math.max(0, Math.min(yardHeight, sumY / count));

    return {
      x: estimatedX,
      y: estimatedY,
      timestamp: Date.now(),
    };
  }

  static applyEMA(current: Position, previous: Position | null, alpha = 0.25): Position {
    if (!previous) return current;

    return {
      x: alpha * current.x + (1 - alpha) * previous.x,
      y: alpha * current.y + (1 - alpha) * previous.y,
      timestamp: current.timestamp,
    };
  }

  static calculateError(real: Position, estimated: Position): number {
    return this.calculateDistance(real, estimated);
  }

  static getZone(x: number, y: number, yardWidth = 40, yardHeight = 30): string {
    const zoneWidth = yardWidth / 2;
    const zoneHeight = yardHeight / 4;

    const col = x < zoneWidth ? '1' : '2';
    const row = Math.floor(y / zoneHeight);
    const rowLetter = ['A', 'B', 'C', 'D'][Math.min(row, 3)];

    return `${rowLetter}${col}`;
  }
}