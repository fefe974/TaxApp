import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { IconMenu } from './Icons';

export default function Header({ onMenuPress, showEquation, activos, pasivos, capital }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
      <View style={styles.row}>
        <Pressable onPress={onMenuPress} style={styles.menuBtn} hitSlop={8}>
          <IconMenu size={22} color={colors.texto} />
        </Pressable>
        <View style={styles.logo}>
          <Text style={styles.logoText}>LM</Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.title}>Libro Mayor</Text>
          <Text style={styles.subtitle}>Sistema de información contable</Text>
        </View>
        <Text style={styles.folio}>FOLIO 2.1</Text>
      </View>

      {showEquation && (
        <View style={styles.ecuacion}>
          <View style={styles.celda}>
            <Text style={styles.etiqueta}>ACTIVOS</Text>
            <Text style={styles.cifra}>{activos}</Text>
          </View>
          <Text style={styles.signo}>=</Text>
          <View style={styles.celda}>
            <Text style={styles.etiqueta}>PASIVOS</Text>
            <Text style={styles.cifra}>{pasivos}</Text>
          </View>
          <Text style={styles.signo}>+</Text>
          <View style={styles.celda}>
            <Text style={styles.etiqueta}>CAPITAL</Text>
            <Text style={styles.cifra}>{capital}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  menuBtn: {
    marginRight: -2,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 15,
    color: '#fff',
  },
  titleCol: {
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.texto,
  },
  subtitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textoSuave,
  },
  folio: {
    marginLeft: 'auto',
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textoFaint,
    backgroundColor: colors.neutralBg,
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 9,
    overflow: 'hidden',
  },
  ecuacion: {
    marginTop: 16,
    backgroundColor: '#F7F9F8',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  celda: {
    alignItems: 'center',
    flex: 1,
  },
  etiqueta: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textoSuave,
  },
  cifra: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 15,
    color: colors.texto,
    marginTop: 2,
  },
  signo: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.green,
    paddingHorizontal: 2,
  },
});
