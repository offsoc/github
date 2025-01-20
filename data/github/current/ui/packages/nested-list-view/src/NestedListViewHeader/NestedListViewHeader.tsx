import {testIdProps} from '@github-ui/test-id-props'
import {ChevronDownIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Box, IconButton, type SxProp} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import type {ReactElement, ReactNode, Suspense} from 'react'
import {isValidElement, useCallback, useEffect} from 'react'

import type {NestedListViewCompletionPill} from '../CompletionPill'
import {useNestedListViewProperties} from '../context/PropertiesContext'
import {useNestedListViewSelection} from '../context/SelectionContext'
import {useNestedListViewTitle} from '../context/TitleContext'
import {NestedListViewHeaderActionBar, type NestedListViewHeaderActionBarProps} from './ActionBar'
import styles from './NestedListViewHeader.module.css'
import {NestedListViewHeaderSectionFilters, type NestedListViewHeaderSectionFiltersLinks} from './SectionFilters'
import {NestedListViewHeaderSelectAllCheckbox} from './SelectAllCheckbox'
import type {NestedListViewHeaderTitle} from './Title'

export type NestedListViewHeaderProps = {
  /**
   * The rendered title of the list or information regarding its contents.
   */
  title?: ReactElement<typeof NestedListViewHeaderTitle>

  /**
   * Display completed & total issue information about the issues contained in the NestedListView
   */
  completionPill?: ReactElement<typeof NestedListViewCompletionPill>

  /**
   * Links for applying any categorical, mutually exclusive section filters for the content of the NestedListView.
   */
  sectionFilters?: NestedListViewHeaderSectionFiltersLinks | ReactElement<typeof Suspense>
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
  /** Container class name. */
  className?: string
  /** Action Bar container class name. */
  actionBarClassName?: string
  /**
   * Styling for the Action Bar container
   */
  actionBarSx?: BetterSystemStyleObject
} & SxProp &
  Omit<NestedListViewHeaderActionBarProps, 'className' | 'sx'>

export const NestedListViewHeader = ({
  title,
  completionPill,
  assistiveAnnouncement,
  sectionFilters,
  children,
  sx,
  actionBarSx,
  className,
  actionBarClassName,
  onToggleSelectAll,
  actions,
  actionsLabel,
  ...actionBarProps
}: NestedListViewHeaderProps) => {
  const {isCollapsible, isExpanded, setIsExpanded, idPrefix} = useNestedListViewProperties()
  const {setHasMetadataTitle} = useNestedListViewTitle()
  const {anyItemsSelected} = useNestedListViewSelection()

  useEffect(() => {
    setHasMetadataTitle(!!title)
  })

  const NestedListViewAnnouncements = () => {
    return (
      <div
        id={`${idPrefix}-nested-list-view-announcements`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        {...testIdProps('nested-list-view-announcement-container')}
      >
        {assistiveAnnouncement}
      </div>
    )
  }

  const ListFilters = useCallback(() => {
    if (!sectionFilters) return null

    if (Array.isArray(sectionFilters)) {
      return <NestedListViewHeaderSectionFilters links={sectionFilters} />
    } else if (isValidElement(sectionFilters)) {
      return <>{sectionFilters}</>
    }
    return null
  }, [sectionFilters])

  // To fix Typescript error
  const actionsProps = actions && actionsLabel ? {actions, actionsLabel} : {}
  return (
    <Box
      id={`${idPrefix}-nested-list-view-metadata`}
      className={clsx(styles.container, className)}
      sx={sx}
      {...testIdProps('nested-list-view-metadata')}
    >
      {/* Add icon button component to expand or collapse the the nested list view depending on the isCollapsible prop */}
      {isCollapsible ? (
        isExpanded ? (
          <IconButton
            icon={ChevronDownIcon}
            onClick={() => setIsExpanded(false)}
            aria-label="List is expanded"
            size="small"
            variant="invisible"
          />
        ) : (
          <IconButton
            icon={ChevronRightIcon}
            onClick={() => setIsExpanded(true)}
            aria-label="List is collapsed"
            size="small"
            variant="invisible"
          />
        )
      ) : null}

      <NestedListViewHeaderSelectAllCheckbox
        onToggle={(isSelectAllChecked: boolean) => {
          if (onToggleSelectAll) onToggleSelectAll(isSelectAllChecked)
        }}
      />

      <ListFilters />

      {!anyItemsSelected && title}

      {completionPill}

      <NestedListViewHeaderActionBar
        className={actionBarClassName}
        sx={actionBarSx}
        {...actionsProps}
        {...actionBarProps}
      >
        {children}
      </NestedListViewHeaderActionBar>

      {assistiveAnnouncement && <NestedListViewAnnouncements />}
    </Box>
  )
}
