import { useState, useEffect, useRef } from 'react';
import { TrilatereacaoService, type RSSIReading } from '../utils/trilateracao';
import { DEFAULT_BLE_CONFIG } from '../utils/constants';
import type { Moto, Anchor, Position, BLEConfig, Metrics } from '../types';

export const useBLESim = (motos: Moto[], anchors: Anchor[], config: BLEConfig = DEFAULT_BLE_CONFIG) => {
  const [estimatedPositions, setEstimatedPositions] = useState<Map<string, Position>>(new Map());
  const [rssiReadings, setRssiReadings] = useState<Map<string, RSSIReading[]>>(new Map());
  const [metrics, setMetrics] = useState<Metrics>({ p50: 0, p90: 0, efficacy: 0, totalCost: 0 });
  
  const previousPositions = useRef<Map<string, Position>>(new Map());
  const errorHistory = useRef<Map<string, number[]>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!motos.length || !anchors.length) return;

    const simulate = () => {
      const newEstimated = new Map<string, Position>();
      const newRSSI = new Map<string, RSSIReading[]>();
      const errors: number[] = [];

      motos.forEach(moto => {
        // Simular leituras RSSI para cada âncora
        const readings: RSSIReading[] = anchors.map(anchor => {
          const distance = TrilatereacaoService.calculateDistance(moto, anchor);
          const rssi = TrilatereacaoService.simulateRSSI(
            distance, 
            anchor.txPower || config.txPower, 
            config.pathLoss, 
            config.sigma
          );
          const estimatedDistance = TrilatereacaoService.rssiToDistance(
            rssi, 
            anchor.txPower || config.txPower, 
            config.pathLoss
          );

          return {
            anchorId: anchor.id,
            rssi,
            distance: estimatedDistance,
          };
        });

        // Trilateração
        const estimated = TrilatereacaoService.trilaterate(
          anchors, 
          readings, 
          config.yardWidth, 
          config.yardHeight
        );

        if (estimated) {
          // Aplicar suavização EMA
          const previous = previousPositions.current.get(moto.id) ?? null;
          const smoothed = TrilatereacaoService.applyEMA(estimated, previous, config.alpha);
          
          newEstimated.set(moto.id, smoothed);
          newRSSI.set(moto.id, readings);
          previousPositions.current.set(moto.id, smoothed);

          // Calcular erro
          const realPosition: Position = { x: moto.x, y: moto.y, timestamp: smoothed.timestamp };
          const error = TrilatereacaoService.calculateError(realPosition, smoothed);
          errors.push(error);

          // Armazenar histórico de erros (janela de 300)
          if (!errorHistory.current.has(moto.id)) {
            errorHistory.current.set(moto.id, []);
          }
          const history = errorHistory.current.get(moto.id)!;
          history.push(error);
          if (history.length > 300) {
            history.shift();
          }
        }
      });

      setEstimatedPositions(newEstimated);
      setRssiReadings(newRSSI);

      // Calcular métricas
      if (errors.length > 0) {
        const sortedErrors = [...errors].sort((a, b) => a - b);
        const p50 = sortedErrors[Math.floor(sortedErrors.length * 0.5)] || 0;
        const p90 = sortedErrors[Math.floor(sortedErrors.length * 0.9)] || 0;
        const efficacy = (errors.filter(e => e <= 5).length / errors.length) * 100;
        const totalCost = (anchors.length * 180) + 220 + (motos.length * 80);

        setMetrics({ p50, p90, efficacy, totalCost });
      }
    };

    // Iniciar simulação
    simulate();
    intervalRef.current = setInterval(simulate, config.tickMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [motos, anchors, config]);

  return {
    estimatedPositions,
    rssiReadings,
    metrics,
  };
};