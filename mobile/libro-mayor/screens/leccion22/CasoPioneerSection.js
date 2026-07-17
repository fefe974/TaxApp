import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../../theme';
import { Card } from '../../components/Card';
import { Eyebrow, Titulo, Intro } from '../../components/Typography';
import { IconChevronDown } from '../../components/Icons';
import JournalEntryTable from '../../components/JournalEntryTable';
import { PIONEER_TRANS } from '../../data';

function AnalysisRow({ item }) {
  if (item.amount === 0) {
    return (
      <View style={styles.analysisRow}>
        <Text style={styles.analysisNoEffect}>{item.account}</Text>
      </View>
    );
  }
  const up = item.change === 'aumenta';
  return (
    <View style={styles.analysisRow}>
      <Text style={[styles.analysisArrow, { color: up ? colors.green : colors.red }]}>{up ? '▲' : '▼'}</Text>
      <Text style={styles.analysisAccount}>{item.account}</Text>
      <Text style={styles.analysisKind}>{item.kind}</Text>
      <Text style={[styles.analysisAmount, { color: up ? colors.green : colors.red }]}>
        ${item.amount.toLocaleString('en-US')}
      </Text>
    </View>
  );
}

function TransaccionCard({ t, expanded, onToggle }) {
  return (
    <Card style={styles.card}>
      <Pressable style={styles.head} onPress={onToggle}>
        <View style={styles.headTextCol}>
          <Text style={styles.ill}>{t.ill.toUpperCase()}</Text>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.desc}>{t.desc}</Text>
        </View>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <IconChevronDown size={18} color={colors.textoFaint} />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.bodyWrap}>
          <Text style={styles.sectionLabel}>BASIC ANALYSIS</Text>
          <View style={styles.analysisList}>
            {t.analysis.map((a, i) => (
              <AnalysisRow key={i} item={a} />
            ))}
          </View>

          {t.noEntry ? (
            <View style={styles.noEntry}>
              <Text style={styles.noEntryText}>Sin intercambio de valor → no se registra Journal Entry.</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>JOURNAL ENTRY</Text>
              <JournalEntryTable entries={[{ lines: t.lines }]} />
            </>
          )}
        </View>
      )}
    </Card>
  );
}

export default function CasoPioneerSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ilustraciones 2.11 – 2.20</Eyebrow>
      <Titulo>Pioneer Advertising, paso a paso</Titulo>
      <Intro>
        A lo largo de octubre, Pioneer Advertising registra diez operaciones. Cada una sigue el mismo flujo:
        Basic Analysis → Journal Entry. Toca una operación para ver su análisis completo.
      </Intro>

      <View style={styles.lista}>
        {PIONEER_TRANS.map((t, i) => (
          <TransaccionCard
            key={t.ill}
            t={t}
            expanded={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </View>

      <View style={styles.cierre}>
        <Text style={styles.cierreTexto}>
          Estas diez operaciones se resumen primero en el General Journal (Ilustración 2.21) y luego se trasladan
          al General Ledger (Ilustración 2.22), calculando el saldo final de cada cuenta — el mismo flujo que
          practicarás tú mismo en la sección Práctica.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  lista: {
    marginTop: 16,
    gap: 10,
  },
  card: {
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    paddingHorizontal: 15,
  },
  headTextCol: {
    flex: 1,
    minWidth: 0,
  },
  ill: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.green,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
    color: colors.texto,
    marginTop: 2,
  },
  desc: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textoSuave,
    marginTop: 2,
  },
  bodyWrap: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  sectionLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.textoFaint,
    marginBottom: 8,
  },
  analysisList: {
    gap: 6,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisArrow: {
    fontSize: 9,
  },
  analysisAccount: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: colors.texto,
  },
  analysisKind: {
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    color: colors.textoFaint,
  },
  analysisAmount: {
    fontFamily: fonts.mono,
    fontSize: 12,
    minWidth: 66,
    textAlign: 'right',
  },
  analysisNoEffect: {
    fontFamily: fonts.sans,
    fontStyle: 'italic',
    fontSize: 12.5,
    color: colors.textoFaint,
  },
  noEntry: {
    backgroundColor: colors.neutralBg,
    borderRadius: radius.sm,
    padding: 11,
  },
  noEntryText: {
    fontFamily: fonts.sans,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textoSuave,
  },
  cierre: {
    marginTop: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.green,
    paddingLeft: 12,
  },
  cierreTexto: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textoSuave,
  },
});
