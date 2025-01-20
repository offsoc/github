import {useEffect, useState} from 'react'

const document = globalThis.document as Document | undefined

export interface ColorModeOptions {
  colorMode?: string
  lightTheme: string
  darkTheme: string
}

function getSchemeFromMode(mode?: string) {
  switch (mode) {
    case 'light':
      return 'day'
    case 'dark':
      return 'night'
    default:
      return 'auto'
  }
}

function getColorModes(options: ColorModeOptions | DOMStringMap) {
  const mode = options.colorMode

  return {
    colorMode: getSchemeFromMode(mode),
    dayScheme: options.lightTheme,
    nightScheme: options.darkTheme,
  } as const
}

let ssrOptions: ColorModeOptions | undefined

export function setColorModeOptions(options: ColorModeOptions) {
  ssrOptions = options
}

function useColorModesSSR() {
  return getColorModes(ssrOptions || {})
}

function useColorModes() {
  const {documentElement} = document!
  // eslint-disable-next-line github/no-dataset
  const [colorMode, setColorMode] = useState(() => getColorModes(documentElement.dataset))

  useEffect(() => {
    // Update color modes any time color mode attributes change on the base html document element
    // eslint-disable-next-line github/no-dataset
    const observer = new MutationObserver(() => setColorMode(getColorModes(documentElement.dataset)))

    observer.observe(documentElement, {
      attributes: true,
      attributeFilter: ['data-color-mode', 'data-light-theme', 'data-dark-theme'],
    })

    return () => observer.disconnect()
  }, [documentElement])

  return colorMode
}

export default document ? useColorModes : useColorModesSSR
