import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { IconLibro, IconReglas, IconDiario, IconEstados } from './Icons';

const TABS = [
  { id: 'libro', label: 'Libro', Icon: IconLibro },
  { id: 'reglas', label: 'Reglas', Icon: IconReglas },
  { id: 'diario', label: 'Diario', Icon: IconDiario },
  { id: 'estados', label: 'Estados', Icon: IconEstados },
];

export default function TabBar({ active, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const color = isActive ? colors.latonClaro : 'rgba(246,242,231,.45)';
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            {isActive && <View style={styles.rivet} />}
            <Icon size={21} color={color} />
            <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.tinta,
    borderTopWidth: 1,
    borderTopColor: 'rgba(221,178,85,.22)',
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 12,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'rgba(221,178,85,.1)',
  },
  rivet: {
    position: 'absolute',
    top: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.latonClaro,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 1,
  },
});
