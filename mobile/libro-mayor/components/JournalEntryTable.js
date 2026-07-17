import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';

const fmtAmt = (n) => (n === undefined || n === null ? '' : '$' + n.toLocaleString('en-US'));

// A single "page" from the General Journal: shared column header, one or more dated
// entries below it, each with a debit line (flush left) then indented credit line(s)
// and an italic explanation — same convention as a real accounting journal.
export default function JournalEntryTable({ entries, showRef = false }) {
  return (
    <View style={styles.table}>
      <View style={styles.headRow}>
        <Text style={[styles.headCell, styles.colDate]}>FECHA</Text>
        <Text style={[styles.headCell, styles.colAccount]}>CUENTA Y EXPLICACIÓN</Text>
        {showRef && <Text style={[styles.headCell, styles.colRef]}>REF.</Text>}
        <Text style={[styles.headCell, styles.colAmount, { textAlign: 'right' }]}>DEBE</Text>
        <Text style={[styles.headCell, styles.colAmount, { textAlign: 'right' }]}>HABER</Text>
      </View>

      {entries.map((entry, i) => (
        <View key={i} style={[styles.entry, i === entries.length - 1 && styles.entryLast]}>
          {entry.lines.map((line, j) => (
            <View key={j} style={styles.row}>
              <Text style={[styles.cell, styles.colDate, styles.mono]}>{j === 0 ? entry.date || '' : ''}</Text>
              <Text style={[styles.cell, styles.colAccount, line.credit !== undefined && styles.creditIndent]}>
                {line.account}
              </Text>
              {showRef && <Text style={[styles.cell, styles.colRef, styles.mono]}>{line.ref || ''}</Text>}
              <Text style={[styles.cell, styles.colAmount, styles.mono]}>{fmtAmt(line.debit)}</Text>
              <Text style={[styles.cell, styles.colAmount, styles.mono]}>{fmtAmt(line.credit)}</Text>
            </View>
          ))}
          {entry.explanation && (
            <Text style={styles.explanation}>({entry.explanation})</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  headRow: {
    flexDirection: 'row',
    backgroundColor: colors.texto,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headCell: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.surface,
  },
  entry: {
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  entryLast: {
    paddingBottom: 11,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  cell: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.texto,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  colDate: {
    width: 44,
    color: colors.textoSuave,
  },
  colAccount: {
    flex: 1,
    paddingRight: 6,
  },
  creditIndent: {
    paddingLeft: 18,
    color: colors.textoSuave,
  },
  colRef: {
    width: 32,
    textAlign: 'center',
    color: colors.textoFaint,
  },
  colAmount: {
    width: 72,
    textAlign: 'right',
  },
  explanation: {
    fontFamily: fonts.sans,
    fontStyle: 'italic',
    fontSize: 10.5,
    color: colors.textoFaint,
    marginTop: 3,
    paddingLeft: 44,
  },
});
