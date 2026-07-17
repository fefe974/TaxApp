import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import { Eyebrow, Titulo, Intro, NotaPie, NotaPieB } from '../../components/Typography';
import JournalEntryTable from '../../components/JournalEntryTable';
import { JOURNALIZING_EXAMPLE } from '../../data';

const REGLAS = [
  'La fecha se anota una sola vez por asiento, en la primera línea.',
  'Los Debits siempre se escriben primero, alineados a la izquierda.',
  'Los Credits van después, con una sangría — nunca se confunden visualmente con los Debits.',
  'Una breve explicación entre paréntesis, en cursiva, resume la operación.',
  'La columna Ref. remite al número de cuenta en el Chart of Accounts.',
];

export default function DiarioTecnicaSection() {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ilustración 2.8</Eyebrow>
      <Titulo>El General Journal</Titulo>
      <Intro>
        El General Journal es el libro de entrada original: muestra el efecto completo de una transacción en un
        solo lugar. La técnica de registro (Journalizing) sigue siempre el mismo formato.
      </Intro>

      <View style={styles.reglas}>
        {REGLAS.map((r, i) => (
          <View key={i} style={styles.reglaRow}>
            <View style={styles.reglaDot} />
            <Text style={styles.reglaTexto}>{r}</Text>
          </View>
        ))}
      </View>

      <Eyebrow style={{ marginTop: 22 }}>Técnica de journalizing, en la práctica</Eyebrow>
      <JournalEntryTable entries={JOURNALIZING_EXAMPLE.entries} showRef />

      <NotaPie>
        <NotaPieB>Ref.</NotaPieB> 101 y 311 son los números de cuenta de Cash y Common Stock en el Chart of
        Accounts — los verás completos en la siguiente sección.
      </NotaPie>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  reglas: {
    marginTop: 4,
    gap: 9,
  },
  reglaRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  reglaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.green,
    marginTop: 7,
    flexShrink: 0,
  },
  reglaTexto: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textoSuave,
  },
});
