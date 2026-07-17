import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';

const fmt = (n) => '$' + Math.abs(n).toLocaleString('en-US');

export default function TrialBalanceTable({ company, date, rows, totalDebit, totalCredit }) {
  const balanced = totalDebit === totalCredit;
  return (
    <View style={styles.table}>
      <View style={styles.letterhead}>
        <Text style={styles.company}>{company}</Text>
        <Text style={styles.docTitle}>Trial Balance</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.headRow}>
        <Text style={[styles.headCell, styles.colAccount]}>CUENTA</Text>
        <Text style={[styles.headCell, styles.colAmount]}>DEBE</Text>
        <Text style={[styles.headCell, styles.colAmount]}>HABER</Text>
      </View>

      {rows.map((r, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.accountName}>{r.name}</Text>
          <Text style={[styles.mono, styles.colAmount]}>{r.debit ? fmt(r.debit) : ''}</Text>
          <Text style={[styles.mono, styles.colAmount]}>{r.credit ? fmt(r.credit) : ''}</Text>
        </View>
      ))}

      <View style={styles.totalsRow}>
        <Text style={styles.totalsLabel}>Totals</Text>
        <View style={styles.colAmount}>
          <Text style={[styles.mono, styles.totalsAmount]}>{fmt(totalDebit)}</Text>
          <View style={styles.dobleLinea}>
            <View style={styles.dobleLineaBarra} />
            <View style={styles.dobleLineaBarra} />
          </View>
        </View>
        <View style={styles.colAmount}>
          <Text style={[styles.mono, styles.totalsAmount]}>{fmt(totalCredit)}</Text>
          <View style={styles.dobleLinea}>
            <View style={styles.dobleLineaBarra} />
            <View style={styles.dobleLineaBarra} />
          </View>
        </View>
      </View>

      {balanced && (
        <View style={styles.balancedBadge}>
          <Text style={styles.balancedText}>✓ Debe = Haber, el mayor está en equilibrio</Text>
        </View>
      )}
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
  letterhead: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.texto,
  },
  company: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.texto,
  },
  docTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: colors.textoSuave,
    marginTop: 1,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textoFaint,
    marginTop: 3,
  },
  headRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headCell: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.textoFaint,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  accountName: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: colors.texto,
    paddingRight: 8,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    color: colors.texto,
  },
  colAccount: {
    flex: 1,
  },
  colAmount: {
    width: 84,
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    marginTop: 4,
    borderTopWidth: 2.5,
    borderTopColor: colors.texto,
  },
  totalsLabel: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: colors.texto,
  },
  totalsAmount: {
    fontFamily: fonts.monoSemiBold,
    textAlign: 'right',
  },
  dobleLinea: {
    marginTop: 3,
    width: '100%',
    gap: 1.5,
  },
  dobleLineaBarra: {
    height: 1,
    backgroundColor: colors.texto,
  },
  balancedBadge: {
    backgroundColor: colors.greenLight,
    paddingVertical: 10,
    alignItems: 'center',
  },
  balancedText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: colors.green,
  },
});
