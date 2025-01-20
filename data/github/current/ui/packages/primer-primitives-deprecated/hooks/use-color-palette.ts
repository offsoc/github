import {colors} from '../colors'
import {useTheme} from '@primer/react'

export type Palettes = typeof colors
export type ColorScheme = keyof Palettes
export type Palette = Palettes[ColorScheme]

export function useColorPalette(): Palette {
  const {resolvedColorScheme} = useTheme() as {resolvedColorScheme: ColorScheme | undefined}
  return colors[resolvedColorScheme ?? 'light']
}
