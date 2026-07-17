import { Platform } from 'react-native';

export const colors = {
  tinta: '#0A130E',
  tinta2: '#0F1E16',
  libro: '#153426',
  libro2: '#1D4A36',
  libro3: '#0D2116',
  papel: '#F5EFDD',
  papel2: '#EBDFBD',
  papel3: '#DECC9C',
  regla: '#D6C6A0',
  margen: '#8C3226',
  laton: '#A57A22',
  latonClaro: '#DDB255',
  latonOscuro: '#6E5320',
  texto: '#1A2620',
  textoSuave: '#5C6B5A',
  blanco: '#FBF8EE',
  debe: '#953527',
  haber: '#1C6B48',
  cardBorder: '#E4DAC0',
};

export const fonts = {
  serif: 'InstrumentSerif-Regular',
  serifItalic: 'InstrumentSerif-Italic',
  sans: 'Archivo-Regular',
  sansMedium: 'Archivo-Medium',
  sansSemiBold: 'Archivo-SemiBold',
  sansBold: 'Archivo-Bold',
  mono: 'IBMPlexMono-Regular',
  monoMedium: 'IBMPlexMono-Medium',
  monoSemiBold: 'IBMPlexMono-SemiBold',
};

export const fontAssets = {
  'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
  'InstrumentSerif-Italic': require('./assets/fonts/InstrumentSerif-Italic.ttf'),
  'Archivo-Regular': require('./assets/fonts/Archivo-Regular.ttf'),
  'Archivo-Medium': require('./assets/fonts/Archivo-Medium.ttf'),
  'Archivo-SemiBold': require('./assets/fonts/Archivo-SemiBold.ttf'),
  'Archivo-Bold': require('./assets/fonts/Archivo-Bold.ttf'),
  'IBMPlexMono-Regular': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
  'IBMPlexMono-Medium': require('./assets/fonts/IBMPlexMono-Medium.ttf'),
  'IBMPlexMono-SemiBold': require('./assets/fonts/IBMPlexMono-SemiBold.ttf'),
};

// Two-tier elevation system standing in for the CSS --sombra-amb / --sombra-contacto pair.
export function shadow(tier = 'contact') {
  const elevated = tier === 'ambient';
  return Platform.select({
    ios: {
      shadowColor: '#060D09',
      shadowOffset: { width: 0, height: elevated ? 12 : 2 },
      shadowOpacity: elevated ? 0.3 : 0.15,
      shadowRadius: elevated ? 18 : 5,
    },
    android: {
      elevation: elevated ? 9 : 3,
    },
    default: {},
  });
}

export const radius = {
  sm: 10,
  md: 13,
  lg: 15,
  xl: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 22,
};
