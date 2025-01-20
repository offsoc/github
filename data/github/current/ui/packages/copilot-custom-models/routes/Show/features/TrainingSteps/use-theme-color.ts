import {themeGet, useTheme} from '@primer/react'
import {useCallback} from 'react'

type UseThemeColor = (key: string) => string

// <ThemeProvider colorMode="dark" /> does not overwrite the CSS variables which is why we need
// to use the themeGet function to get the correct value. An example of `color` below is:
// "var(--bgColor-default, var(--color-canvas-default, #0d1117))"
// So because ThemeProvider does not overwrite the CSS variables, we need to use the themeGet
// then parse the color to get the correct color.
export function useThemeColor(): UseThemeColor {
  const {theme} = useTheme()

  const fn = useCallback(
    (key: string) => {
      const color = themeGet(key)({theme})
      return getFallbackColor(color)
    },
    [theme],
  )

  return fn
}

// example input: "var(--bgColor-default, var(--color-canvas-default, #0d1117))"
// example output: "#0d1117"
// example input: "var(--control-transparent-bgColor-active, var(--color-action-list-item-default-active-bg, rgba(177,186,196,0.2)))"
// example output: "rgba(177,186,196,0.2)"
function getFallbackColor(color?: string, fallback?: string): string {
  if (!color) return fallback ?? ''

  const match = color.match(/#\w{6}/)
  if (match?.[0]) return match[0]

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d*)?\)/)
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch
    return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`
  }

  return fallback ?? color
}
