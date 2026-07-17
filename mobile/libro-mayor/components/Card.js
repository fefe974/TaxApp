import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../theme';

const LINE_GAP = 27;
const RULED_LINE_COUNT = 46; // covers ~1240px of card height; excess is clipped by overflow:hidden

function RuledBackground() {
  const lines = [];
  for (let i = 1; i <= RULED_LINE_COUNT; i++) {
    lines.push(<View key={i} style={[styles.ruleLine, { top: i * LINE_GAP }]} />);
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines}
      <View style={styles.marginRule} />
    </View>
  );
}

export function Card({ children, style, tier = 'contact' }) {
  return <View style={[styles.card, shadow(tier), style]}>{children}</View>;
}

export function PaperCard({ children, style }) {
  return (
    <View style={[styles.paperCard, shadow('ambient'), style]}>
      <RuledBackground />
      <View style={styles.giltEdge} />
      <View style={styles.pageEdge} />
      <View style={styles.paperContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
  },
  paperCard: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: '#E4DAC0',
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  paperContent: {
    paddingVertical: 20,
    paddingRight: 18,
    paddingLeft: 38,
  },
  ruleLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.regla,
  },
  marginRule: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 26,
    width: 1.5,
    backgroundColor: colors.margen,
  },
  giltEdge: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.latonClaro,
  },
  pageEdge: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    right: 0,
    width: 5,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: colors.papel3,
  },
});
