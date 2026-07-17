import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { PaperCard } from '../components/Card';
import { Ojal, Titulo, TituloEm, Intro } from '../components/Typography';
import { CUENTAS } from '../data';

function FichaCuenta({ cuenta, active, onPress }) {
  const pillColor = cuenta.saldo === 'deudor' ? colors.debe : colors.haber;
  const pillBg = cuenta.saldo === 'deudor' ? 'rgba(149,53,39,.1)' : 'rgba(28,107,72,.1)';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ficha,
        active && styles.fichaActiva,
        pressed && { transform: [{ scale: 0.97 }] },
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
  const saldoColor = cuenta.saldo === 'deudor' ? colors.debe : colors.haber;
  return (
    <View>
      <Text style={styles.cabeza}>{cuenta.n}</Text>
      <View style={styles.cuerpo}>
        <View style={[styles.lado, styles.ladoIzq]}>
          <Text style={styles.ladoTitulo}>DEBE · CARGO</Text>
          <View style={[styles.masMenos, subeCargo ? styles.sube : styles.baja]}>
            <Text style={[styles.masMenosTexto, { color: subeCargo ? colors.haber : colors.debe }]}>
              {subeCargo ? '+' : '−'}
            </Text>
          </View>
        </View>
        <View style={styles.lado}>
          <Text style={styles.ladoTitulo}>HABER · ABONO</Text>
          <View style={[styles.masMenos, subeCargo ? styles.baja : styles.sube]}>
            <Text style={[styles.masMenosTexto, { color: subeCargo ? colors.debe : colors.haber }]}>
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
      <Ojal>ECUACIÓN AMPLIADA · ILUSTRACIONES 2.2 – 2.3</Ojal>
      <Titulo>
        Reglas de cargo <TituloEm>y abono</TituloEm>
      </Titulo>
      <Intro>Toca una cuenta para abrir su cuenta T y ver cómo aumenta, disminuye y cuál es su saldo normal.</Intro>

      <View style={styles.fichas}>
        {CUENTAS.map((c, i) => (
          <FichaCuenta key={c.n} cuenta={c} active={i === selected} onPress={() => setSelected(i)} />
        ))}
      </View>

      <PaperCard>
        <CuentaT cuenta={CUENTAS[selected]} />
      </PaperCard>
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
    gap: 10,
    marginBottom: 17,
  },
  ficha: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  fichaActiva: {
    borderColor: colors.laton,
    borderWidth: 1.5,
  },
  fichaNombre: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.texto,
  },
  fichaSaldo: {
    fontFamily: fonts.monoMedium,
    fontSize: 9.5,
    letterSpacing: 0.8,
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    borderRadius: 99,
    overflow: 'hidden',
  },
  cabeza: {
    textAlign: 'center',
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.texto,
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.texto,
  },
  cuerpo: {
    flexDirection: 'row',
    minHeight: 132,
  },
  lado: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
  },
  ladoIzq: {
    borderRightWidth: 2.5,
    borderRightColor: colors.texto,
  },
  ladoTitulo: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.textoSuave,
    marginBottom: 10,
  },
  masMenos: {
    width: 57,
    height: 57,
    borderRadius: 28.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masMenosTexto: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 38,
  },
  sube: {
    backgroundColor: 'rgba(28,107,72,.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(28,107,72,.35)',
  },
  baja: {
    backgroundColor: 'rgba(149,53,39,.09)',
    borderWidth: 1.5,
    borderColor: 'rgba(149,53,39,.4)',
    borderStyle: 'dashed',
  },
  pie: {
    marginTop: 3,
    paddingTop: 11,
    textAlign: 'center',
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textoSuave,
  },
  pieB: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
  },
});
