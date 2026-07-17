import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { CornerBracket } from './Icons';

export default function Header({ activos, pasivos, capital, pulseKey }) {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulseKey === 0) return;
    pulse.setValue(1);
    Animated.timing(pulse, {
      toValue: 0,
      duration: 550,
      useNativeDriver: false,
    }).start();
  }, [pulseKey]);

  const cifraColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.papel, colors.latonClaro],
  });

  return (
    <LinearGradient
      colors={[colors.libro, colors.libro2, colors.libro]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 18 }]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.herrajeI} pointerEvents="none">
        <CornerBracket size={20} />
      </View>
      <View style={styles.herrajeD} pointerEvents="none">
        <CornerBracket size={20} mirrored />
      </View>

      <View style={styles.marca}>
        <Text style={styles.h1}>
          Libro <Text style={styles.h1Italic}>Mayor</Text>
        </Text>
        <Text style={styles.folio}>FOLIO 2.1</Text>
      </View>
      <Text style={styles.subtitulo}>SISTEMA DE INFORMACIÓN CONTABLE</Text>

      <View style={styles.ecuacion}>
        <View style={styles.celda}>
          <Text style={styles.etiqueta}>ACTIVOS</Text>
          <Animated.Text style={[styles.cifra, { color: cifraColor }]}>{activos}</Animated.Text>
        </View>
        <Text style={styles.signo}>=</Text>
        <View style={styles.celda}>
          <Text style={styles.etiqueta}>PASIVOS</Text>
          <Animated.Text style={[styles.cifra, { color: cifraColor }]}>{pasivos}</Animated.Text>
        </View>
        <Text style={styles.signo}>+</Text>
        <View style={styles.celda}>
          <Text style={styles.etiqueta}>CAPITAL</Text>
          <Animated.Text style={[styles.cifra, { color: cifraColor }]}>{capital}</Animated.Text>
        </View>
      </View>

      <LinearGradient
        pointerEvents="none"
        colors={['transparent', colors.latonClaro, colors.latonClaro, 'transparent']}
        locations={[0, 0.2, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomHairline}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  herrajeI: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  herrajeD: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  h1: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.latonClaro,
  },
  h1Italic: {
    fontFamily: fonts.serifItalic,
    color: colors.latonClaro,
  },
  folio: {
    marginLeft: 'auto',
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: 'rgba(246,242,231,.55)',
  },
  subtitulo: {
    marginTop: 4,
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    letterSpacing: 1.6,
    color: 'rgba(246,242,231,.6)',
  },
  ecuacion: {
    marginTop: 17,
    backgroundColor: 'rgba(9,18,13,.42)',
    borderWidth: 1,
    borderColor: 'rgba(221,178,85,.32)',
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
    letterSpacing: 1.2,
    color: 'rgba(246,242,231,.55)',
  },
  cifra: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 15,
    marginTop: 2,
  },
  signo: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.latonClaro,
    paddingHorizontal: 2,
  },
  bottomHairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    opacity: 0.9,
  },
});
