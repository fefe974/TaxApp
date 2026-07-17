import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../../theme';
import { Eyebrow, Titulo, Intro } from '../../components/Typography';
import TrialBalanceTable from '../../components/TrialBalanceTable';
import { KLEENE_ACCOUNTS, KLEENE_TRANS, fmt } from '../../data';

const SHORT_LABEL = {
  cash: 'Cash',
  ar: 'A/R',
  supplies: 'Supplies',
  prepaidIns: 'Seg. Pagado',
  equipment: 'Equipo',
  ap: 'A/P',
  commonStock: 'Cap. Social',
  dividends: 'Dividendos',
  serviceRevenue: 'Ingresos',
  salariesExp: 'Salarios',
  maintenanceExp: 'Mant.',
};
const COLS = [
  { key: 'op', label: 'Fecha', width: 52, align: 'left' },
  ...KLEENE_ACCOUNTS.map((a) => ({ key: a.key, label: SHORT_LABEL[a.key], width: 84 })),
];
const TABLE_WIDTH = COLS.reduce((s, c) => s + c.width, 0);

function accountName(key) {
  return KLEENE_ACCOUNTS.find((a) => a.key === key).name;
}

function LedgerTable({ saldos, paso }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ledgerScroll}>
      <View style={[styles.ledgerTable, { width: TABLE_WIDTH }]}>
        <View style={styles.ledgerHeadRow}>
          {COLS.map((c) => (
            <Text key={c.key} style={[styles.ledgerHeadCell, { width: c.width, textAlign: c.align || 'right' }]}>
              {c.label.toUpperCase()}
            </Text>
          ))}
        </View>

        {paso === 0 && (
          <View style={styles.ledgerEmptyRow}>
            <Text style={styles.ledgerEmptyText}>Sin movimientos registrados</Text>
          </View>
        )}

        {KLEENE_TRANS.slice(0, paso).map((t, i) => (
          <LedgerRow key={i} t={t} />
        ))}

        {paso > 0 && (
          <View style={styles.ledgerFootRow}>
            <Text style={[styles.ledgerCell, { width: COLS[0].width, textAlign: 'left', fontFamily: fonts.sansBold, color: colors.texto }]}>
              Saldos
            </Text>
            {KLEENE_ACCOUNTS.map((a) => (
              <Text key={a.key} style={[styles.ledgerCell, styles.ledgerFootCell, { width: 84 }]}>
                {fmt(saldos[a.key])}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function LedgerRow({ t }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.ledgerBodyRow, { opacity: anim }]}>
      <Text style={[styles.ledgerCell, { width: COLS[0].width, textAlign: 'left', color: colors.textoSuave }]}>
        {t.date}
      </Text>
      {KLEENE_ACCOUNTS.map((a) => {
        const line = t.lines.find((l) => l.account === a.key);
        if (!line) return <View key={a.key} style={{ width: 84 }} />;
        const color = line.side === 'debit' ? colors.red : colors.green;
        return (
          <Text key={a.key} style={[styles.ledgerCell, { width: 84, color }]}>
            {fmt(line.amount)}
          </Text>
        );
      })}
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
        <View style={styles.asientoFecha}>
          <Text style={styles.asientoFechaText}>{t.date.replace('Jul. ', '')}</Text>
        </View>
        <Text style={styles.asientoDesc}>{t.desc}</Text>
        {registrado && (
          <View style={styles.selloOk}>
            <Text style={styles.selloOkText}>REG.</Text>
          </View>
        )}
      </View>
      <View style={styles.lineas}>
        {t.lines.map((line, i) => (
          <View key={i} style={styles.lineaDiario}>
            <Text style={[styles.lineaCuenta, line.side === 'credit' && styles.lineaCuentaAbono]}>
              {accountName(line.account)}
            </Text>
            <Text style={[styles.lineaMonto, { color: line.side === 'debit' ? colors.red : colors.green }]}>
              {line.side === 'debit' ? 'Cargo' : 'Abono'} {fmt(line.amount)}
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

export default function PracticaKleeneSection({ saldos, paso, onRegistrar, onReiniciar }) {
  const done = paso === KLEENE_TRANS.length;

  const rows = KLEENE_ACCOUNTS.map((a) => ({
    name: a.name,
    debit: a.normal === 'debit' ? saldos[a.key] : 0,
    credit: a.normal === 'credit' ? -saldos[a.key] : 0,
  }));
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Put It into Practice · LO 2.2</Eyebrow>
      <Titulo>Kleene Window Washing Inc.</Titulo>
      <Intro>
        Mike Greenberg abre su empresa en julio de 2025. Aplica los tres pasos del proceso de registro a sus
        primeras once operaciones: journalize, post to the ledger y prepara el Trial Balance.
      </Intro>

      <Eyebrow style={{ marginTop: 20, marginBottom: 4 }}>Paso 1 · Journalize</Eyebrow>
      <Text style={styles.pasoIntro}>Registra cada asiento en orden.</Text>
      <View style={styles.asientos}>
        {KLEENE_TRANS.map((t, i) => (
          <AsientoCard key={i} t={t} index={i} paso={paso} onRegistrar={onRegistrar} />
        ))}
      </View>

      <Eyebrow style={{ marginTop: 22, marginBottom: 9 }}>Paso 2 · Post to the Ledger</Eyebrow>
      <LedgerTable saldos={saldos} paso={paso} />

      <Eyebrow style={{ marginTop: 22, marginBottom: 10 }}>Paso 3 · Trial Balance</Eyebrow>
      {done ? (
        <>
          <TrialBalanceTable
            company="Kleene Window Washing Inc."
            date="July 31, 2025"
            rows={rows}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
          />
          <Pressable onPress={onReiniciar} style={styles.btnFantasma}>
            <Text style={styles.btnFantasmaText}>Reiniciar la práctica</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.locked}>
          <Text style={styles.lockedText}>
            Registra las {KLEENE_TRANS.length} operaciones del Paso 1 para desbloquear el Trial Balance.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  pasoIntro: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: colors.textoSuave,
    marginBottom: 10,
  },
  asientos: {
    gap: 10,
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
    padding: 13,
    paddingBottom: 8,
  },
  asientoFecha: {
    borderRadius: 8,
    backgroundColor: colors.neutralBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  asientoFechaText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 10.5,
    color: colors.textoSuave,
  },
  asientoDesc: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.texto,
  },
  selloOk: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  selloOkText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.green,
  },
  lineas: {
    paddingHorizontal: 13,
    paddingBottom: 12,
    paddingLeft: 13,
    gap: 3,
  },
  lineaDiario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineaCuenta: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.textoSuave,
  },
  lineaCuentaAbono: {
    paddingLeft: 16,
  },
  lineaMonto: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
  },
  accion: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
    padding: 13,
    alignItems: 'flex-end',
  },
  btnRegistrar: {
    backgroundColor: colors.green,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  btnRegistrarDisabled: {
    backgroundColor: '#CBD1CB',
  },
  btnRegistrarText: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.4,
    color: '#fff',
  },
  ledgerScroll: {
    marginHorizontal: -spacing.xl,
  },
  ledgerTable: {
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  ledgerHeadRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: colors.texto,
  },
  ledgerHeadCell: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9,
    letterSpacing: 0.4,
    color: colors.surface,
    paddingHorizontal: 8,
  },
  ledgerEmptyRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ledgerEmptyText: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.textoFaint,
  },
  ledgerBodyRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ledgerFootRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 2.5,
    borderTopColor: colors.texto,
    backgroundColor: colors.divider,
  },
  ledgerCell: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    textAlign: 'right',
    paddingHorizontal: 8,
  },
  ledgerFootCell: {
    fontFamily: fonts.monoSemiBold,
    color: colors.texto,
  },
  locked: {
    backgroundColor: colors.neutralBg,
    borderRadius: radius.lg,
    padding: 16,
  },
  lockedText: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textoSuave,
  },
  btnFantasma: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnFantasmaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.textoSuave,
  },
});
