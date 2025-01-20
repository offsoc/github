import {announceFromElement} from '@github-ui/aria-live'
import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {clsx} from 'clsx'
import type {ReactElement, ReactNode, Suspense} from 'react'
import {isValidElement, useCallback, useEffect, useRef} from 'react'

import densityStyles from '../density-gap.module.css'
import {useNextHeaderTag} from '../hooks/use-next-header-tag'
import type {PrefixedStylableProps, StylableProps} from '../types'
import {ListViewActionBar, type ListViewActionBarProps} from './ActionBar'
import {useListViewId} from './IdContext'
import styles from './Metadata.module.css'
import type {ListViewSectionFilterLinks} from './SectionFilterLink'
import {ListViewSectionFilters} from './SectionFilters'
import {ListViewSelectAllCheckbox} from './SelectAllCheckbox'
import {useListViewSelection} from './SelectionContext'
import {useListViewTitle} from './TitleContext'

export type ListViewMetadataProps = {
  /**
   * The rendered title of the list or information regarding its contents.
   */
  title?: string | ReactNode
  /**
   * Links for applying any categorical, mutually exclusive section filters for the content of the ListView.
   */
  sectionFilters?: ListViewSectionFilterLinks | ReactElement<typeof Suspense>
  /**
   * Used for assistive announcements that are reflective of the visual updates to the list container a sighted user
   * will experience when using the list. Defaults to no announcement. Visually hidden, for screenreaders only.
   */
  assistiveAnnouncement?: string
  /**
   * Callback for when the checkbox for selecting and deselecting all list items is toggled.
   */
  onToggleSelectAll?: (isSelectAllChecked: boolean) => void
  /**
   * Optional additional actions to show. Will not fall into an overflow dropdown menu to accommodate small screen
   * widths.
   */
  children?: ReactNode
} & StylableProps &
  PrefixedStylableProps<'actions'> &
  ListViewActionBarProps

export const ListViewMetadata = ({
  title,
  assistiveAnnouncement,
  sectionFilters,
  children,
  style,
  sx,
  className,
  actionsStyle,
  actionsSx,
  actionsClassName,
  onToggleSelectAll,
  ...actionBarProps
}: ListViewMetadataProps) => {
  const {idPrefix} = useListViewId()
  const {anyItemsSelected} = useListViewSelection()
  const {setHasMetadataTitle} = useListViewTitle()
  const TitleTag = useNextHeaderTag('list-view-metadata')
  const announceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasMetadataTitle(!!title)
  })

  useEffect(() => {
    if (announceRef.current) announceFromElement(announceRef.current)
  }, [assistiveAnnouncement])

  const ListViewAnnouncements = () => {
    return (
      <div
        id={`${idPrefix}-list-view-announcements`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        ref={announceRef}
        {...testIdProps('list-view-announcement-container')}
      >
        {assistiveAnnouncement}
      </div>
    )
  }

  const ListFilters = useCallback(() => {
    if (!sectionFilters) return null

    if (Array.isArray(sectionFilters)) {
      return <ListViewSectionFilters links={sectionFilters} />
    } else if (isValidElement(sectionFilters)) {
      return <>{sectionFilters}</>
    }
    return null
  }, [sectionFilters])

  return (
    <Box
      id={`${idPrefix}-list-view-metadata`}
      className={clsx(styles.container, className, anyItemsSelected && densityStyles.spacious)}
      style={style}
      sx={sx}
      {...testIdProps('list-view-metadata')}
    >
      <ListViewSelectAllCheckbox
        onToggle={(isSelectAllChecked: boolean) => {
          if (onToggleSelectAll) onToggleSelectAll(isSelectAllChecked)
        }}
      />

      <ListFilters />

      {title && !anyItemsSelected && (
        <TitleTag className={styles.heading} {...testIdProps('list-view-header-title')}>
          {title}
        </TitleTag>
      )}

      <ListViewActionBar style={actionsStyle} sx={actionsSx} className={actionsClassName} {...actionBarProps}>
        {children}
      </ListViewActionBar>

      {assistiveAnnouncement && <ListViewAnnouncements />}
    </Box>
  )
}
