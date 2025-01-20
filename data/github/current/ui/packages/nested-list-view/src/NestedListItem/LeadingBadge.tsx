import {testIdProps} from '@github-ui/test-id-props'
import {type ColorName, useNamedColor} from '@github-ui/use-named-color'
import {Box, Label, type LabelProps, Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {useEffect} from 'react'

import {useNestedListItemLeadingBadge} from './context/LeadingBadgeContext'
import styles from './LeadingBadge.module.css'

export type NestedListItemLeadingBadgeProps = Pick<LabelProps, 'variant' | 'size'> & {
  /**
   * Text that is shown as a visible Primer Label and as visually hidden text for screen readers.
   */
  title: string

  /**
   * Styling for the div surrounding the label
   */
  containerSx?: BetterSystemStyleObject

  /**
   * The link that will be opened when the item is clicked
   */
  href?: string

  /** Container class name. */
  className?: string

  color?: ColorName
}

export function NestedListItemLeadingBadge({
  title,
  containerSx,
  href,
  className,
  color,
  ...props
}: NestedListItemLeadingBadgeProps) {
  const {setLeadingBadge} = useNestedListItemLeadingBadge()
  useEffect(() => setLeadingBadge(title), [setLeadingBadge, title])

  const {fg, bg, border} = useNamedColor(color)

  const content = (
    <>
      <Label
        className={styles.titleLabel}
        {...testIdProps('nested-list-view-item-leading-badge-label')}
        style={{color: fg, backgroundColor: bg, borderColor: border}}
        {...props}
      >
        <span className={styles.titleText}>{title}</span>
      </Label>
      <span className="sr-only">: </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        {...testIdProps('nested-list-view-item-leading-badge')}
        className={clsx(styles.container, className)}
        sx={containerSx}
        aria-hidden
        tabIndex={-1} // Suppression of secondary info and actions
      >
        {content}
      </Link>
    )
  } else {
    return (
      <Box
        as="span"
        {...testIdProps('nested-list-view-item-leading-badge')}
        className={clsx(styles.container, className)}
        sx={containerSx}
      >
        {content}
      </Box>
    )
  }
}
