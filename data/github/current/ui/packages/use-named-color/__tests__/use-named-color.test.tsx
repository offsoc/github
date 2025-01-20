import {renderHook} from '@testing-library/react'
import {colorNames, isColorName, useNamedColor} from '../use-named-color'
import {ThemeProvider} from '@primer/react'

const colorSetKeys = ['bg', 'fg', 'border', 'accent'] as const

describe('useNamedColor', () => {
  describe.each([
    'dark',
    'dark_colorblind',
    'dark_dimmed',
    'dark_high_contrast',
    'dark_tritanopia',
    'light',
    'light_colorblind',
    'light_high_contrast',
    'light_tritanopia',
  ] as const)('in `%p` scheme', scheme => {
    it.each(colorNames)('returns full `%p` color set', name => {
      const colors = renderHook(() => useNamedColor(name), {
        wrapper: ({children}) => (
          <ThemeProvider dayScheme={scheme} colorMode="light">
            {children}
          </ThemeProvider>
        ),
      }).result.current

      for (const key of colorSetKeys) expect(colors[key]).toMatch(/(?:#[0-9a-f]{6}|rgba?\(.+\))/i)
    })
  })

  it('returns empty color set when theme is not provided', () => {
    const colors = renderHook(() => useNamedColor('GRAY')).result.current

    for (const key of colorSetKeys) expect(colors[key]).toBeUndefined()
  })
})

describe('isColorName', () => {
  it.each(colorNames)('is true for %p', name => expect(isColorName(name)).toBe(true))

  it.each(['not_color_name', 'red', 'xyz', '123'])('is false for %p', name => expect(isColorName(name)).toBe(false))
})
