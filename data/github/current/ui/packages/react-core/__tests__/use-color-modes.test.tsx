import {renderHook, waitFor} from '@testing-library/react'
import useColorModes from '../use-color-modes'

function setMode({mode, lightTheme, darkTheme}: {mode?: string; lightTheme?: string; darkTheme?: string}) {
  const {documentElement} = document

  if (mode) {
    documentElement.setAttribute('data-color-mode', mode)
  } else {
    documentElement.removeAttribute('data-color-mode')
  }

  if (lightTheme) {
    documentElement.setAttribute('data-light-theme', lightTheme)
  } else {
    documentElement.removeAttribute('data-light-theme')
  }

  if (darkTheme) {
    documentElement.setAttribute('data-dark-theme', darkTheme)
  } else {
    documentElement.removeAttribute('data-dark-theme')
  }
}

describe('useColorModes', () => {
  it('should pull color mode from the documentElement', () => {
    setMode({mode: 'auto', lightTheme: 'light1', darkTheme: 'dark2'})

    const {result} = renderHook(() => useColorModes())
    expect(result.current).toEqual({colorMode: 'auto', dayScheme: 'light1', nightScheme: 'dark2'})
  })

  it('should handle light mode', () => {
    setMode({mode: 'light', lightTheme: 'light 3', darkTheme: 'dark-dimmed'})

    const {result} = renderHook(() => useColorModes())
    expect(result.current).toEqual({colorMode: 'day', dayScheme: 'light 3', nightScheme: 'dark-dimmed'})
  })

  it('should handle dark mode', () => {
    setMode({mode: 'dark', lightTheme: 'light', darkTheme: 'dark'})

    const {result} = renderHook(() => useColorModes())
    expect(result.current).toEqual({colorMode: 'night', dayScheme: 'light', nightScheme: 'dark'})
  })

  it('should default to auto for unknown mode', () => {
    setMode({mode: 'something_else', lightTheme: 'light', darkTheme: 'dark'})

    const {result} = renderHook(() => useColorModes())
    expect(result.current).toEqual({colorMode: 'auto', dayScheme: 'light', nightScheme: 'dark'})
  })

  it('should handle missing attributes', () => {
    setMode({})

    const {result} = renderHook(() => useColorModes())
    expect(result.current).toEqual({colorMode: 'auto', dayScheme: undefined, nightScheme: undefined})
  })

  it('should detect changes to color mode attributes', async () => {
    const {documentElement} = document

    setMode({mode: 'auto', lightTheme: 'light', darkTheme: 'dark'})
    const view = renderHook(() => useColorModes())

    // change color mode
    documentElement.setAttribute('data-color-mode', 'light')

    await waitFor(() => {
      expect(view.result.current).toEqual({colorMode: 'day', dayScheme: 'light', nightScheme: 'dark'})
    })

    // change light theme
    documentElement.setAttribute('data-light-theme', 'light 2')

    await waitFor(() => {
      expect(view.result.current).toEqual({colorMode: 'day', dayScheme: 'light 2', nightScheme: 'dark'})
    })

    // change dark theme
    documentElement.setAttribute('data-dark-theme', 'dark 2')

    await waitFor(() => {
      expect(view.result.current).toEqual({colorMode: 'day', dayScheme: 'light 2', nightScheme: 'dark 2'})
    })
  })
})
