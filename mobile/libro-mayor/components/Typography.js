import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export function Ojal({ children, style }) {
  return (
    <View style={[styles.ojalRow, style]}>
      <Text style={styles.ojalText}>{children}</Text>
      <View style={styles.ojalLine} />
    </View>
  );
}

export function Titulo({ children }) {
  return <Text style={styles.titulo}>{children}</Text>;
}

export function TituloEm({ children }) {
  return <Text style={styles.tituloEm}>{children}</Text>;
}

export function Intro({ children }) {
  return <Text style={styles.intro}>{children}</Text>;
}

export function NotaPie({ children }) {
  return (
    <View style={styles.notaPie}>
      <Text style={styles.notaPieText}>{children}</Text>
    </View>
  );
}

export function NotaPieB({ children }) {
  return <Text style={styles.notaPieB}>{children}</Text>;
}

const styles = StyleSheet.create({
  ojalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  ojalText: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: colors.latonOscuro,
  },
  ojalLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.laton,
    opacity: 0.55,
  },
  titulo: {
    fontFamily: fonts.serif,
    fontSize: 29,
    lineHeight: 32,
    color: colors.texto,
    marginBottom: 7,
  },
  tituloEm: {
    fontFamily: fonts.serifItalic,
    color: colors.libro2,
  },
  intro: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textoSuave,
    marginBottom: 19,
    maxWidth: 320,
  },
  notaPie: {
    marginTop: 17,
    borderLeftWidth: 2,
    borderLeftColor: colors.laton,
    paddingLeft: 12,
  },
  notaPieText: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.textoSuave,
  },
  notaPieB: {
    fontFamily: fonts.sansBold,
    color: colors.texto,
  },
});
