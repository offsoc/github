import {testIdProps} from '@github-ui/test-id-props'
import type {LinkProps} from '@primer/react'
import {Box, CounterLabel} from '@primer/react'
import {clsx} from 'clsx'
import type {ReactNode} from 'react'

import styles from './SectionFilterLink.module.css'

export type NestedListViewHeaderSectionFilterLinkProps = Omit<LinkProps, 'as'> & {
  /**
   * The name of this section filter, e.g., "Open" to describe a section filter that shows only open issues.
   */
  title: string
  /**
   * The number of list items in the category this section filter represents. Optional. Changes appearance when
   * `isLoading` is true.
   */
  count?: string | number | ReactNode
  /**
   * The URL to load the list with only items matching this section filter.
   */
  href: string
  /**
   * Optionally specify whether this section filter is currently active. Defaults to not being selected.
   */
  isSelected?: boolean
  /**
   * Optionally specify whether the section filter is still being loaded. Will be used to style the count, if given,
   * when true.
   */
  isLoading?: boolean
  className?: string
}

/**
 * Represents a single categorical section filter. Used to allow a user to filter the ListView's list items to only
 * show those matching this filter.
 */
export const NestedListViewHeaderSectionFilterLink = ({
  href,
  title,
  count,
  isSelected = false,
  isLoading = false,
  sx: externalLinkSx = {},
  className,
  ...rest
}: NestedListViewHeaderSectionFilterLinkProps) => {
  return (
    <Box
      as="a"
      href={href}
      className={clsx(styles.sectionFilterLink, className, isSelected && styles.isSelected)}
      sx={externalLinkSx}
      {...testIdProps('list-view-section-filter-link')}
      aria-current={isSelected ? 'true' : undefined}
      {...rest}
    >
      <div className={styles.title}>{title}</div>
      {typeof count !== 'undefined' && (
        <CounterLabel className={clsx(styles.counterLabel, isLoading && styles.isLoading)}>{count}</CounterLabel>
      )}
    </Box>
  )
}
