import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing } from '../theme';
import { Ojal, Titulo, TituloEm, Intro } from '../components/Typography';
import { TRANS, fmt, fmtMov } from '../data';

const COLS = [
  { key: 'op', label: 'Op.', width: 44, align: 'left' },
  { key: 'ef', label: 'Efectivo', width: 82 },
  { key: 'cc', label: 'Ctas. Cobrar', width: 98 },
  { key: 'eq', label: 'Equipo', width: 76 },
  { key: 'igual', label: '=', width: 26 },
  { key: 'np', label: 'Notas Pagar', width: 96 },
  { key: 'cp', label: 'Ctas. Pagar', width: 92 },
  { key: 'cs', label: 'Cap. Social', width: 92 },
  { key: 'ur', label: 'Util. Reten.', width: 98 },
];
const TABLE_WIDTH = COLS.reduce((s, c) => s + c.width, 0);

function MayorTable({ saldos, paso }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mayorScroll}>
      <View style={[styles.mayorTable, { width: TABLE_WIDTH }]}>
        <LinearGradient colors={[colors.libro, colors.libro2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mayorHeadRow}>
          {COLS.map((c) => (
            <Text
              key={c.key}
              style={[styles.mayorHeadCell, { width: c.width, textAlign: c.align || 'right' }]}
            >
              {c.label.toUpperCase()}
            </Text>
          ))}
        </LinearGradient>

        {paso === 0 && (
          <View style={styles.mayorEmptyRow}>
            <Text style={styles.mayorEmptyText}>Sin movimientos registrados</Text>
          </View>
        )}

        {TRANS.slice(0, paso).map((t, i) => (
          <MayorRow key={i} index={i} t={t} />
        ))}

        {paso > 0 && (
          <View style={styles.mayorFootRow}>
            <Text style={[styles.mayorCell, { width: COLS[0].width, textAlign: 'left', fontFamily: fonts.sansSemiBold }]}>
              Saldos
            </Text>
            {['ef', 'cc', 'eq'].map((k) => (
              <Text key={k} style={[styles.mayorCell, styles.mayorFootCell, { width: COLS.find((c) => c.key === k).width }]}>
                {fmt(saldos[k])}
              </Text>
            ))}
            <Text style={[styles.mayorCell, styles.mayorFootCell, styles.igual, { width: COLS[4].width }]}>=</Text>
            {['np', 'cp', 'cs', 'ur'].map((k) => (
              <Text key={k} style={[styles.mayorCell, styles.mayorFootCell, { width: COLS.find((c) => c.key === k).width }]}>
                {fmt(saldos[k])}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function MayorRow({ t }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);
  const style = {
    opacity: anim,
    transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-9, 0] }) }],
  };
  const cell = (key, tag) => {
    const v = t.mov[key];
    const w = COLS.find((c) => c.key === key).width;
    if (v === undefined) return <View key={key} style={{ width: w }} />;
    return (
      <Text key={key} style={[styles.mayorCell, { width: w, color: v > 0 ? colors.haber : colors.debe }]}>
        {fmtMov(v)}
        {tag || ''}
      </Text>
    );
  };
  return (
    <Animated.View style={[styles.mayorBodyRow, style]}>
      <Text style={[styles.mayorCell, { width: COLS[0].width, textAlign: 'left', color: colors.textoSuave }]}>
        ({TRANS.indexOf(t) + 1})
      </Text>
      {cell('ef')}
      {cell('cc')}
      {cell('eq')}
      <Text style={[styles.mayorCell, styles.igual, { width: COLS[4].width }]}>=</Text>
      {cell('np')}
      {cell('cp')}
      {cell('cs', t.tag && t.tag.cs)}
      {cell('ur', t.tag && t.tag.ur)}
    </Animated.View>
  );
}

function AsientoCard({ t, index, paso, onRegistrar }) {
  const registrado = index < paso;
  const bloqueado = index > paso;
  const activo = index === paso;
  return (
    <View style={[styles.asiento, registrado && styles.asientoRegistrado, bloqueado && styles.asientoBloqueado]}>
      <View style={styles.asientoHead}>
        <View style={styles.asientoNum}>
          <Text style={styles.asientoNumText}>{index + 1}</Text>
        </View>
        <Text style={styles.asientoDesc}>{t.desc}</Text>
        {registrado && (
          <View style={styles.selloOk}>
            <Text style={styles.selloOkText}>REG.</Text>
          </View>
        )}
      </View>
      <View style={styles.lineas}>
        {t.diario.map(([cta, m, tipo], i) => (
          <View key={i} style={styles.lineaDiario}>
            <Text style={[styles.lineaCuenta, tipo === 'abono' && styles.lineaCuentaAbono]}>{cta}</Text>
            <Text style={[styles.lineaMonto, { color: tipo === 'cargo' ? colors.debe : colors.haber }]}>
              {tipo === 'cargo' ? 'Cargo' : 'Abono'} ${m.toLocaleString('en-US')}
            </Text>
          </View>
        ))}
      </View>
      {!registrado && (
        <View style={styles.accion}>
          <Pressable
            disabled={!activo}
            onPress={() => onRegistrar(index)}
            style={({ pressed }) => [
              styles.btnRegistrar,
              !activo && styles.btnRegistrarDisabled,
              pressed && activo && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <Text style={[styles.btnRegistrarText, !activo && styles.btnRegistrarTextDisabled]}>
              REGISTRAR ASIENTO
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Comprobacion({ saldos, onReiniciar }) {
  const activos = saldos.ef + saldos.cc + saldos.eq;
  const pasivosCapital = saldos.np + saldos.cp + saldos.cs + saldos.ur;
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, delay: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, delay: 250, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <LinearGradient colors={[colors.libro, colors.libro2, colors.libro]} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={styles.comprobacion}>
      <Animated.View style={[styles.estampa, { opacity, transform: [{ rotate: '7deg' }, { scale }] }]}>
        <Text style={styles.estampaText}>EN EQUILIBRIO</Text>
      </Animated.View>
      <Text style={styles.comprobacionTitulo}>Comprobación del balance</Text>
      <View style={styles.compFila}>
        <Text style={styles.compFilaLabel}>Efectivo + Ctas. por cobrar + Equipo</Text>
        <Text style={styles.compFilaValor}>{fmt(activos)}</Text>
      </View>
      <View style={styles.compFila}>
        <Text style={styles.compFilaLabel}>Pasivos + Capital contable</Text>
        <Text style={styles.compFilaValor}>{fmt(pasivosCapital)}</Text>
      </View>
      <View style={[styles.compFila, styles.compFilaTotal]}>
        <Text style={[styles.compFilaLabel, { color: colors.papel }]}>Total activos = Total pasivos y capital</Text>
        <Text style={styles.compFilaValor}>✓</Text>
      </View>
      <Pressable
        onPress={onReiniciar}
        style={({ pressed }) => [styles.btnFantasma, pressed && { backgroundColor: 'rgba(246,242,231,.08)', transform: [{ scale: 0.97 }] }]}
      >
        <Text style={styles.btnFantasmaText}>REINICIAR LA PRÁCTICA</Text>
      </Pressable>
    </LinearGradient>
  );
}

export default function DiarioScreen({ saldos, paso, onRegistrar, onReiniciar }) {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Ojal>PONLO EN PRÁCTICA · PASO A PASO</Ojal>
      <Titulo>
        Diario general, <TituloEm>siete operaciones</TituloEm>
      </Titulo>
      <Intro>
        Registra cada asiento en orden. El libro mayor tabular y la ecuación del encabezado se actualizan al
        instante.
      </Intro>

      <Ojal style={{ marginTop: 4 }}>RESUMEN TABULAR</Ojal>
      <MayorTable saldos={saldos} paso={paso} />

      <Ojal style={{ marginTop: 20 }}>ASIENTOS POR REGISTRAR</Ojal>
      <View style={{ gap: 12 }}>
        {TRANS.map((t, i) => (
          <AsientoCard key={i} t={t} index={i} paso={paso} onRegistrar={onRegistrar} />
        ))}
      </View>

      {paso === TRANS.length && <Comprobacion saldos={saldos} onReiniciar={onReiniciar} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  mayorScroll: {
    marginHorizontal: -spacing.xl,
    marginBottom: 6,
  },
  mayorTable: {
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: colors.blanco,
  },
  mayorHeadRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  mayorHeadCell: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: colors.papel,
    paddingHorizontal: 9,
  },
  mayorEmptyRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  mayorEmptyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textoSuave,
  },
  mayorBodyRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.papel2,
  },
  mayorFootRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 2.5,
    borderTopColor: colors.texto,
    backgroundColor: colors.papel2,
  },
  mayorCell: {
    fontFamily: fonts.mono,
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: 9,
  },
  mayorFootCell: {
    fontFamily: fonts.monoSemiBold,
  },
  igual: {
    color: colors.latonOscuro,
    fontFamily: fonts.monoSemiBold,
    textAlign: 'center',
  },
  asiento: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  asientoRegistrado: {
    borderColor: 'rgba(28,107,72,.4)',
  },
  asientoBloqueado: {
    opacity: 0.42,
  },
  asientoHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 14,
    paddingBottom: 10,
  },
  asientoNum: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    borderWidth: 1.5,
    borderColor: colors.laton,
    backgroundColor: 'rgba(165,122,34,.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  asientoNumText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    color: colors.latonOscuro,
  },
  asientoDesc: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.texto,
  },
  selloOk: {
    borderWidth: 1.5,
    borderColor: colors.haber,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 7,
    transform: [{ rotate: '-4deg' }],
  },
  selloOkText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.haber,
  },
  lineas: {
    paddingHorizontal: 15,
    paddingBottom: 13,
    paddingLeft: 53,
    gap: 2.5,
  },
  lineaDiario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineaCuenta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textoSuave,
  },
  lineaCuentaAbono: {
    paddingLeft: 16,
  },
  lineaMonto: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  accion: {
    borderTopWidth: 1,
    borderTopColor: colors.regla,
    borderStyle: 'dashed',
    padding: 15,
    alignItems: 'flex-end',
  },
  btnRegistrar: {
    backgroundColor: colors.libro,
    borderWidth: 1,
    borderColor: 'rgba(221,178,85,.4)',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 19,
  },
  btnRegistrarDisabled: {
    backgroundColor: '#CDC4A9',
    borderColor: 'transparent',
  },
  btnRegistrarText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.papel,
  },
  btnRegistrarTextDisabled: {
    color: '#8B8368',
  },
  comprobacion: {
    marginTop: 17,
    borderRadius: 16,
    padding: 21,
    paddingHorizontal: 19,
    overflow: 'hidden',
  },
  estampa: {
    position: 'absolute',
    right: 15,
    top: 15,
    borderWidth: 2.5,
    borderColor: colors.latonClaro,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  estampaText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.latonClaro,
  },
  comprobacionTitulo: {
    fontFamily: fonts.serif,
    fontSize: 21,
    color: colors.papel,
    marginBottom: 13,
    maxWidth: '75%',
  },
  compFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5.5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(246,242,231,.14)',
    gap: 10,
  },
  compFilaLabel: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: 'rgba(246,242,231,.85)',
    flexShrink: 1,
  },
  compFilaValor: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12.5,
    color: colors.papel,
  },
  compFilaTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: colors.latonClaro,
    marginTop: 6,
    paddingTop: 11,
  },
  btnFantasma: {
    marginTop: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(246,242,231,.3)',
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnFantasmaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.papel,
  },
});
