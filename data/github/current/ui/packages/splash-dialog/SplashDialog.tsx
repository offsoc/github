import {Box, useTheme} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {testIdProps} from '@github-ui/test-id-props'
import type {PropsWithChildren} from 'react'

export interface SplashDialogImageProps {
  /**
   * The dark image path. When defined, we render a dark splash cover image when the user's theme resolves to a dark theme.
   */
  darkImagePath: string
  /**
   * The light image path. When defined, we render a light splash cover image when the user's theme resolves to a light theme.
   */
  lightImagePath: string

  /**
   * Override any default CSS styles using the sx property. https://primer.style/react/overriding-styles
   */
  sx?: BetterSystemStyleObject
}

export interface SplashDialogBodyProps {
  /**
   * Override any default CSS styles using the sx property. https://primer.style/react/overriding-styles
   */
  sx?: BetterSystemStyleObject
}

export function SplashDialogImage({darkImagePath, lightImagePath, sx = {}, ...props}: SplashDialogImageProps) {
  const {colorScheme: themeName} = useTheme()
  // We shouldn't need to match on the theme name. Please replace when we have a better way to do this.
  // resolvedColorMode cannot be depended on, since 'day' may map to a dark theme, and 'night' may map to a light theme.
  const isDarkTheme = themeName && /^dark/.test(themeName)
  const imageSrc = isDarkTheme ? darkImagePath : lightImagePath
  const imageGradient = isDarkTheme
    ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(255, 255, 255, 0.04) 100%)'
    : 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.04) 100%)'
  const mergedSx = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: 200,
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    ...sx,
    backgroundImage: `url(${imageSrc})`,
  }
  return (
    <Box sx={mergedSx} {...testIdProps('splash-dialog-image')} {...props}>
      <Box sx={{height: '9px', background: imageGradient}} />
    </Box>
  )
}

export function SplashDialogBody({children, sx = {}, ...props}: PropsWithChildren<SplashDialogBodyProps>) {
  const mergedSx = {
    backgroundColor: 'canvas.default',
    borderBottomLeftRadius: '6px',
    borderBottomRightRadius: '6px',
    padding: '24px',
    ...sx,
  }
  return (
    <Box sx={mergedSx} {...testIdProps('splash-dialog-body')} {...props}>
      {children}
    </Box>
  )
}
