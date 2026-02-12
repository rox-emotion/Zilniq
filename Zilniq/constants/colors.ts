export const colors = {
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
