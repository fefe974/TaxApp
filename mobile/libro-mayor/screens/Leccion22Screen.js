import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../theme';
import { IconChevronLeft } from '../components/Icons';
import FundamentosSection from './leccion22/FundamentosSection';
import DiarioTecnicaSection from './leccion22/DiarioTecnicaSection';
import MayorCatalogoSection from './leccion22/MayorCatalogoSection';
import CasoPioneerSection from './leccion22/CasoPioneerSection';
import BalanceConceptoSection from './leccion22/BalanceConceptoSection';
import PracticaKleeneSection from './leccion22/PracticaKleeneSection';

const SECTIONS = [
  { id: 'fundamentos', label: 'Fundamentos' },
  { id: 'diario', label: 'El diario' },
  { id: 'mayor', label: 'El mayor' },
  { id: 'pioneer', label: 'Caso Pioneer' },
  { id: 'balance', label: 'Balance' },
  { id: 'practica', label: 'Práctica' },
];

export default function Leccion22Screen({ onBack, saldos, paso, onRegistrar, onReiniciar }) {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState('fundamentos');

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headRow}>
          <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
            <IconChevronLeft size={24} color={colors.texto} />
          </Pressable>
          <View style={styles.titleCol}>
            <Text style={styles.eyebrow}>CAPÍTULO 2 · CLASE 2.2</Text>
            <Text style={styles.title}>Analizar y registrar transacciones</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRow}
        >
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSection(s.id)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.body}>
        {section === 'fundamentos' && <FundamentosSection />}
        {section === 'diario' && <DiarioTecnicaSection />}
        {section === 'mayor' && <MayorCatalogoSection />}
        {section === 'pioneer' && <CasoPioneerSection />}
        {section === 'balance' && <BalanceConceptoSection onGoToPractica={() => setSection('practica')} />}
        {section === 'practica' && (
          <PracticaKleeneSection saldos={saldos} paso={paso} onRegistrar={onRegistrar} onReiniciar={onReiniciar} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    marginBottom: 12,
  },
  backBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: colors.green,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: colors.texto,
    marginTop: 1,
  },
  pillScroll: {
    flexGrow: 0,
  },
  pillRow: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: colors.neutralBg,
  },
  pillActive: {
    backgroundColor: colors.green,
  },
  pillText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: colors.textoSuave,
  },
  pillTextActive: {
    color: '#fff',
  },
  body: {
    flex: 1,
  },
});
