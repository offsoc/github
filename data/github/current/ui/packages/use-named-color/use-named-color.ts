import {useTheme} from '@primer/react'

export const colorNames = ['GRAY', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'RED', 'PINK', 'PURPLE'] as const

export type ColorName = (typeof colorNames)[number]

const colorNamesToRoles: Record<Exclude<ColorName, 'GRAY'>, string> = {
  BLUE: 'accent',
  GREEN: 'success',
  YELLOW: 'attention',
  ORANGE: 'severe',
  RED: 'danger',
  PINK: 'sponsors',
  PURPLE: 'done',
}

interface ColorSet {
  /** For canvas backgrounds. */
  bg?: string
  /** For text, whether on the `bg` color or on default `canvas` colors. */
  fg?: string
  /** For borders around the `bg` color. */
  border?: string
  /** For icons and standalone visuals where `fg` is too dark. */
  accent?: string
}

/** Use theme colors by presentational (rather than semantic) names. */
export const useNamedColor = (name: ColorName = 'GRAY'): ColorSet => {
  const {theme, resolvedColorScheme = 'light'} = useTheme()
  const scheme = ignoreColorblindSchemes(resolvedColorScheme)
  const colors = theme?.colorSchemes?.[scheme]?.colors

  if (name === 'GRAY') {
    return {
      bg: colors?.canvas?.subtle,
      fg: colors?.fg?.muted,
      border: colors?.border?.default,
      accent: colors?.fg?.subtle,
    }
  } else {
    const base = colors?.[colorNamesToRoles[name]]
    return {bg: base?.subtle, fg: base?.fg, border: base?.muted, accent: base?.emphasis}
  }
}

/** Helper to validate if a string is an acceptable color name (case sensitive). */
export const isColorName = (str: string): str is ColorName => (colorNames as readonly string[]).includes(str)

/**
 * Colorblind schemes mutate the color scale, ie by making the success color blue instead
 * of green. They even mutate the Primer 'scale' colors, so `green.5` becomes blue. So
 * we have to just ignore them. See: https://github.com/github/primer/issues/1679
 */
const ignoreColorblindSchemes = (scheme: string) =>
  scheme === 'light_colorblind' || scheme === 'light_tritanopia'
    ? 'light'
    : scheme === 'dark_colorblind' || scheme === 'dark_tritanopia'
      ? 'dark'
      : scheme
