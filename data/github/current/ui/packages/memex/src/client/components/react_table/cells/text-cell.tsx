import {Text, type TextProps} from '@primer/react'
import {forwardRef} from 'react'

import {SanitizedHtml} from '../../dom/sanitized-html'

export const TextCell = forwardRef<HTMLElement, TextProps & {dangerousHtml?: string; isDisabled?: boolean}>(
  ({children, dangerousHtml, sx, ...rest}, ref) => {
    const styles = {
      textAlign: 'left',
      whiteSpace: 'nowrap',
      color: 'fg.muted',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      code: {
        fontFamily: 'fonts.mono',
        fontSize: 0,
      },
      ...sx,
    }

    if (dangerousHtml) {
      return (
        <SanitizedHtml {...rest} ref={ref} sx={styles}>
          {dangerousHtml}
        </SanitizedHtml>
      )
    }

    return (
      <Text {...rest} ref={ref} sx={styles}>
        {children}
      </Text>
    )
  },
)

TextCell.displayName = 'TextCell'
