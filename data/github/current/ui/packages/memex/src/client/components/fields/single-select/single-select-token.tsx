import {testIdProps} from '@github-ui/test-id-props'
import {useNamedColor} from '@github-ui/use-named-color'
import {Token, type TokenProps} from '@primer/react'
import {forwardRef, type MouseEventHandler} from 'react'

import type {NewOption, PersistedOption} from '../../../api/columns/contracts/single-select'
import {SanitizedHtml} from '../../dom/sanitized-html'

interface SingleSelectTokenProps extends Omit<TokenProps, 'text'> {
  option: PersistedOption | NewOption
}

export const SingleSelectToken = forwardRef<HTMLElement, SingleSelectTokenProps>(
  ({option, onClick: externalOnClick, sx, ...tokenProps}, ref) => {
    const onClick: MouseEventHandler<HTMLSpanElement | HTMLButtonElement | HTMLAnchorElement> = event => {
      // Dont call handler if click target is a link. Really this is a hacky workaround for markup that isn't very good
      // (buttons should not contain interactive content like links) but we have to address this as a direct consequence
      // of our decision to allow links in single-select option values.
      if (event.target instanceof HTMLAnchorElement) event.stopPropagation()
      else externalOnClick?.(event)
    }

    const isInteractive = !!externalOnClick
    const color = useNamedColor(option.color)
    const nameHtml = 'nameHtml' in option ? option.nameHtml : option.name

    return (
      <Token
        sx={{
          bg: color.bg,
          color: color.fg,
          borderColor: color.border,
          cursor: isInteractive ? 'pointer' : 'default',
          ':hover': {
            bg: color.bg,
            color: isInteractive ? color.accent : color.fg,
            borderColor: color.border,
            boxShadow: isInteractive ? undefined : 'none',
          },
          overflow: 'hidden',
          ...sx,
        }}
        ref={ref}
        onClick={onClick}
        text={<SanitizedHtml>{nameHtml}</SanitizedHtml>}
        {...testIdProps('single-select-token')}
        {...tokenProps}
      />
    )
  },
)
SingleSelectToken.displayName = 'SingleSelectToken'
