import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import { Eyebrow, Titulo, Intro } from '../components/Typography';
import IndependentPractice from '../components/IndependentPractice';
import { TRANS, fmt, fmtMov, TRANS_PRACTICE_ITEMS, TRANS_ACCOUNT_POOL } from '../data';

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
        <View style={styles.mayorHeadRow}>
          {COLS.map((c) => (
            <Text
              key={c.key}
              style={[styles.mayorHeadCell, { width: c.width, textAlign: c.align || 'right' }]}
            >
              {c.label.toUpperCase()}
            </Text>
          ))}
        </View>

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
            <Text style={[styles.mayorCell, { width: COLS[0].width, textAlign: 'left', fontFamily: fonts.sansBold, color: colors.texto }]}>
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
    Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);
  const cell = (key, tag) => {
    const v = t.mov[key];
    const w = COLS.find((c) => c.key === key).width;
    if (v === undefined) return <View key={key} style={{ width: w }} />;
    return (
      <Text key={key} style={[styles.mayorCell, { width: w, color: v > 0 ? colors.green : colors.red }]}>
        {fmtMov(v)}
        {tag || ''}
      </Text>
    );
  };
  return (
    <Animated.View style={[styles.mayorBodyRow, { opacity: anim }]}>
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
            <Text style={styles.lineaCuenta}>{tipo === 'abono' ? '  ' : ''}{cta}</Text>
            <Text style={[styles.lineaMonto, { color: tipo === 'cargo' ? colors.red : colors.green }]}>
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
            style={[styles.btnRegistrar, !activo && styles.btnRegistrarDisabled]}
          >
            <Text style={styles.btnRegistrarText}>Registrar asiento</Text>
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
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, delay: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <View style={styles.comprobacion}>
      <Animated.View style={[styles.estampa, { opacity, transform: [{ rotate: '6deg' }, { scale }] }]}>
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
        <Text style={[styles.compFilaLabel, { color: colors.surface }]}>Total activos = Total pasivos y capital</Text>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <Pressable onPress={onReiniciar} style={styles.btnFantasma}>
        <Text style={styles.btnFantasmaText}>Reiniciar la práctica</Text>
      </Pressable>
    </View>
  );
}

export default function DiarioScreen({ saldos, paso, onRegistrar, onReiniciar }) {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Ponlo en práctica · Paso a paso</Eyebrow>
      <Titulo>Diario general, siete operaciones</Titulo>
      <Intro>
        Registra cada asiento en orden. El libro mayor y la ecuación del encabezado se actualizan al instante.
      </Intro>

      <Eyebrow style={{ marginTop: 20, marginBottom: 9 }}>Resumen tabular</Eyebrow>
      <MayorTable saldos={saldos} paso={paso} />

      <Eyebrow style={{ marginTop: 20, marginBottom: 10 }}>Asientos por registrar</Eyebrow>
      <View style={{ gap: 11 }}>
        {TRANS.map((t, i) => (
          <AsientoCard key={i} t={t} index={i} paso={paso} onRegistrar={onRegistrar} />
        ))}
      </View>

      {paso === TRANS.length && (
        <>
          <Comprobacion saldos={saldos} onReiniciar={onReiniciar} />

          <Eyebrow style={{ marginTop: 26, marginBottom: 4 }}>Ahora tú</Eyebrow>
          <Text style={styles.ahoraTuIntro}>
            Sin ver la respuesta: arma cada asiento tú mismo. Toca las cuentas que correspondan y marca si son
            Cargo o Abono.
          </Text>
          <View style={{ marginTop: 12 }}>
            <IndependentPractice items={TRANS_PRACTICE_ITEMS} accountPool={TRANS_ACCOUNT_POOL} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  ahoraTuIntro: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textoSuave,
  },
  mayorScroll: {
    marginHorizontal: -spacing.xl,
    marginBottom: 6,
  },
  mayorTable: {
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  mayorHeadRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: colors.texto,
  },
  mayorHeadCell: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    color: colors.surface,
    paddingHorizontal: 9,
  },
  mayorEmptyRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  mayorEmptyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textoFaint,
  },
  mayorBodyRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  mayorFootRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 2.5,
    borderTopColor: colors.texto,
    backgroundColor: colors.divider,
  },
  mayorCell: {
    fontFamily: fonts.mono,
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: 9,
  },
  mayorFootCell: {
    fontFamily: fonts.monoSemiBold,
    color: colors.texto,
  },
  igual: {
    color: '#A5843C',
    fontFamily: fonts.monoSemiBold,
    textAlign: 'center',
  },
  asiento: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  asientoRegistrado: {
    borderColor: 'rgba(11,122,85,.4)',
  },
  asientoBloqueado: {
    opacity: 0.42,
  },
  asientoHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 14,
    paddingBottom: 9,
  },
  asientoNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asientoNumText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    color: colors.green,
  },
  asientoDesc: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.texto,
  },
  selloOk: {
    marginLeft: 'auto',
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  selloOkText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.green,
  },
  lineas: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingLeft: 51,
    gap: 3,
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
  lineaMonto: {
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: '500',
  },
  accion: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'flex-end',
  },
  btnRegistrar: {
    backgroundColor: colors.green,
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  btnRegistrarDisabled: {
    backgroundColor: '#CBD1CB',
  },
  btnRegistrarText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#fff',
  },
  comprobacion: {
    marginTop: 16,
    backgroundColor: colors.texto,
    borderRadius: radius.xl,
    padding: 20,
    paddingHorizontal: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  estampa: {
    position: 'absolute',
    right: 14,
    top: 14,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  estampaText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.gold,
  },
  comprobacionTitulo: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.surface,
    marginBottom: 12,
    maxWidth: '72%',
  },
  compFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,246,245,.14)',
    gap: 10,
  },
  compFilaLabel: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: 'rgba(245,246,245,.8)',
    flexShrink: 1,
  },
  compFilaValor: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12.5,
    color: colors.surface,
  },
  compFilaTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: colors.gold,
    marginTop: 6,
    paddingTop: 10,
  },
  checkMark: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.greenSoft,
  },
  btnFantasma: {
    marginTop: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(245,246,245,.28)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnFantasmaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.surface,
  },
});
