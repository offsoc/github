const colors = {
  fg: {default: '#c9d1d9', muted: '#8b949e', subtle: '#6e7681', onEmphasis: '#ffffff'},
  canvas: {default: '#0d1117', overlay: '#161b22', inset: '#010409', subtle: '#161b22'},
  border: {default: '#30363d', muted: '#21262d', subtle: 'rgba(240,246,252,0.1)'},
  shadow: {
    small: '0 0 transparent',
    medium: '0 3px 6px #010409',
    large: '0 8px 24px #010409',
    extraLarge: '0 12px 48px #010409',
  },
  neutral: {
    emphasisPlus: '#6e7681',
    emphasis: '#6e7681',
    muted: 'rgba(110,118,129,0.4)',
    subtle: 'rgba(110,118,129,0.1)',
  },
  accent: {fg: '#58a6ff', emphasis: '#1f6feb', muted: 'rgba(56,139,253,0.4)', subtle: 'rgba(56,139,253,0.15)'},
  success: {fg: '#58a6ff', emphasis: '#1f6feb', muted: 'rgba(56,139,253,0.4)', subtle: 'rgba(56,139,253,0.15)'},
  attention: {fg: '#d29922', emphasis: '#9e6a03', muted: 'rgba(187,128,9,0.4)', subtle: 'rgba(187,128,9,0.15)'},
  severe: {fg: '#d47616', emphasis: '#b76100', muted: 'rgba(212,118,22,0.4)', subtle: 'rgba(212,118,22,0.15)'},
  danger: {fg: '#d47616', emphasis: '#b76100', muted: 'rgba(212,118,22,0.4)', subtle: 'rgba(212,118,22,0.15)'},
  open: {fg: '#ec8e2c', emphasis: '#b76100', muted: 'rgba(212,118,22,0.4)', subtle: 'rgba(212,118,22,0.15)'},
  closed: {fg: '#8b949e', emphasis: '#6e7681', muted: 'rgba(110,118,129,0.4)', subtle: 'rgba(110,118,129,0.1)'},
  done: {fg: '#a371f7', emphasis: '#8957e5', muted: 'rgba(163,113,247,0.4)', subtle: 'rgba(163,113,247,0.15)'},
  sponsors: {fg: '#db61a2', emphasis: '#bf4b8a', muted: 'rgba(219,97,162,0.4)', subtle: 'rgba(219,97,162,0.15)'},
  primer: {
    fg: {disabled: '#484f58'},
    canvas: {backdrop: 'rgba(1,4,9,0.8)', sticky: 'rgba(13,17,23,0.95)'},
    border: {active: '#f78166', contrast: 'rgba(255,255,255,0.2)'},
    shadow: {highlight: '0 0 transparent', inset: '0 0 transparent', focus: '0 0 0 3px #0c2d6b'},
  },
  scale: {
    black: '#010409',
    white: '#ffffff',
    gray: [
      '#f0f6fc',
      '#c9d1d9',
      '#b1bac4',
      '#8b949e',
      '#6e7681',
      '#484f58',
      '#30363d',
      '#21262d',
      '#161b22',
      '#0d1117',
    ],
    blue: [
      '#cae8ff',
      '#a5d6ff',
      '#79c0ff',
      '#58a6ff',
      '#388bfd',
      '#1f6feb',
      '#1158c7',
      '#0d419d',
      '#0c2d6b',
      '#051d4d',
    ],
    green: [
      '#cae8ff',
      '#a5d6ff',
      '#79c0ff',
      '#58a6ff',
      '#388bfd',
      '#1f6feb',
      '#1158c7',
      '#0d419d',
      '#0c2d6b',
      '#051d4d',
    ],
    yellow: [
      '#f8e3a1',
      '#f2cc60',
      '#e3b341',
      '#d29922',
      '#bb8009',
      '#9e6a03',
      '#845306',
      '#693e00',
      '#4b2900',
      '#341a00',
    ],
    orange: [
      '#ffe2bb',
      '#ffc981',
      '#fdac54',
      '#ec8e2c',
      '#d47616',
      '#b76100',
      '#914d04',
      '#6c3906',
      '#4e2906',
      '#331c04',
    ],
    red: ['#ffe2bb', '#ffc981', '#fdac54', '#ec8e2c', '#d47616', '#b76100', '#914d04', '#6c3906', '#4e2906', '#331c04'],
    purple: [
      '#eddeff',
      '#e2c5ff',
      '#d2a8ff',
      '#bc8cff',
      '#a371f7',
      '#8957e5',
      '#6e40c9',
      '#553098',
      '#3c1e70',
      '#271052',
    ],
    pink: [
      '#ffdaec',
      '#ffbedd',
      '#ff9bce',
      '#f778ba',
      '#db61a2',
      '#bf4b8a',
      '#9e3670',
      '#7d2457',
      '#5e103e',
      '#42062a',
    ],
    coral: [
      '#ffddd2',
      '#ffc2b2',
      '#ffa28b',
      '#f78166',
      '#ea6045',
      '#cf462d',
      '#ac3220',
      '#872012',
      '#640d04',
      '#460701',
    ],
  },
} as const

export default colors
