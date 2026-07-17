import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { Card } from '../components/Card';
import { Eyebrow, Titulo, Intro, NotaPie, NotaPieB } from '../components/Typography';
import { IconCostoEfectividad, IconUtilidad, IconFlexibilidad } from '../components/Icons';

const PRINCIPIOS = [
  {
    Icon: IconCostoEfectividad,
    title: 'Costo-efectividad',
    text: 'Los beneficios de la información deben superar el costo de producirla.',
  },
  {
    Icon: IconUtilidad,
    title: 'Utilidad',
    text: 'Información comprensible, relevante, confiable, oportuna y precisa.',
  },
  {
    Icon: IconFlexibilidad,
    title: 'Flexibilidad',
    text: 'Se adapta al crecimiento, la regulación y la tecnología futura.',
  },
];

function PrincipioCard({ Icon, title, text }) {
  return (
    <Card style={styles.principio}>
      <View style={styles.icono}>
        <Icon size={18} color={colors.green} />
      </View>
      <View style={styles.principioTexto}>
        <Text style={styles.principioTitulo}>{title}</Text>
        <Text style={styles.principioDesc}>{text}</Text>
      </View>
    </Card>
  );
}

export default function LibroScreen() {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ilustraciones 2.1 – 2.3</Eyebrow>
      <Titulo>La partida doble, siempre en equilibrio</Titulo>
      <Intro>Por cada cargo existe un abono. La ecuación fundamental nunca pierde su igualdad.</Intro>

      <Card style={styles.eqCard}>
        <View style={styles.eqHero}>
          <View style={styles.termino}>
            <Text style={styles.terminoB}>Activos</Text>
            <Text style={styles.terminoSpan}>DEUDOR</Text>
          </View>
          <Text style={styles.op}>=</Text>
          <View style={styles.termino}>
            <Text style={styles.terminoB}>Pasivos</Text>
            <Text style={styles.terminoSpan}>ACREEDOR</Text>
          </View>
          <Text style={styles.op}>+</Text>
          <View style={styles.termino}>
            <Text style={styles.terminoB}>Capital</Text>
            <Text style={styles.terminoSpan}>ACREEDOR</Text>
          </View>
        </View>
        <View style={styles.dobleRegla} />
      </Card>

      <Eyebrow style={{ marginTop: 24, marginBottom: 10 }}>Principios del sistema</Eyebrow>
      <View style={styles.principios}>
        {PRINCIPIOS.map((p) => (
          <PrincipioCard key={p.title} {...p} />
        ))}
      </View>

      <NotaPie>
        <NotaPieB>Capital contable</NotaPieB> = Capital social + Utilidades retenidas − Dividendos + Ingresos −
        Gastos.
      </NotaPie>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  eqCard: {
    marginTop: 18,
    padding: 22,
    paddingHorizontal: 16,
  },
  eqHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 13,
  },
  termino: {
    alignItems: 'center',
  },
  terminoB: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    letterSpacing: -0.3,
    color: colors.texto,
  },
  terminoSpan: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: colors.textoSuave,
    marginTop: 2,
  },
  op: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 20,
    color: colors.green,
  },
  dobleRegla: {
    marginTop: 16,
    height: 4,
    borderTopWidth: 2.5,
    borderTopColor: colors.texto,
    borderBottomWidth: 1,
    borderBottomColor: colors.texto,
  },
  principios: {
    gap: 10,
  },
  principio: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
    padding: 15,
  },
  icono: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principioTexto: {
    flex: 1,
  },
  principioTitulo: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.texto,
    marginBottom: 2,
  },
  principioDesc: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textoSuave,
  },
});
