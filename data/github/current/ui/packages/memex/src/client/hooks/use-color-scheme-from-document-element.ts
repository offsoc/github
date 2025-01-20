import isEqual from 'lodash-es/isEqual'
import {useSyncExternalStore} from 'react'

import type {ThemePreferences} from '../helpers/color-modes'
import {getInitialState} from '../helpers/initial-state'
import {useLazyRef} from './common/use-lazy-ref'

export function useColorSchemeFromDocumentElement() {
  const cache = useLazyRef<Pick<ThemePreferences, 'mode' | 'light' | 'dark'>>(getThemePreferences)

  return useSyncExternalStore(subscribe, () => {
    const nextProps = getThemePreferences()
    if (isEqual(cache.current, nextProps)) return cache.current
    cache.current = nextProps
    return nextProps
  })
}

function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-color-mode', 'data-light-theme', 'data-dark-theme'],
  })
  return () => {
    observer.disconnect()
  }
}

function getDocumentColorScheme() {
  const {dataset} = document.documentElement
  return {
    mode: dataset.colorMode,
    light: dataset.lightTheme,
    dark: dataset.darkTheme,
  } as Pick<ThemePreferences, 'mode' | 'light' | 'dark'>
}

function getThemePreferences() {
  const scheme = getDocumentColorScheme()
  const {
    themePreferences: {markdown_fixed_width_font, ...colorSchemePreferences},
  } = getInitialState()
  return {
    mode: scheme.mode ?? colorSchemePreferences?.mode,
    light: scheme.light ?? colorSchemePreferences.light,
    dark: scheme.dark ?? colorSchemePreferences?.dark,
  }
}
