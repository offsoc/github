import {testIdProps} from '@github-ui/test-id-props'
import {Box, Label, type LabelProps, Link} from '@primer/react'
import {clsx} from 'clsx'
import {useEffect} from 'react'

import type {PrefixedStylableProps} from '../types'
import styles from './LeadingBadge.module.css'
import {useListItemLeadingBadge} from './LeadingBadgeContext'

export type ListItemLeadingBadgeProps = Pick<LabelProps, 'variant' | 'size'> & {
  /**
   * Text that is shown as a visible Primer Label and as visually hidden text for screen readers.
   */
  title: string

  /**
   * The link that will be opened when the item is clicked
   */
  href?: string
} & PrefixedStylableProps<'container'>

export const ListItemLeadingBadge = ({
  title,
  containerStyle,
  containerClassName,
  containerSx,
  href,
  ...props
}: ListItemLeadingBadgeProps) => {
  const {setLeadingBadge} = useListItemLeadingBadge()
  useEffect(() => setLeadingBadge(title), [setLeadingBadge, title])

  const content = (
    <>
      <Label className={styles.label} {...testIdProps('list-view-item-leading-badge-label')} {...props}>
        <span className={styles.labelText}>{title}</span>
      </Label>
      <span className="sr-only">: </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        {...testIdProps('list-view-item-leading-badge')}
        style={containerStyle}
        sx={containerSx}
        className={clsx(styles.container, styles.containerLink, containerClassName)}
      >
        {content}
      </Link>
    )
  } else {
    return (
      <Box
        {...testIdProps('list-view-item-leading-badge')}
        style={containerStyle}
        sx={containerSx}
        className={clsx(styles.container, containerClassName)}
      >
        {content}
      </Box>
    )
  }
}
