import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export function Eyebrow({ children, style }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

export function Titulo({ children }) {
  return <Text style={styles.titulo}>{children}</Text>;
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
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.green,
    marginBottom: 8,
  },
  titulo: {
    fontFamily: fonts.sansBold,
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -0.3,
    color: colors.texto,
  },
  intro: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textoSuave,
    marginTop: 7,
    maxWidth: 320,
  },
  notaPie: {
    marginTop: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.green,
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
