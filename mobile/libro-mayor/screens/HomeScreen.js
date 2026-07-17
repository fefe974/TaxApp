import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Card } from '../components/Card';
import { Eyebrow, Titulo, Intro } from '../components/Typography';
import { IconChevronDown, IconArrowRight } from '../components/Icons';
import { colors, fonts, spacing, radius } from '../theme';

function statusDotColor(status) {
  if (status === 'listo') return colors.green;
  if (status === 'curso') return colors.goldDark;
  return '#CBD1CB';
}
function statusLabel(status) {
  if (status === 'listo') return 'Completado';
  if (status === 'curso') return 'En curso';
  return 'Próximamente';
}
function statusColor(status) {
  if (status === 'listo') return colors.green;
  if (status === 'curso') return colors.goldDark;
  return '#9AA29A';
}

function ChapterCard({ chapter, expanded, onToggle, onClassPress }) {
  return (
    <Card>
      <Pressable style={styles.chapterHead} onPress={onToggle}>
        <View style={[styles.numBadge, { backgroundColor: chapter.pct > 0 ? colors.greenLight : colors.neutralBg }]}>
          <Text style={[styles.numText, { color: chapter.pct > 0 ? colors.green : colors.textoFaint }]}>{chapter.num}</Text>
        </View>
        <View style={styles.chapterTitleCol}>
          <Text style={styles.chapterCode}>{chapter.code.toUpperCase()}</Text>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.chapterCount}>{chapter.countText}</Text>
        </View>
        <Text style={styles.chapterPct}>{chapter.pct}%</Text>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <IconChevronDown size={18} color={colors.textoFaint} />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.chapterBody}>
          {chapter.classes.map((cl, i) => (
            <Pressable
              key={i}
              disabled={!cl.interactive}
              onPress={() => cl.interactive && onClassPress()}
              style={styles.classRow}
            >
              <View style={[styles.dot, { backgroundColor: statusDotColor(cl.status) }]} />
              <View style={styles.classTextCol}>
                <Text style={styles.classTitle} numberOfLines={1}>
                  {cl.title}
                </Text>
                <Text style={[styles.classStatus, { color: statusColor(cl.status) }]}>{statusLabel(cl.status)}</Text>
              </View>
              {cl.interactive && <IconArrowRight size={16} color={colors.green} />}
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

export default function HomeScreen({ chapters, openChap, onToggleChapter, onClassPress, pct }) {
  return (
    <ScrollView contentContainerStyle={styles.pantalla} showsVerticalScrollIndicator={false}>
      <Eyebrow>Contabilidad · Fundamentos</Eyebrow>
      <Titulo>Continúa aprendiendo</Titulo>
      <Intro>Retoma tu módulo activo o explora el temario del curso.</Intro>

      <Pressable style={styles.resume} onPress={onClassPress}>
        <Text style={styles.resumeEyebrow}>CONTINUAR</Text>
        <Text style={styles.resumeTitle}>Capítulo 2 · El libro mayor</Text>
        <View style={styles.resumeBarRow}>
          <View style={styles.resumeBarTrack}>
            <View style={[styles.resumeBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.resumePct}>{pct}%</Text>
        </View>
      </Pressable>

      <Eyebrow style={{ marginTop: 24, marginBottom: 10 }}>Capítulos del curso</Eyebrow>
      <View style={styles.chapters}>
        {chapters.map((ch) => (
          <ChapterCard
            key={ch.index}
            chapter={ch}
            expanded={openChap === ch.index}
            onToggle={() => onToggleChapter(ch.index)}
            onClassPress={onClassPress}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    padding: spacing.xl,
    paddingBottom: 30,
  },
  resume: {
    marginTop: 18,
    backgroundColor: colors.texto,
    borderRadius: 18,
    padding: 18,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  resumeEyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  resumeTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.surface,
    marginTop: 5,
  },
  resumeBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  resumeBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(245,246,245,.16)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  resumeBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 99,
  },
  resumePct: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    color: colors.gold,
  },
  chapters: {
    gap: 11,
  },
  chapterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    paddingHorizontal: 16,
  },
  numBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.sm - 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
  },
  chapterTitleCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  chapterCode: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.green,
  },
  chapterTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
    lineHeight: 17,
    color: colors.texto,
  },
  chapterCount: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textoFaint,
  },
  chapterPct: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    color: colors.textoSuave,
    flexShrink: 0,
  },
  chapterBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    flexShrink: 0,
  },
  classTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  classTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.texto,
  },
  classStatus: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
