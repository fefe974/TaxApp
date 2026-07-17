import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing } from '../theme';
import { PaperCard } from '../components/Card';
import { Ojal, Titulo, TituloEm, Intro, NotaPie, NotaPieB } from '../components/Typography';
import { IconCostoEfectividad, IconUtilidad, IconFlexibilidad } from '../components/Icons';

const PRINCIPIOS = [
  {
    Icon: IconCostoEfectividad,
    title: 'Costo-efectividad',
    text: 'El sistema es rentable cuando los beneficios de la información superan el costo de proporcionarla.',
  },
  {
    Icon: IconUtilidad,
    title: 'Utilidad',
    text: 'La información de salida debe ser comprensible, relevante, confiable, oportuna y precisa.',
  },
  {
    Icon: IconFlexibilidad,
    title: 'Flexibilidad',
    text: 'Capacidad de adaptarse a necesidades futuras: crecimiento, regulación y avances tecnológicos.',
  },
];

function PrincipioCard({ Icon, title, text }) {
  return (
    <View style={styles.principio}>
      <LinearGradient
        colors={[colors.libro, colors.libro2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.icono}
      >
        <Icon size={19} color={colors.latonClaro} />
      </LinearGradient>
      <View style={styles.principioTexto}>
        <Text style={styles.principioTitulo}>{title}</Text>
        <Text style={styles.principioDesc}>{text}</Text>
      </View>
    </View>
  );
}

export default function LibroScreen() {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Ojal>ILUSTRACIONES 2.1 – 2.3</Ojal>
      <Titulo>
        La partida doble, <TituloEm>siempre en equilibrio</TituloEm>
      </Titulo>
      <Intro>Por cada cargo debe existir un abono. La ecuación fundamental nunca pierde su igualdad.</Intro>

      <PaperCard>
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
      </PaperCard>

      <Ojal style={{ marginTop: 26 }}>PRINCIPIOS DEL SISTEMA · ILUSTRACIÓN 2.1</Ojal>
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
    paddingTop: spacing.xl,
    paddingBottom: 30,
  },
  eqHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 11,
    paddingVertical: 8,
  },
  termino: {
    alignItems: 'center',
  },
  terminoB: {
    fontFamily: fonts.serif,
    fontSize: 32,
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
    fontFamily: fonts.serif,
    fontSize: 27,
    color: colors.laton,
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
    gap: 11,
    marginTop: 15,
  },
  principio: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 15,
  },
  icono: {
    width: 41,
    height: 41,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principioTexto: {
    flex: 1,
  },
  principioTitulo: {
    fontFamily: fonts.sansBold,
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
