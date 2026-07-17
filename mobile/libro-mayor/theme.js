import { Platform } from 'react-native';

export const colors = {
  bg: '#E7EAE4',
  surface: '#F5F6F5',
  card: '#FFFFFF',
  border: '#E7EAE7',
  divider: '#EFF1EF',
  texto: '#12211A',
  textoSuave: '#68766F',
  textoFaint: '#8B968F',
  neutralBg: '#F0F2F0',
  green: '#0B7A55',
  greenDark: '#085C40',
  greenLight: '#E7F3EE',
  greenSoft: '#5BD6A6',
  gold: '#E4C574',
  goldDark: '#C79A2E',
  red: '#B23B2E',
  scrim: 'rgba(18,33,26,.45)',
};

export const fonts = {
  sans: 'SchibstedGrotesk-Regular',
  sansMedium: 'SchibstedGrotesk-Medium',
  sansSemiBold: 'SchibstedGrotesk-SemiBold',
  sansBold: 'SchibstedGrotesk-Bold',
  mono: 'IBMPlexMono-Regular',
  monoMedium: 'IBMPlexMono-Medium',
  monoSemiBold: 'IBMPlexMono-SemiBold',
};

export const fontAssets = {
  'SchibstedGrotesk-Regular': require('./assets/fonts/SchibstedGrotesk-Regular.ttf'),
  'SchibstedGrotesk-Medium': require('./assets/fonts/SchibstedGrotesk-Medium.ttf'),
  'SchibstedGrotesk-SemiBold': require('./assets/fonts/SchibstedGrotesk-SemiBold.ttf'),
  'SchibstedGrotesk-Bold': require('./assets/fonts/SchibstedGrotesk-Bold.ttf'),
  'IBMPlexMono-Regular': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
  'IBMPlexMono-Medium': require('./assets/fonts/IBMPlexMono-Medium.ttf'),
  'IBMPlexMono-SemiBold': require('./assets/fonts/IBMPlexMono-SemiBold.ttf'),
};

// Single soft elevation used throughout — this design has no ambient/contact
// two-tier system, just one consistent subtle card shadow.
export function shadow() {
  return Platform.select({
    ios: {
      shadowColor: '#12211A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    android: { elevation: 2 },
    default: {},
  });
}

export const radius = { sm: 10, md: 13, lg: 14, xl: 16 };
export const spacing = { xs: 4, sm: 8, md: 14, lg: 18, xl: 22 };
