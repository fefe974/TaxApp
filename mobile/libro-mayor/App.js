import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { colors, fontAssets } from './theme';
import Header from './components/Header';
import TabBar from './components/TabBar';
import LibroScreen from './screens/LibroScreen';
import ReglasScreen from './screens/ReglasScreen';
import DiarioScreen from './screens/DiarioScreen';
import EstadosScreen from './screens/EstadosScreen';
import { SALDOS_INICIALES, TRANS, fmt } from './data';

export default function LibroMayorApp() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [activeTab, setActiveTab] = useState('libro');
  const [saldos, setSaldos] = useState(SALDOS_INICIALES);
  const [paso, setPaso] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  const registrar = useCallback((i) => {
    const t = TRANS[i];
    setSaldos((prev) => {
      const next = { ...prev };
      Object.entries(t.mov).forEach(([k, v]) => {
        next[k] += v;
      });
      return next;
    });
    setPaso((p) => p + 1);
    setPulseKey((k) => k + 1);
  }, []);

  const reiniciar = useCallback(() => {
    setSaldos(SALDOS_INICIALES);
    setPaso(0);
    setPulseKey((k) => k + 1);
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  const activos = saldos.ef + saldos.cc + saldos.eq;
  const pasivos = saldos.np + saldos.cp;
  const capital = saldos.cs + saldos.ur;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        <Header activos={fmt(activos)} pasivos={fmt(pasivos)} capital={fmt(capital)} pulseKey={pulseKey} />
        <View style={styles.screenArea}>
          {activeTab === 'libro' && <LibroScreen />}
          {activeTab === 'reglas' && <ReglasScreen />}
          {activeTab === 'diario' && (
            <DiarioScreen saldos={saldos} paso={paso} onRegistrar={registrar} onReiniciar={reiniciar} />
          )}
          {activeTab === 'estados' && <EstadosScreen />}
        </View>
        <TabBar active={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.papel,
  },
  screenArea: {
    flex: 1,
  },
});
