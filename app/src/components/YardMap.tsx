import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import Svg, { 
  Rect, 
  Circle, 
  Text as SvgText, 
  G, 
  ClipPath, 
  Defs, 
  Line 
} from 'react-native-svg';
import type { Moto, Anchor, Position } from '../types';

interface YardMapProps {
  motos: Moto[];
  estimatedPositions: Map<string, Position>;
  anchors: Anchor[];
  showGrid?: boolean;
  showCoverage?: boolean;
  yardWidth: number;
  yardHeight: number;
  onMotoPress?: (moto: Moto) => void;
}

export const YardMap: React.FC<YardMapProps> = ({
  motos,
  estimatedPositions,
  anchors,
  showGrid = false,
  showCoverage = false,
  yardWidth,
  yardHeight,
  onMotoPress,
}) => {
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Calcula dimensões responsivas do mapa
  const isLandscape = screenWidth > screenHeight;
  const maxMapWidth = screenWidth - 32; // 16px padding de cada lado
  const maxMapHeight = screenHeight * 0.4; // 40% da altura da tela
  
  // Mantém proporção do pátio (40:30 = 4:3)
  const aspectRatio = yardWidth / yardHeight; // 4:3
  
  let mapWidth: number;
  let mapHeight: number;
  
  if (isLandscape) {
    // Em landscape, prioriza altura
    mapHeight = Math.min(maxMapHeight, maxMapWidth / aspectRatio);
    mapWidth = mapHeight * aspectRatio;
  } else {
    // Em portrait, prioriza largura
    mapWidth = Math.min(maxMapWidth, maxMapHeight * aspectRatio);
    mapHeight = mapWidth / aspectRatio;
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      overflow: 'hidden',
      alignSelf: 'center',
    },
    mapWrapper: {
      alignItems: 'center',
    },
    legend: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      width: mapWidth,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 6,
    },
    legendText: {
      fontSize: Math.max(12, mapWidth * 0.025), // Fonte responsiva
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
  });

  // Ajusta tamanhos dos elementos baseado no tamanho do mapa
  const getResponsiveSize = (baseSize: number) => {
    const scale = Math.min(mapWidth / 300, mapHeight / 225); // 300x225 é o tamanho base de referência
    return Math.max(baseSize * scale, baseSize * 0.5); // Mínimo de 50% do tamanho base
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const lines: React.JSX.Element[] = [];
    const zoneWidth = yardWidth / 2;
    const zoneHeight = yardHeight / 4;
    const strokeWidth = getResponsiveSize(0.1);

    // Linhas verticais
    for (let i = 1; i < 2; i++) {
      const x = i * zoneWidth;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={yardHeight}
          stroke={theme.colors.outline}
          strokeWidth={strokeWidth.toString()}
          opacity={0.5}
        />
      );
    }

    // Linhas horizontais
    for (let i = 1; i < 4; i++) {
      const y = i * zoneHeight;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={yardWidth}
          y2={y}
          stroke={theme.colors.outline}
          strokeWidth={strokeWidth.toString()}
          opacity={0.5}
        />
      );
    }

    // Labels das zonas
    const labels = [];
    const zones = ['A', 'B', 'C', 'D'];
    const fontSize = getResponsiveSize(1);
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const x = (col * zoneWidth + zoneWidth / 2);
        const y = (row * zoneHeight + zoneHeight / 2);
        labels.push(
          <SvgText
            key={`${zones[row]}${col + 1}`}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize={fontSize.toString()}
            fill={theme.colors.onSurfaceVariant}
            opacity={0.7}
          >
            {zones[row]}{col + 1}
          </SvgText>
        );
      }
    }

    return [...lines, ...labels];
  };

  const renderCoverage = () => {
    if (!showCoverage) return null;

    const coverage: React.JSX.Element[] = [];
    const strokeWidth = getResponsiveSize(0.05);
    
    anchors.forEach((anchor, index) => {
      for (let range = 5; range <= 20; range += 5) {
        coverage.push(
          <Circle
            key={`coverage-${index}-${range}`}
            cx={anchor.x}
            cy={anchor.y}
            r={range}
            fill="rgba(0, 200, 81, 0.08)"
            stroke="#1e2823"
            strokeWidth={strokeWidth.toString()}
            clipPath="url(#yardClip)"
          />
        );
      }
    });

    return coverage;
  };

  const renderAnchors = () => {
    const anchorSize = getResponsiveSize(1.2);
    const fontSize = getResponsiveSize(1);
    
    return anchors.map((anchor, index) => (
      <G key={anchor.id}>
        <Rect
          x={anchor.x - anchorSize / 2}
          y={anchor.y - anchorSize / 2}
          width={anchorSize}
          height={anchorSize}
          fill="#FF5C5C"
          rx={anchorSize * 0.2}
        />
        <SvgText
          x={anchor.x}
          y={anchor.y - anchorSize * 0.8}
          textAnchor="middle"
          fontSize={fontSize.toString()}
          fill={theme.colors.onSurface}
          fontWeight="bold"
        >
          {anchor.id}
        </SvgText>
      </G>
    ));
  };

  const renderMotos = () => {
    const elements: React.JSX.Element[] = [];
    const motoSize = getResponsiveSize(0.6);
    const fontSize = getResponsiveSize(1);

    motos.forEach((moto) => {
      // Moto real (verde)
      elements.push(
        <Circle
          key={`real-${moto.id}`}
          cx={moto.x}
          cy={moto.y}
          r={motoSize}
          fill="#00C851"
          onPress={() => onMotoPress?.(moto)}
        />
      );

      // Moto estimada (amarelo)
      const estimated = estimatedPositions.get(moto.id);
      if (estimated) {
        elements.push(
          <Circle
            key={`estimated-${moto.id}`}
            cx={estimated.x}
            cy={estimated.y}
            r={motoSize}
            fill="#FFD166"
            opacity={0.8}
          />
        );
      }

      // Label da moto
      elements.push(
        <SvgText
          key={`label-${moto.id}`}
          x={moto.x}
          y={moto.y - motoSize * 2}
          textAnchor="middle"
          fontSize={fontSize.toString()}
          fill={theme.colors.onSurface}
          fontWeight="bold"
        >
          {moto.id}
        </SvgText>
      );
    });

    return elements;
  };

  return (
    <View style={styles.mapWrapper}>
      <View style={[styles.container, { width: mapWidth, height: mapHeight }]}>
        <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${yardWidth} ${yardHeight}`}>
          <Defs>
            <ClipPath id="yardClip">
              <Rect x="0" y="0" width={yardWidth} height={yardHeight} />
            </ClipPath>
          </Defs>

          <G clipPath="url(#yardClip)">
            {/* Fundo único visível */}
            <Rect
              x="0"
              y="0"
              width={yardWidth}
              height={yardHeight}
              fill={theme.colors.surfaceVariant}
              stroke={theme.colors.outline}
              strokeWidth={getResponsiveSize(0.2).toString()}
            />
            {/* Zonas em overlay suave (opacidade baixa para não esconder o resto) */}
            <Rect x="0" y="0" width={yardWidth / 2} height={yardHeight / 3} fill="#81c784" opacity={0.25} />
            <Rect x={yardWidth / 2} y="0" width={yardWidth / 2} height={yardHeight / 3} fill="#81c784" opacity={0.25} />
            <Rect x="0" y={yardHeight / 3} width={yardWidth / 2} height={yardHeight / 3} fill="#64b5f6" opacity={0.25} />
            <Rect x={yardWidth / 2} y={yardHeight / 3} width={yardWidth / 2} height={yardHeight / 3} fill="#64b5f6" opacity={0.25} />
            <Rect x="0" y={(yardHeight * 2) / 3} width={yardWidth / 2} height={yardHeight / 3} fill="#ffb74d" opacity={0.3} />
            <Rect x={yardWidth / 2} y={(yardHeight * 2) / 3} width={yardWidth / 2} height={yardHeight / 3} fill="#ffb74d" opacity={0.3} />
            {/* Grade de zonas */}
            {renderGrid()}

            {/* Cobertura BLE */}
            {renderCoverage()}

            {/* Âncoras */}
            {renderAnchors()}

            {/* Motos */}
            {renderMotos()}
          </G>
        </Svg>
      </View>

      {/* Legenda: Zonas + Motos */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#a5d6a7' }]} />
          <Text style={styles.legendText}>Zona A</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#90caf9' }]} />
          <Text style={styles.legendText}>Zona B</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#fff3e0', borderWidth: 1, borderColor: '#ffcc80' }]} />
          <Text style={styles.legendText}>Zona C</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00C851' }]} />
          <Text style={styles.legendText}>Moto</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF5C5C', borderRadius: 2 }]} />
          <Text style={styles.legendText}>Âncora</Text>
        </View>
      </View>
    </View>
  );
};