import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Eyebrow, Titulo, Intro } from '../../components/Typography';
import { IconArrowRight } from '../../components/Icons';

export default function BalanceConceptoSection({ onGoToPractica }) {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ilustración 2.23</Eyebrow>
      <Titulo>El Trial Balance</Titulo>
      <Intro>
        El Trial Balance es una lista de todas las cuentas del Ledger y sus saldos en un momento determinado. Su
        propósito principal es probar la igualdad matemática entre los Debits y los Credits después de hacer el
        posting.
      </Intro>

      <Card style={styles.equationCard}>
        <View style={styles.equationSide}>
          <Text style={styles.equationLabel}>SUMA DE TODOS{'\n'}LOS DEBITS</Text>
          <View style={styles.equationBar} />
        </View>
        <Text style={styles.equationSign}>=</Text>
        <View style={styles.equationSide}>
          <Text style={styles.equationLabel}>SUMA DE TODOS{'\n'}LOS CREDITS</Text>
          <View style={styles.equationBar} />
        </View>
      </Card>

      <View style={styles.notas}>
        <Text style={styles.nota}>
          • Si los totales no coinciden, hay un error de registro o de posting que debe corregirse antes de seguir
          adelante.
        </Text>
        <Text style={styles.nota}>
          • Un Trial Balance cuadrado no garantiza que no haya errores — solo confirma que Debits y Credits están
          en equilibrio.
        </Text>
        <Text style={styles.nota}>
          • Es el paso previo indispensable para preparar los estados financieros.
        </Text>
      </View>

      <Pressable style={styles.cta} onPress={onGoToPractica}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Verlo en acción</Text>
          <Text style={styles.ctaDesc}>Arma el Trial Balance real de Kleene Window Washing en la práctica.</Text>
        </View>
        <IconArrowRight size={18} color={colors.green} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  equationCard: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
    paddingHorizontal: 16,
  },
  equationSide: {
    flex: 1,
    alignItems: 'center',
  },
  equationLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textAlign: 'center',
    lineHeight: 14,
    color: colors.textoSuave,
  },
  equationBar: {
    marginTop: 10,
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.green,
  },
  equationSign: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    color: colors.green,
  },
  notas: {
    marginTop: 16,
    gap: 8,
  },
  nota: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textoSuave,
  },
  cta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.greenLight,
    borderRadius: 16,
    padding: 16,
  },
  ctaTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.texto,
  },
  ctaDesc: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textoSuave,
    marginTop: 2,
  },
});
