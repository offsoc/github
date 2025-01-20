/**
 * Extended from @primer/react story-helpers, adds css variable `data` properties to
 * ensure correct themes are applied for non-react elements
 */
import {useEffect} from 'react'
import {ThemeProvider, themeGet, Box, BaseStyles} from '@primer/react'
import {createGlobalStyle} from 'styled-components'
import type {StoryContext} from './types'

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${themeGet('colors.canvas.default')};
    color: ${themeGet('colors.fg.default')};
  }
`

// only remove padding for multi-theme view grid
const GlobalStyleMultiTheme = createGlobalStyle`
  body {
    padding: 0 !important;
  }
`

export const primerThemes = [
  {value: 'light', left: '☀️', title: 'Light'},
  {value: 'light_colorblind', left: '☀️', title: 'Light Protanopia & Deuteranopia'},
  {value: 'light_tritanopia', left: '☀️', title: 'Light Tritanopia'},
  {value: 'light_high_contrast', left: '☀️', title: 'Light High Contrast'},
  {value: 'dark', left: '🌗', title: 'Dark'},
  {value: 'dark_dimmed', left: '🌗', title: 'Dark Dimmed'},
  {value: 'dark_colorblind', left: '🌗', title: 'Dark Protanopia & Deuteranopia'},
  {value: 'dark_tritanopia', left: '🌗', title: 'Dark Tritanopia'},
  {value: 'dark_high_contrast', left: '🌗', title: 'Dark High Contrast'},
]

export const withThemeProvider = (Story: React.FC<React.PropsWithChildren<StoryContext>>, context: StoryContext) => {
  // used for testing ThemeProvider.stories.tsx
  if (context.parameters.disableThemeDecorator) return Story(context)

  let {theme: colorScheme} = context.globals

  useEffect(() => {
    const colorMode = colorScheme.startsWith('light') ? 'light' : 'dark'
    document.body.setAttribute('data-color-mode', colorMode)

    const themeToSet = colorScheme.startsWith('light') ? 'data-light-theme' : 'data-dark-theme'
    document.body.setAttribute(themeToSet, colorScheme)
  }, [colorScheme])

  if (colorScheme === 'all') {
    return (
      <Box>
        <GlobalStyleMultiTheme />
        {primerThemes.map(theme => (
          <ThemeProvider key={theme.value} colorMode="day" dayScheme={theme.value} nightScheme={theme.value}>
            <BaseStyles
              data-color-mode={theme.value.startsWith('light')? 'light': 'dark'}
              data-dark-theme={theme.value.startsWith('light')? undefined: 'dark'}
              data-light-theme={theme.value.startsWith('light')? 'light': undefined}
            >
              <Box
                sx={{
                  padding: '1rem',
                  height: '100%',
                  backgroundColor: 'canvas.default',
                  color: 'fg.default',
                }}
              >
                <div
                  id={`html-addon-root-${theme.value}`}
                >
                  {Story(context)}
                </div>
              </Box>
            </BaseStyles>
          </ThemeProvider>
        ))}
      </Box>
    )
  }

  return <ThemeProvider colorMode="day" dayScheme={colorScheme} nightScheme={colorScheme}>
    <GlobalStyle />
    <BaseStyles
      data-color-mode={colorScheme.startsWith('light')? 'light': 'dark'}
      data-dark-theme={colorScheme.startsWith('light')? undefined: 'dark'}
      data-light-theme={colorScheme.startsWith('light')? 'light': undefined}>
      <div id="html-addon-root" >
        {Story(context)}
      </div>
    </BaseStyles>
  </ThemeProvider>
}
