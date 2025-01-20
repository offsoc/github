import {testIdProps} from '@github-ui/test-id-props'
import {Text, ThemeProvider, useTheme} from '@primer/react'
import {render, renderHook, screen} from '@testing-library/react'

import {themeGetSx} from '../../client/helpers/theme-get-sx'

test('should return a color when that color is defined by a theme', () => {
  const partialTheme = {
    colors: {
      fg: {
        default: 'red',
      },
    },
  }
  expect(themeGetSx('colors.fg.default')(partialTheme)).toEqual(partialTheme.colors.fg.default)
})

test('should throw when a color is not defined by a theme', () => {
  const partialTheme = {
    colors: {
      fg: {
        default: 'red',
      },
    },
  }
  expect(() => themeGetSx('colors.fg.muted')(partialTheme)).toThrow()
})

test('should work for a primer theme, from use theme', () => {
  const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider})
  expect(themeGetSx('colors.fg.default')(result.current.theme)).toEqual(result.current.theme!.colors.fg.default)
})

test('should throw for a primer theme, when passed an unexpected value', () => {
  const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider})
  // @ts-expect-error this argument is not a valid string type for this function
  expect(() => themeGetSx('unexpected.value')(result.current.theme)).toThrow()
})

test('should return the proper value when used in SX', () => {
  let theme: ReturnType<typeof useTheme>
  const Component = () => {
    theme = useTheme()
    return <Text {...testIdProps('test-element')} sx={{color: themeGetSx('colors.fg.default')}} />
  }
  render(<Component />, {
    wrapper: ThemeProvider,
  })

  expect(screen.getByTestId('test-element')).toHaveStyleRule('color', theme!.theme!.colors.fg.default.replace(/ /g, ''))
})
