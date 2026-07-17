import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import { Card } from '../components/Card';
import { Eyebrow, Titulo, Intro } from '../components/Typography';
import { CUENTAS } from '../data';

function FichaCuenta({ cuenta, active, onPress }) {
  const pillColor = cuenta.saldo === 'deudor' ? colors.red : colors.green;
  const pillBg = cuenta.saldo === 'deudor' ? 'rgba(178,59,46,.1)' : 'rgba(11,122,85,.1)';
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.ficha,
        { borderColor: active ? colors.green : colors.border },
        active && styles.fichaActiva,
      ]}
    >
      <Text style={styles.fichaNombre}>{cuenta.n}</Text>
      <Text style={[styles.fichaSaldo, { color: pillColor, backgroundColor: pillBg }]}>
        {cuenta.saldo.toUpperCase()}
      </Text>
    </Pressable>
  );
}

function CuentaT({ cuenta }) {
  const subeCargo = cuenta.sube === 'cargo';
  const saldoColor = cuenta.saldo === 'deudor' ? colors.red : colors.green;
  return (
    <View>
      <Text style={styles.cabeza}>{cuenta.n}</Text>
      <View style={styles.cuerpo}>
        <View style={[styles.lado, styles.ladoIzq]}>
          <Text style={styles.ladoTitulo}>DEBE · CARGO</Text>
          <View style={[styles.masMenos, subeCargo ? styles.sube : styles.baja]}>
            <Text style={[styles.masMenosTexto, { color: subeCargo ? colors.green : colors.red }]}>
              {subeCargo ? '+' : '−'}
            </Text>
          </View>
        </View>
        <View style={styles.lado}>
          <Text style={styles.ladoTitulo}>HABER · ABONO</Text>
          <View style={[styles.masMenos, subeCargo ? styles.baja : styles.sube]}>
            <Text style={[styles.masMenosTexto, { color: subeCargo ? colors.red : colors.green }]}>
              {subeCargo ? '−' : '+'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.pie}>
        Saldo normal ·{' '}
        <Text style={[styles.pieB, { color: saldoColor }]}>
          {cuenta.saldo === 'deudor' ? 'DEUDOR (CARGO)' : 'ACREEDOR (ABONO)'}
        </Text>
      </Text>
    </View>
  );
}

export default function ReglasScreen() {
  const [selected, setSelected] = useState(0);

  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ecuación ampliada · 2.2 – 2.3</Eyebrow>
      <Titulo>Reglas de cargo y abono</Titulo>
      <Intro>Toca una cuenta para abrir su cuenta T y ver cómo aumenta, disminuye y cuál es su saldo normal.</Intro>

      <View style={styles.fichas}>
        {CUENTAS.map((c, i) => (
          <FichaCuenta key={c.n} cuenta={c} active={i === selected} onPress={() => setSelected(i)} />
        ))}
      </View>

      <Card style={styles.tCard}>
        <CuentaT cuenta={CUENTAS[selected]} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  fichas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginVertical: 16,
  },
  ficha: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 11,
    paddingHorizontal: 12,
  },
  fichaActiva: {
    borderWidth: 1.5,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 2.5,
  },
  fichaNombre: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.texto,
  },
  fichaSaldo: {
    fontFamily: fonts.monoMedium,
    fontSize: 9.5,
    letterSpacing: 0.5,
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 99,
    overflow: 'hidden',
  },
  tCard: {
    padding: 18,
    paddingHorizontal: 16,
  },
  cabeza: {
    textAlign: 'center',
    fontFamily: fonts.sansBold,
    fontSize: 19,
    letterSpacing: -0.2,
    color: colors.texto,
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.texto,
  },
  cuerpo: {
    flexDirection: 'row',
    minHeight: 130,
  },
  lado: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  ladoIzq: {
    borderRightWidth: 2.5,
    borderRightColor: colors.texto,
  },
  ladoTitulo: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.textoSuave,
    marginBottom: 12,
  },
  masMenos: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masMenosTexto: {
    fontFamily: fonts.mono,
    fontSize: 34,
    lineHeight: 38,
  },
  sube: {
    backgroundColor: 'rgba(11,122,85,.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(11,122,85,.35)',
  },
  baja: {
    backgroundColor: 'rgba(178,59,46,.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(178,59,46,.4)',
    borderStyle: 'dashed',
  },
  pie: {
    paddingTop: 12,
    textAlign: 'center',
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textoSuave,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pieB: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
