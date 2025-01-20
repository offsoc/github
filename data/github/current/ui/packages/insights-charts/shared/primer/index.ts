import colors from './colors'

export {colors}

type PrimerColors = keyof typeof colors

export enum PrimerColorMode {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

export const PRIMER_FONT_STACK =
  'BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"'

export const getColorMode = (): PrimerColorMode => {
  const colorMode = document.querySelector('html')?.getAttribute('data-color-mode')

  switch (colorMode) {
    case 'auto':
      return PrimerColorMode.Auto
    case 'dark':
      return PrimerColorMode.Dark
    default:
      return PrimerColorMode.Light
  }
}

export const getTheme = (): PrimerColors => {
  const darkTheme = (document.querySelector('html')?.getAttribute('data-dark-theme') as PrimerColors) || 'dark'
  const lightTheme = (document.querySelector('html')?.getAttribute('data-light-theme') as PrimerColors) || 'light'
  const colorMode = getColorMode()

  if (colorMode === PrimerColorMode.Dark) {
    return darkTheme
  }

  if (colorMode === PrimerColorMode.Light) {
    return lightTheme
  }

  if (colorMode === PrimerColorMode.Auto) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return darkTheme
    }

    return lightTheme
  }

  return lightTheme
}
