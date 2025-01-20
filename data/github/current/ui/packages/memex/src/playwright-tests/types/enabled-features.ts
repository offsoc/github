export const ClientFeature = {
  // Special feature which enables everything
  EVERYTHING: 'EVERYTHING',
  DEBUG_LOGGING: 'DEBUG_LOGGING',
  ABOUT: 'ABOUT',
  KEYBOARD_SHORTCUTS: 'KEYBOARD_SHORTCUTS',
  GROUP_BY_MILESTONE: 'GROUP_BY_MILESTONE',
} as const
export type ClientFeature = ObjectValues<typeof ClientFeature>

export const CLIENT_FEATURES_URL_PARAM = '_memex_features'
