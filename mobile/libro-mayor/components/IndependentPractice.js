import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { Card } from './Card';

const SIDE_LABEL = { debit: 'CARGO', credit: 'ABONO' };

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function Chip({ name, mark, feedback, onPress, disabled }) {
  const isCorrectFeedback = feedback === true;
  const isWrongFeedback = feedback === false;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        mark === 'debit' && styles.chipDebit,
        mark === 'credit' && styles.chipCredit,
        isWrongFeedback && styles.chipWrong,
        isCorrectFeedback && mark && styles.chipCorrect,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          mark === 'debit' && styles.chipTextDebit,
          mark === 'credit' && styles.chipTextCredit,
        ]}
      >
        {name}
      </Text>
      {mark && (
        <Text style={[styles.chipBadge, mark === 'debit' ? styles.chipTextDebit : styles.chipTextCredit]}>
          {SIDE_LABEL[mark]}
        </Text>
      )}
    </Pressable>
  );
}

// Generic "build the journal entry yourself" exercise. `items` is a normalized list:
// [{ desc, hint, correct: [{ name, side: 'debit'|'credit' }] }]. `accountPool` is every
// account name in this lesson's dataset, used to draw plausible-but-wrong distractor chips.
export default function IndependentPractice({ items, accountPool }) {
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState({});
  const [status, setStatus] = useState('answering'); // 'answering' | 'correct' | 'incorrect'
  const [feedback, setFeedback] = useState({});
  const [showHint, setShowHint] = useState(false);

  const finished = index >= items.length;
  const item = !finished ? items[index] : null;

  const chips = useMemo(() => {
    if (!item) return [];
    const correctNames = item.correct.map((c) => c.name);
    const pool = accountPool.filter((n) => !correctNames.includes(n));
    const distractors = shuffled(pool).slice(0, Math.min(2, pool.length));
    return shuffled([...correctNames, ...distractors]);
  }, [index]);

  useEffect(() => {
    setMarks({});
    setStatus('answering');
    setFeedback({});
    setShowHint(false);
  }, [index]);

  if (finished) {
    return (
      <View style={styles.doneCard}>
        <Text style={styles.doneTitle}>¡Completaste la práctica independiente!</Text>
        <Text style={styles.doneText}>
          Respondiste las {items.length} operaciones por tu cuenta, sin ver la respuesta primero.
        </Text>
      </View>
    );
  }

  function cycle(name) {
    if (status === 'correct') return;
    setMarks((prev) => {
      const cur = prev[name];
      const next = cur === undefined ? 'debit' : cur === 'debit' ? 'credit' : undefined;
      return { ...prev, [name]: next };
    });
    if (status === 'incorrect') {
      setStatus('answering');
      setFeedback({});
    }
  }

  function verify() {
    const correctMap = Object.fromEntries(item.correct.map((c) => [c.name, c.side]));
    let ok = true;
    const fb = {};
    chips.forEach((name) => {
      const expected = correctMap[name];
      const actual = marks[name];
      const good = expected === actual;
      fb[name] = good;
      if (!good) ok = false;
    });
    setFeedback(fb);
    setStatus(ok ? 'correct' : 'incorrect');
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.progress}>
        OPERACIÓN {index + 1} DE {items.length}
      </Text>
      <Text style={styles.desc}>{item.desc}</Text>

      <View style={styles.chips}>
        {chips.map((name) => (
          <Chip
            key={name}
            name={name}
            mark={marks[name]}
            feedback={status === 'incorrect' ? feedback[name] : undefined}
            disabled={status === 'correct'}
            onPress={() => cycle(name)}
          />
        ))}
      </View>
      <Text style={styles.hintNote}>Toca cada cuenta involucrada: una vez para Cargo, otra vez para Abono.</Text>

      {showHint && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>💡 {item.hint}</Text>
        </View>
      )}

      {status === 'correct' && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ ¡Correcto!</Text>
        </View>
      )}
      {status === 'incorrect' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Todavía no — revisa las cuentas marcadas en rojo e inténtalo de nuevo.</Text>
        </View>
      )}

      <View style={styles.actions}>
        {status !== 'correct' && (
          <Pressable style={styles.btnHint} onPress={() => setShowHint((v) => !v)}>
            <Text style={styles.btnHintText}>{showHint ? 'Ocultar pista' : 'Pista'}</Text>
          </Pressable>
        )}
        {status === 'correct' ? (
          <Pressable style={styles.btnPrimary} onPress={() => setIndex((i) => i + 1)}>
            <Text style={styles.btnPrimaryText}>Siguiente</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.btnPrimary} onPress={verify}>
            <Text style={styles.btnPrimaryText}>Verificar</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  progress: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.green,
    marginBottom: 6,
  },
  desc: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.texto,
    marginBottom: 13,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 99,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  chipDebit: {
    backgroundColor: 'rgba(178,59,46,.1)',
    borderColor: colors.red,
  },
  chipCredit: {
    backgroundColor: 'rgba(11,122,85,.1)',
    borderColor: colors.green,
  },
  chipWrong: {
    borderColor: colors.red,
    borderWidth: 2,
  },
  chipCorrect: {
    borderColor: colors.green,
    borderWidth: 2,
  },
  chipText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: colors.texto,
  },
  chipTextDebit: {
    color: colors.red,
  },
  chipTextCredit: {
    color: colors.green,
  },
  chipBadge: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  hintNote: {
    fontFamily: fonts.sans,
    fontStyle: 'italic',
    fontSize: 11,
    color: colors.textoFaint,
    marginTop: 9,
  },
  hintBox: {
    marginTop: 11,
    backgroundColor: colors.neutralBg,
    borderRadius: radius.sm,
    padding: 11,
  },
  hintText: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textoSuave,
  },
  successBox: {
    marginTop: 12,
    backgroundColor: colors.greenLight,
    borderRadius: radius.sm,
    padding: 11,
    alignItems: 'center',
  },
  successText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.green,
  },
  errorBox: {
    marginTop: 12,
    backgroundColor: 'rgba(178,59,46,.08)',
    borderRadius: radius.sm,
    padding: 11,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.red,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  btnHint: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnHintText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.textoSuave,
  },
  btnPrimary: {
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  btnPrimaryText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: '#fff',
  },
  doneCard: {
    backgroundColor: colors.texto,
    borderRadius: radius.xl,
    padding: 20,
  },
  doneTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: colors.surface,
  },
  doneText: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(245,246,245,.8)',
    marginTop: 6,
  },
});
