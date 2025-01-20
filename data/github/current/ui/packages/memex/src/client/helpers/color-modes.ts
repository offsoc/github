import {theme} from '@primer/react'
/**
 * The color scheme options for the 'light'|'dark' color mode.
 */
type LightColorSchemes = 'light' | 'light_colorblind' | 'light_high_contrast' | 'light_tritanopia' | 'auto'

/**
 * The color scheme options for the 'dark'|'night' color mode.
 */
type DarkColorSchemes = 'dark' | 'dark_colorblind' | 'dark_dimmed' | 'dark_high_contrast' | 'dark_tritanopia' | 'auto'

/**
 * An object as provided by dotcom in the 'theme-preferences' JSONIsland
 */
export interface ThemePreferences {
  mode?: 'light' | 'dark' | 'auto'
  light?: LightColorSchemes
  dark?: DarkColorSchemes
  markdown_fixed_width_font: boolean
  preferred_emoji_skin_tone?: number
}

/**
 * A slightly stricter set of types compatible with the prc {@see ThemeProviderProps} api.
 */
export interface ThemeProviderPropsOverride {
  colorMode?: 'day' | 'night' | 'auto' | undefined
  dayScheme?: LightColorSchemes
  nightScheme?: DarkColorSchemes
}

function translateColorMode(colorMode: ThemeProviderPropsOverride['colorMode']): ThemePreferences['mode'] {
  switch (colorMode) {
    case 'day':
      return 'light'
    case 'night':
      return 'dark'
    default:
      return colorMode
  }
}

function translateMode(colorMode: ThemePreferences['mode']): ThemeProviderPropsOverride['colorMode'] {
  switch (colorMode) {
    case 'light':
      return 'day'
    case 'dark':
      return 'night'
    default:
      return colorMode
  }
}

/**
 * A default theme preferences object, if none is provided.
 */
const defaultThemePreferences: ThemePreferences = {
  mode: 'auto',
  light: 'light',
  dark: 'dark',
  markdown_fixed_width_font: false,
}

/**
 * A default theme provider props object, if none is provided.
 */
const defaultThemeProviderProps: ThemeProviderPropsOverride = {
  colorMode: 'auto',
  dayScheme: 'light',
  nightScheme: 'dark',
}

/**
 * Converts a {@see ThemePreferences} object to a {@see ThemeProviderPropsOverride} object
 *
 * When a value that might not be a supported theme is seen, try to get close to a theme that is
 * available.  This will not be ideal, and might be bad for a user, but at least it should blend a bit
 * better with the other colors of things which might be rendered by the dotcom shell, rather than falling back to
 * light mode - potentially, and leaving things often illegible
 */
export function getThemePropsFromThemePreferences(
  tpd?: Pick<ThemePreferences, 'mode' | 'light' | 'dark'>,
): ThemeProviderPropsOverride {
  if (!tpd) return defaultThemeProviderProps
  let dayScheme: LightColorSchemes | undefined
  if (tpd.light) {
    if (tpd.light in theme.colorSchemes) {
      dayScheme = tpd.light
    } else if (tpd.light.startsWith('light')) {
      dayScheme = 'light'
    }
  }

  let nightScheme: DarkColorSchemes | undefined
  if (tpd.dark) {
    if (tpd.dark in theme.colorSchemes) {
      nightScheme = tpd.dark
      /**
       * attempt to normalize
       */
    } else if (tpd.dark.startsWith('dark')) {
      nightScheme = 'dark'
    }
  }
  return {
    colorMode: translateMode(tpd.mode),
    dayScheme,
    nightScheme,
  }
}

/**
 * Converts a {@link ThemeProviderPropsOverride} object to a {@link ThemePreferences} object
 */
export function getThemePreferencesFromThemeProps(
  tp?: Partial<ThemeProviderPropsOverride> | undefined,
): ThemePreferences {
  if (!tp) {
    return defaultThemePreferences
  }
  return {
    ...defaultThemePreferences,
    mode: translateColorMode(tp?.colorMode) ?? 'light',
    light: tp.dayScheme,
    dark: tp.nightScheme,
  }
}
