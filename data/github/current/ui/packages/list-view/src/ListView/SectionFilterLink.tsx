import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import type {LinkProps} from '@primer/react'
import {CounterLabel, Text} from '@primer/react'
import {clsx} from 'clsx'
import type {ReactElement, ReactNode} from 'react'

import type {StylableProps} from '../types'
import styles from './SectionFilterLink.module.css'

export type ListViewSectionFilterLinks = Array<ReactElement<typeof ListViewSectionFilterLink>>

export type ListViewSectionFilterLinkProps = Omit<LinkProps, 'as' | 'sx'> &
  StylableProps & {
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
  }

/**
 * Represents a single categorical section filter. Used to allow a user to filter the ListView's list items to only
 * show those matching this filter.
 */
export const ListViewSectionFilterLink = ({
  href,
  title,
  count,
  isSelected = false,
  isLoading = false,
  className,
  ...rest
}: ListViewSectionFilterLinkProps) => (
  <Text
    as="a"
    href={href}
    className={clsx(styles.container, isSelected && styles.selected, className)}
    {...testIdProps('list-view-section-filter-link')}
    aria-current={isSelected ? 'true' : undefined}
    {...rest}
  >
    <div className={styles.title}>{title}</div>
    {count !== undefined && (
      <CounterLabel className={clsx(styles.count, isLoading && styles.loading)}>{count}</CounterLabel>
    )}
    {count === undefined && isLoading && (
      <LoadingSkeleton variant="rounded" height="18px" width="32px" className={clsx(styles.counterLabelSkeleton)} />
    )}
  </Text>
)
