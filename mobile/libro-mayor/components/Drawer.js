import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { colors, fonts } from '../theme';
import { IconClose, IconArrowRight } from './Icons';

const DRAWER_WIDTH = Math.min(300, Dimensions.get('window').width * 0.84);

function statusDotColor(status) {
  if (status === 'listo') return colors.green;
  if (status === 'curso') return colors.goldDark;
  return '#CBD1CB';
}

export default function Drawer({ visible, onClose, chapters, onNavigate }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-DRAWER_WIDTH, 0] });

  return (
    <>
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[styles.scrim, { opacity: anim }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX }] }]}>
        <View style={styles.drawerHead}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>LM</Text>
          </View>
          <Text style={styles.drawerTitle}>Contenido del curso</Text>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <IconClose size={22} color={colors.textoSuave} />
          </Pressable>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {chapters.map((ch) => (
            <View key={ch.index} style={styles.chapter}>
              <View style={styles.chapterHead}>
                <View style={[styles.numBadge, { backgroundColor: ch.pct > 0 ? colors.greenLight : colors.neutralBg }]}>
                  <Text style={[styles.numText, { color: ch.pct > 0 ? colors.green : colors.textoFaint }]}>{ch.num}</Text>
                </View>
                <View style={styles.chapterTitleCol}>
                  <Text style={styles.chapterCode}>{ch.code.toUpperCase()}</Text>
                  <Text style={styles.chapterTitle}>{ch.title}</Text>
                </View>
              </View>
              {ch.classes.map((cl, i) => (
                <Pressable
                  key={i}
                  disabled={!cl.interactive}
                  onPress={() => cl.interactive && onNavigate(cl.target)}
                  style={styles.classRow}
                >
                  <View style={[styles.dot, { backgroundColor: statusDotColor(cl.status) }]} />
                  <Text style={styles.classTitle} numberOfLines={1}>
                    {cl.title}
                  </Text>
                  {cl.interactive && <IconArrowRight size={15} color={colors.green} />}
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrim,
    zIndex: 40,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    zIndex: 41,
    shadowColor: '#12211A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 30,
    elevation: 20,
  },
  drawerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: '#fff',
  },
  drawerTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.texto,
  },
  closeBtn: {
    marginLeft: 'auto',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 10,
    paddingBottom: 24,
  },
  chapter: {
    marginBottom: 8,
  },
  chapterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  numBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
  },
  chapterTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  chapterCode: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textoFaint,
  },
  chapterTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    letterSpacing: -0.1,
    color: colors.texto,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  classTitle: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    color: colors.texto,
    minWidth: 0,
  },
});
