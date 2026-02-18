const lightColors = {
  white: '#FFFFFF',
  black: '#000000',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#747474',
  textMuted: '#6B7280',
  textTimestamp: '#484859',

  border: '#DFDFDF',
  divider: '#DFDFDF',
  disabled: '#C7C7C7',

  userBubble: '#EFF3F8',
  loadingDotsBg: '#F8F8F8',
  loadingDotsText: '#BDBDBD',
  trackBackground: '#F3F4F6',
  progressTrack: '#EAEAEA',
  placeholder: '#ABACBC',

  overlay: 'rgba(0,0,0,0.5)',
  fadeGradient: 'rgba(255,255,255,0)',

  nutrient: {
    kcal: '#2DCC74',
    protein: '#FFA931',
    fat: '#F3D511',
    carbs: '#11B7F3',
  },

  graph: {
    underGoal: '#2DCC74',
    overGoal: '#217596',
    legendUnder: '#10B981',
    legendOver: '#0E7490',
    label: '#999999',
    dayLabel: '#6B7280',
    goalLine: '#2DCC74',
  },

  gradient: {
    buttonActive: ['#606060', '#060606'] as const,
    buttonDisabled: ['#B0B0B0', '#B0B0B0'] as const,
  },

  drawer: {
    activeBackground: '#FFFFFF',
    activeTint: '#111111',
    fallbackAvatar: '#111111',
    footerText: '#454545',
  },

  auth: {
    oauthBorder: '#000000',
  },
} as const;

const darkColors = {
  white: '#000000',
  black: '#FFFFFF',
  background: '#121212',
  text: '#E8E8E8',
  textSecondary: '#A0A0A0',
  textMuted: '#8E95A0',
  textTimestamp: '#A0A0AA',

  border: '#2C2C2E',
  divider: '#2C2C2E',
  disabled: '#555555',

  userBubble: '#1E2A3A',
  loadingDotsBg: '#1C1C1E',
  loadingDotsText: '#555555',
  trackBackground: '#1C1C1E',
  progressTrack: '#2C2C2E',
  placeholder: '#606070',

  overlay: 'rgba(0,0,0,0.7)',
  fadeGradient: 'rgba(18,18,18,0)',

  nutrient: {
    kcal: '#2DCC74',
    protein: '#FFA931',
    fat: '#F3D511',
    carbs: '#11B7F3',
  },

  graph: {
    underGoal: '#2DCC74',
    overGoal: '#217596',
    legendUnder: '#10B981',
    legendOver: '#0E7490',
    label: '#777777',
    dayLabel: '#8E95A0',
    goalLine: '#2DCC74',
  },

  gradient: {
    buttonActive: ['#A0A0A0', '#F0F0F0'] as const,
    buttonDisabled: ['#444444', '#444444'] as const,
  },

  drawer: {
    activeBackground: '#1C1C1E',
    activeTint: '#E8E8E8',
    fallbackAvatar: '#E8E8E8',
    footerText: '#A0A0A0',
  },

  auth: {
    oauthBorder: '#E8E8E8',
  },
} as const;

export type ColorPalette = typeof lightColors;

export const palettes = { light: lightColors, dark: darkColors };
