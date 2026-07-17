import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Eyebrow, Titulo, Intro } from '../../components/Typography';
import { IconCheck, IconX } from '../../components/Icons';

const STEPS = [
  {
    title: 'Analyze transaction',
    subtitle: 'Analizar',
    desc: 'Se evalúa el documento fuente (por ejemplo, una Invoice o un recibo) para determinar qué cuentas se ven afectadas y de qué forma.',
  },
  {
    title: 'Enter transaction',
    subtitle: 'Registrar',
    desc: 'La operación se registra cronológicamente en el General Journal: es el libro de entrada original.',
  },
  {
    title: 'Transfer to ledger',
    subtitle: 'Trasladar',
    desc: 'La información del Journal se traslada (posting) a las cuentas individuales del General Ledger.',
  },
];

function Criterio({ ok, label, example }) {
  return (
    <View style={styles.criterioRow}>
      <View style={[styles.criterioIcono, ok ? styles.criterioOk : styles.criterioNo]}>
        {ok ? <IconCheck size={15} color={colors.green} /> : <IconX size={15} color={colors.red} />}
      </View>
      <View style={styles.criterioTexto}>
        <Text style={[styles.criterioLabel, { color: ok ? colors.green : colors.red }]}>{label}</Text>
        <Text style={styles.criterioEjemplo}>{example}</Text>
      </View>
    </View>
  );
}

export default function FundamentosSection() {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ilustración 2.6</Eyebrow>
      <Titulo>¿Se debe registrar la transacción?</Titulo>
      <Intro>
        Las transactions son eventos económicos que requieren registrarse en el sistema contable. Pueden ser
        externas (con terceros) o internas. El criterio para decidir si un evento se registra es siempre el mismo.
      </Intro>

      <Card style={styles.pregunta}>
        <Text style={styles.preguntaTexto}>
          ¿Cambia la posición financiera de la empresa — sus <Text style={styles.preguntaBold}>Assets</Text>,{' '}
          <Text style={styles.preguntaBold}>Liabilities</Text> o{' '}
          <Text style={styles.preguntaBold}>Stockholders&apos; Equity</Text>?
        </Text>
      </Card>

      <View style={styles.criterios}>
        <Criterio ok label="SÍ — SE REGISTRA" example="Ej. pagar renta, comprar equipo" />
        <Criterio ok={false} label="NO — NO SE REGISTRA" example="Ej. discutir un contrato sin intercambio de valor" />
      </View>

      <Eyebrow style={{ marginTop: 26 }}>Ilustración 2.7</Eyebrow>
      <Titulo>El proceso de registro</Titulo>
      <Intro>El registro contable sigue siempre la misma secuencia lógica de tres pasos.</Intro>

      <View style={styles.pasos}>
        {STEPS.map((s, i) => (
          <View key={s.title} style={styles.paso}>
            <View style={styles.pasoIzq}>
              <View style={styles.pasoNum}>
                <Text style={styles.pasoNumText}>{i + 1}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={styles.pasoLinea} />}
            </View>
            <Card style={styles.pasoCard}>
              <Text style={styles.pasoTitle}>{s.title}</Text>
              <Text style={styles.pasoSubtitle}>{s.subtitle.toUpperCase()}</Text>
              <Text style={styles.pasoDesc}>{s.desc}</Text>
            </Card>
          </View>
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
  pregunta: {
    marginTop: 16,
    padding: 18,
    backgroundColor: colors.texto,
    borderColor: colors.texto,
  },
  preguntaTexto: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.surface,
  },
  preguntaBold: {
    fontFamily: fonts.sansBold,
    color: colors.gold,
  },
  criterios: {
    marginTop: 10,
    gap: 8,
  },
  criterioRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 12,
    paddingHorizontal: 13,
  },
  criterioIcono: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterioOk: {
    backgroundColor: colors.greenLight,
  },
  criterioNo: {
    backgroundColor: 'rgba(178,59,46,.1)',
  },
  criterioTexto: {
    flex: 1,
  },
  criterioLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.5,
  },
  criterioEjemplo: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textoSuave,
    marginTop: 1,
  },
  pasos: {
    marginTop: 4,
  },
  paso: {
    flexDirection: 'row',
    gap: 13,
  },
  pasoIzq: {
    alignItems: 'center',
    width: 30,
  },
  pasoNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasoNumText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: '#fff',
  },
  pasoLinea: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  pasoCard: {
    flex: 1,
    padding: 14,
    marginBottom: 14,
  },
  pasoTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: colors.texto,
  },
  pasoSubtitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.green,
    marginTop: 1,
    marginBottom: 5,
  },
  pasoDesc: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18.5,
    color: colors.textoSuave,
  },
});
