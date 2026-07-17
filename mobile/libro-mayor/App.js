import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { colors, fontAssets } from './theme';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Drawer from './components/Drawer';
import HomeScreen from './screens/HomeScreen';
import LibroScreen from './screens/LibroScreen';
import ReglasScreen from './screens/ReglasScreen';
import DiarioScreen from './screens/DiarioScreen';
import EstadosScreen from './screens/EstadosScreen';
import { SALDOS_INICIALES, TRANS, fmt, computeChapters } from './data';

export default function LibroMayorApp() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [tab, setTab] = useState('home');
  const [saldos, setSaldos] = useState(SALDOS_INICIALES);
  const [paso, setPaso] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openChap, setOpenChap] = useState(1);

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
  }, []);

  const reiniciar = useCallback(() => {
    setSaldos(SALDOS_INICIALES);
    setPaso(0);
  }, []);

  const navigateToLibro = useCallback(() => {
    setTab('libro');
    setMenuOpen(false);
  }, []);

  const toggleChapter = useCallback((index) => {
    setOpenChap((prev) => (prev === index ? -1 : index));
  }, []);

  const pct = Math.round((paso / TRANS.length) * 100);
  const chapters = useMemo(() => computeChapters(pct), [pct]);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  const activos = saldos.ef + saldos.cc + saldos.eq;
  const pasivos = saldos.np + saldos.cp;
  const capital = saldos.cs + saldos.ur;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <Header
          onMenuPress={() => setMenuOpen(true)}
          showEquation={tab !== 'home'}
          activos={fmt(activos)}
          pasivos={fmt(pasivos)}
          capital={fmt(capital)}
        />
        <View style={styles.screenArea}>
          {tab === 'home' && (
            <HomeScreen
              chapters={chapters}
              openChap={openChap}
              onToggleChapter={toggleChapter}
              onClassPress={navigateToLibro}
              pct={pct}
            />
          )}
          {tab === 'libro' && <LibroScreen />}
          {tab === 'reglas' && <ReglasScreen />}
          {tab === 'diario' && (
            <DiarioScreen saldos={saldos} paso={paso} onRegistrar={registrar} onReiniciar={reiniciar} />
          )}
          {tab === 'estados' && <EstadosScreen />}
        </View>
        <TabBar active={tab} onChange={setTab} />

        <Drawer
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          chapters={chapters}
          onNavigateToLibro={navigateToLibro}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screenArea: {
    flex: 1,
  },
});
