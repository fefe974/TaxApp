import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { IconInicio, IconLibro, IconReglas, IconDiario, IconEstados } from './Icons';

const TABS = [
  { id: 'home', label: 'Inicio', Icon: IconInicio },
  { id: 'libro', label: 'Libro', Icon: IconLibro },
  { id: 'reglas', label: 'Reglas', Icon: IconReglas },
  { id: 'diario', label: 'Diario', Icon: IconDiario },
  { id: 'estados', label: 'Estados', Icon: IconEstados },
];

export default function TabBar({ active, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const color = isActive ? colors.green : colors.textoFaint;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={[styles.tab, isActive && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon size={20} color={color} />
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
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 9,
    paddingHorizontal: 8,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.greenLight,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 0.6,
  },
});
