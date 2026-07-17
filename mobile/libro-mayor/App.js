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
import Leccion22Screen from './screens/Leccion22Screen';
import { SALDOS_INICIALES, TRANS, KLEENE_SALDOS_INICIALES, KLEENE_TRANS, fmt, computeChapters } from './data';

export default function LibroMayorApp() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('app'); // 'app' | 'leccion22'
  const [saldos, setSaldos] = useState(SALDOS_INICIALES);
  const [paso, setPaso] = useState(0);
  const [saldos22, setSaldos22] = useState(KLEENE_SALDOS_INICIALES);
  const [paso22, setPaso22] = useState(0);
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

  const registrar22 = useCallback((i) => {
    const t = KLEENE_TRANS[i];
    setSaldos22((prev) => {
      const next = { ...prev };
      t.lines.forEach((line) => {
        next[line.account] += line.side === 'debit' ? line.amount : -line.amount;
      });
      return next;
    });
    setPaso22((p) => p + 1);
  }, []);

  const reiniciar22 = useCallback(() => {
    setSaldos22(KLEENE_SALDOS_INICIALES);
    setPaso22(0);
  }, []);

  const navigate = useCallback((target) => {
    setMenuOpen(false);
    if (target === 'leccion22') {
      setScreen('leccion22');
    } else {
      setScreen('app');
      setTab(target);
    }
  }, []);

  const toggleChapter = useCallback((index) => {
    setOpenChap((prev) => (prev === index ? -1 : index));
  }, []);

  const pctLibro = Math.round((paso / TRANS.length) * 100);
  const pctLeccion22 = Math.round((paso22 / KLEENE_TRANS.length) * 100);
  const progress = useMemo(() => ({ libro: pctLibro, leccion22: pctLeccion22 }), [pctLibro, pctLeccion22]);
  const chapters = useMemo(() => computeChapters(progress), [progress]);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  if (screen === 'leccion22') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Leccion22Screen
          onBack={() => setScreen('app')}
          saldos={saldos22}
          paso={paso22}
          onRegistrar={registrar22}
          onReiniciar={reiniciar22}
        />
      </SafeAreaProvider>
    );
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
              onNavigate={navigate}
              pct={pctLibro}
            />
          )}
          {tab === 'libro' && <LibroScreen />}
          {tab === 'reglas' && <ReglasScreen />}
          {tab === 'diario' && (
            <DiarioScreen saldos={saldos} paso={paso} onRegistrar={registrar} onReiniciar={reiniciar} />
          )}
          {tab === 'estados' && <EstadosScreen />}
        </View>
        <TabBar active={tab} onChange={(t) => navigate(t)} />

        <Drawer visible={menuOpen} onClose={() => setMenuOpen(false)} chapters={chapters} onNavigate={navigate} />
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
