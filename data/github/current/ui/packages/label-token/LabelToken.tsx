// Once https://github.com/github/primer/issues/2040 is fixed this can be removed
import {useTheme} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {parseToHsla, parseToRgba} from 'color2k'
import {forwardRef, useMemo} from 'react'

import TokenBase, {defaultTokenSize, isTokenInteractive, type TokenBaseProps} from './TokenBase'
import {TokenTextContainer} from './TokenTextContainer'

export interface LabelTokenProps extends TokenBaseProps {
  /**
   * The color that corresponds to the label
   */
  fillColor?: string

  /**
   * standardize href as a prop on all possible 'as' types, since otherwise we can't destructure it properly
   */
  href?: string
}

const tokenBorderWidthPx = 1

const LabelToken = forwardRef<HTMLElement, LabelTokenProps>((props, forwardedRef) => {
  const {colorScheme} = useTheme()

  const isHighContrast = useMemo(() => colorScheme?.includes('high_contrast'), [colorScheme])

  const lightModeStyles = useMemo(
    () => ({
      '--lightness-threshold': '0.453',
      '--border-threshold': '0.96',
      '--background-alpha': '0.20',
      '--border-alpha': 'max(0, min(calc((var(--perceived-lightness) - var(--border-threshold)) * 100), 1))',
      background: 'rgb(var(--label-r), var(--label-g), var(--label-b))',
      color: 'hsl(0deg, 0%, calc(var(--lightness-switch) * 100%))',
      borderWidth: tokenBorderWidthPx,
      borderStyle: 'solid',
      borderColor:
        'hsla(var(--label-h), calc(var(--label-s) * 1%), calc((var(--label-l) - 25) * 1%), var(--border-alpha))',
    }),
    [],
  )

  const darkModeStyles = useMemo(
    () => ({
      '--lightness-threshold': '0.6',
      '--background-alpha': '0.18',
      '--border-alpha': isHighContrast ? '0.9' : '0.3',
      '--lighten-by':
        'calc(((var(--lightness-threshold) - var(--perceived-lightness)) * 100) * var(--lightness-switch))',
      borderWidth: tokenBorderWidthPx,
      borderStyle: 'solid',
      background: 'rgba(var(--label-r), var(--label-g), var(--label-b), var(--background-alpha))',
      color: 'hsl(var(--label-h), calc(var(--label-s) * 1%), calc((var(--label-l) + var(--lighten-by)) * 1%))',
      borderColor:
        'hsla(var(--label-h), calc(var(--label-s) * 1%), calc((var(--label-l) + var(--lighten-by)) * 1%), var(--border-alpha))',
    }),
    [isHighContrast],
  )

  const {as, fillColor = '#999', onRemove, id, isSelected, text, size, hideRemoveButton, href, ...rest} = props
  const interactiveTokenProps = {
    as,
    href,
  }

  const hasMultipleActionTargets = isTokenInteractive(props) && Boolean(onRemove) && !hideRemoveButton
  const labelStyles: BetterSystemStyleObject = useMemo(() => {
    const [r, g, b] = parseToRgba(fillColor)
    const [h, s, l] = parseToHsla(fillColor)

    // label hack taken from https://github.com/github/github/blob/master/app/assets/stylesheets/hacks/hx_primer-labels.scss#L43-L108
    // this logic should eventually live in primer/components. Also worthy of note is that the dotcom hack code will be moving to primer/css soon.
    return {
      '--label-r': String(r),
      '--label-g': String(g),
      '--label-b': String(b),
      '--label-h': String(Math.round(h)),
      '--label-s': String(Math.round(s * 100)),
      '--label-l': String(Math.round(l * 100)),
      '--perceived-lightness':
        'calc(((var(--label-r) * 0.2126) + (var(--label-g) * 0.7152) + (var(--label-b) * 0.0722)) / 255)',
      '--lightness-switch': 'max(0, min(calc((var(--perceived-lightness) - var(--lightness-threshold)) * -1000), 1))',
      '--border-color': 'var(--borderColor-muted, var(--color-border-subtle))',
      paddingRight: hideRemoveButton || !onRemove ? undefined : 0,
      position: 'relative',
      minWidth: 0,
      overflow: 'hidden',
      ...(colorScheme?.includes('light') ? lightModeStyles : darkModeStyles),
      ...(isSelected
        ? {
            background:
              colorScheme === 'light'
                ? 'hsl(var(--label-h), calc(var(--label-s) * 1%), calc((var(--label-l) - 5) * 1%))'
                : darkModeStyles.background,
            ':focus': {
              outline: 'none',
            },
            ':after': {
              content: '""',
              position: 'absolute',
              zIndex: 1,
              top: `-${tokenBorderWidthPx * 2}px`,
              right: `-${tokenBorderWidthPx * 2}px`,
              bottom: `-${tokenBorderWidthPx * 2}px`,
              left: `-${tokenBorderWidthPx * 2}px`,
              display: 'block',
              pointerEvents: 'none',
              boxShadow: `0 0 0 ${tokenBorderWidthPx * 2}px ${
                colorScheme === 'light'
                  ? 'rgb(var(--label-r), var(--label-g), var(--label-b))'
                  : 'hsl(var(--label-h), calc(var(--label-s) * 1%), calc((var(--label-l) + var(--lighten-by)) * 1%))'
              }`,
              borderRadius: '999px',
            },
          }
        : {}),
    }
  }, [colorScheme, fillColor, isSelected, hideRemoveButton, onRemove, lightModeStyles, darkModeStyles])

  return (
    <TokenBase
      onRemove={onRemove}
      id={id?.toString()}
      isSelected={isSelected}
      text={text}
      size={size}
      sx={labelStyles}
      {...(!hasMultipleActionTargets ? interactiveTokenProps : {})}
      {...rest}
      ref={forwardedRef}
    >
      <TokenTextContainer {...(hasMultipleActionTargets ? interactiveTokenProps : {})}>{text}</TokenTextContainer>
    </TokenBase>
  )
})

LabelToken.defaultProps = {
  fillColor: '#999',
  size: defaultTokenSize,
}

LabelToken.displayName = 'IssueLabelToken'

export {LabelToken}
