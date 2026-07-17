import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Eyebrow, Titulo, Intro } from '../../components/Typography';
import { CHART_OF_ACCOUNTS } from '../../data';

const DEBIT_NORMAL = new Set(['100s']);

function CategoriaCard({ group }) {
  const isDebit = DEBIT_NORMAL.has(group.range);
  const accent = isDebit ? colors.red : colors.green;
  const accentBg = isDebit ? 'rgba(178,59,46,.1)' : 'rgba(11,122,85,.1)';
  return (
    <Card style={styles.grupo}>
      <View style={styles.grupoHead}>
        <View style={[styles.rangoBadge, { backgroundColor: accentBg }]}>
          <Text style={[styles.rangoText, { color: accent }]}>{group.range}</Text>
        </View>
        <View>
          <Text style={styles.categoria}>{group.category}</Text>
          <Text style={styles.categoriaEn}>{group.categoryEn}</Text>
        </View>
      </View>
      <View style={styles.cuentas}>
        {group.accounts.map((a) => (
          <View key={a.code} style={styles.cuentaRow}>
            <Text style={styles.codigo}>{a.code}</Text>
            <Text style={styles.nombre}>{a.name}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function MayorCatalogoSection() {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ilustraciones 2.9 – 2.10</Eyebrow>
      <Titulo>El Ledger y el Chart of Accounts</Titulo>
      <Intro>
        El General Ledger contiene todas las cuentas de Assets, Liabilities y Stockholders&apos; Equity. Para
        organizarlas, la empresa utiliza un Chart of Accounts: una lista numerada donde cada bloque de cien
        números agrupa un tipo de cuenta.
      </Intro>

      <View style={styles.grupos}>
        {CHART_OF_ACCOUNTS.map((g) => (
          <CategoriaCard key={g.range} group={g} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  grupos: {
    marginTop: 16,
    gap: 11,
  },
  grupo: {
    padding: 15,
    paddingHorizontal: 16,
  },
  grupoHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 11,
  },
  rangoBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rangoText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
  },
  categoria: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
    color: colors.texto,
  },
  categoriaEn: {
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    color: colors.textoFaint,
  },
  cuentas: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 9,
    gap: 7,
  },
  cuentaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  codigo: {
    width: 34,
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.textoFaint,
  },
  nombre: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.texto,
  },
});
