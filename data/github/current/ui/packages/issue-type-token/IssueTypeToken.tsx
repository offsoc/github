import {Link, Token, type TokenProps} from '@primer/react'
import {useEffect, useRef, useState} from 'react'
import {colorNames, useNamedColor} from '@github-ui/use-named-color'
import styles from './IssueTypeToken.module.css'
import {Tooltip} from '@primer/react/next'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

export type IssueTypeTokenProps = {
  name: string
  color: string
  href: string
  getTooltipText: (isTextTruncated: boolean) => string | undefined
  sx?: BetterSystemStyleObject
} & Pick<TokenProps, 'size'>

export const IssueTypeToken = ({name, color, href, getTooltipText, size, sx}: IssueTypeTokenProps) => {
  const tokenRef = useRef<HTMLElement>(null)
  const effectiveColor = colorNames.find(c => c === color)
  const {fg, bg, border} = useNamedColor(effectiveColor)
  const [truncated, setTruncated] = useState(false)

  useEffect(() => setTruncated(isTextTruncated(tokenRef.current)), [setTruncated, tokenRef])

  const internal = (
    <Link href={href}>
      <Token
        sx={{
          color: fg,
          backgroundColor: bg,
          borderColor: border,
          cursor: 'unset',
          ...(size === 'large' && {
            height: '32px',
          }),
          ...sx,
        }}
        ref={tokenRef}
        // the span in the text is allowing us to check if the text is truncated
        text={<span className={size === 'large' ? styles.tokenTextLarge : ''}>{name}</span>}
      />
    </Link>
  )

  const tooltipText = getTooltipText(truncated)

  return tooltipText ? (
    <div className={styles.container}>
      <Tooltip text={tooltipText}>{internal}</Tooltip>
    </div>
  ) : (
    <div className={styles.container}>{internal}</div>
  )
}
// This is not bullet proof, since the true inner width of the element is rounded down.
// I think it's pretty good though. See discussion here https://stackoverflow.com/questions/64689074/how-to-check-if-text-is-truncated-by-css-using-javascript
const isTextTruncated = (e: HTMLElement | null): boolean => {
  if (!e || !e.firstElementChild) return false
  return e.firstElementChild.scrollWidth > e.firstElementChild.clientWidth
}
