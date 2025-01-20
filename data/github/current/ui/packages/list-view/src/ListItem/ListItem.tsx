import {noop} from '@github-ui/noop'
import {Box} from '@primer/react'
import {clsx} from 'clsx'
import type {FocusEvent, JSX, KeyboardEvent, PropsWithChildren, ReactElement} from 'react'
import {Fragment, useCallback, useEffect, useId, useMemo, useRef} from 'react'

import {useListViewId} from '../ListView/IdContext'
import {useListViewItems} from '../ListView/ItemsContext'
import {useListViewSelection} from '../ListView/SelectionContext'
import {useListViewVariant} from '../ListView/VariantContext'
import type {PrefixedStylableProps, StylableProps} from '../types'
import {ListItemActionBar} from './ActionBar'
import {ActionsProvider} from './ActionsContext'
import {DescriptionProvider, useListItemDescription} from './DescriptionContext'
import {LeadingBadgeProvider, useListItemLeadingBadge} from './LeadingBadgeContext'
import styles from './ListItem.module.css'
import {ListItemMetadataContainer, type ListItemMetadataContainerProps} from './MetadataContainer'
import {NewActivityProvider, useListItemNewActivity} from './NewActivityContext'
import {SelectionProvider, useListItemSelection} from './SelectionContext'
import {StatusProvider, useListItemStatus} from './StatusContext'
import type {ListItemTitle} from './Title'
import {TitleProvider, useListItemTitle} from './TitleContext'

export type ListItemProps = StylableProps &
  PrefixedStylableProps<'metadataContainer'> &
  PropsWithChildren<{
    isSelected?: boolean
    isActive?: boolean
    onSelect?: (isSelected: boolean) => void
    /*
     * Optional. Overrides the default behavior of the list item when a key is pressed
     */
    onKeyDown?: (event: KeyboardEvent<HTMLLIElement>) => void
    onFocus?: (event: FocusEvent<HTMLLIElement>) => void

    /**
     * A ListItem title communicates the overall purpose of the ListItem.
     */
    title: ReactElement<typeof ListItemTitle>

    /**
     * Optional extra elements to display on the right side of the list item. You can optionally wrap individual
     * pieces of content in `ListItem.Metadata` for a consistent appearance.
     */
    metadata?: ListItemMetadataContainerProps['children']

    /**
     * Optional menu of additional actions to be shown on the right side of the ListItem. Use `ListItem.ActionBar`.
     */
    secondaryActions?: ReactElement<typeof ListItemActionBar>
  }>

const ListItemBase = ({
  children,
  isActive = false,
  title,
  metadata,
  secondaryActions,
  style,
  sx,
  className,
  metadataContainerStyle,
  metadataContainerSx,
  metadataContainerClassName,
  ...props
}: Omit<ListItemProps, 'isSelected' | 'onSelect'>): JSX.Element => {
  const {idPrefix} = useListViewId()
  const {isSelectable} = useListViewSelection()
  const {variant} = useListViewVariant()
  const {anyItemsWithActionBar, hasResizableActionsWithActionBar} = useListViewItems()
  const uniqueIdSuffix = useId()
  const {isSelected, onSelect} = useListItemSelection()
  const {status: labelStatus} = useListItemStatus()
  const {title: labelTitle, titleAction} = useListItemTitle()
  const {description: labelDescription} = useListItemDescription()
  const {leadingBadge: labelLeadingBadge} = useListItemLeadingBadge()
  const {hasNewActivity} = useListItemNewActivity()
  const itemRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!itemRef.current) return
    // Focus the element unless another element in the document is specifically focused
    if (isActive && document.activeElement?.tagName === 'BODY') {
      itemRef.current.focus()
    }
  })

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLLIElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (e.key) {
        case 'Enter':
          if (titleAction) titleAction(e)
          break
        case ' ':
          // When the user presses Space
          if (!isSelectable) break
          if (itemRef?.current !== document.activeElement) break // if the focus is inside the listitem, do not select the item
          e.preventDefault()
          onSelect(!isSelected)
          break
        case 'Escape':
          itemRef?.current?.focus()
          break
        default:
          break
      }
    },
    [titleAction, isSelectable, onSelect, isSelected],
  )

  const getAriaLabel = useCallback(() => {
    const labelSelected = isSelected ? 'Selected' : ''
    const labelNewActivity = hasNewActivity ? 'New activity' : ''
    const hasSecondaryActions = !!secondaryActions
    const hasMetadata = (Array.isArray(metadata) && metadata.length > 0) || (metadata && !Array.isArray(metadata))
    let labelAdditionalInfo = ''
    if (hasMetadata || hasSecondaryActions) {
      labelAdditionalInfo = 'More information available below'
    }

    const main = [labelLeadingBadge, labelTitle, labelStatus]
      .filter(str => str.trim())
      .join(': ')
      .replace(/\.+$/, '') // Remove additional periods
    const ariaLabel = [labelSelected, main, labelDescription, labelNewActivity, labelAdditionalInfo]
      .filter(str => str.trim())
      .join('. ')

    return ariaLabel.endsWith('.') ? ariaLabel : `${ariaLabel}.`
  }, [
    secondaryActions,
    metadata,
    isSelected,
    hasNewActivity,
    labelLeadingBadge,
    labelTitle,
    labelStatus,
    labelDescription,
  ])

  return (
    <Box
      as="li"
      ref={itemRef}
      id={`${idPrefix}-list-view-node-${uniqueIdSuffix}`}
      role="listitem"
      className={clsx(
        styles.listItem,
        isSelected && styles.selected,
        variant === 'compact' && styles.compact,
        anyItemsWithActionBar && hasResizableActionsWithActionBar && styles.hasActionBar,
        className,
      )}
      tabIndex={-1} // Handled by useFocusZone with roving tabIndex
      aria-label={getAriaLabel()}
      style={style}
      sx={sx}
      onKeyDown={onKeyDown}
      {...props}
    >
      {title}
      {children}
      {Array.isArray(metadata) && metadata.length > 0 ? (
        <ListItemMetadataContainer
          style={metadataContainerStyle}
          sx={metadataContainerSx}
          className={metadataContainerClassName}
        >
          {metadata.map((metadataItem, index) => (
            <Fragment key={index}>{metadataItem}</Fragment>
          ))}
        </ListItemMetadataContainer>
      ) : (
        metadata &&
        !Array.isArray(metadata) && (
          <ListItemMetadataContainer
            style={metadataContainerStyle}
            sx={metadataContainerSx}
            className={metadataContainerClassName}
          >
            {metadata}
          </ListItemMetadataContainer>
        )
      )}
      {secondaryActions ?? (anyItemsWithActionBar && <ListItemActionBar />)}
    </Box>
  )
}

export const ListItem = ({
  children,
  isSelected = false,
  onSelect = noop,
  ...rest
}: PropsWithChildren<ListItemProps>): JSX.Element => {
  const {setSelectedCount} = useListViewSelection()
  const isSelectedRef = useRef(isSelected)
  isSelectedRef.current = isSelected

  useEffect(() => {
    setSelectedCount(count => (isSelected ? count + 1 : Math.max(0, count - 1)))
  }, [isSelected, setSelectedCount])

  useEffect(() => {
    return () => {
      if (isSelectedRef.current) {
        setSelectedCount(count => Math.max(0, count - 1))
      }
    }
  }, [setSelectedCount])

  const selectionProviderProps = useMemo(() => ({isSelected, onSelect}), [isSelected, onSelect])

  return (
    <ActionsProvider>
      <LeadingBadgeProvider>
        <TitleProvider>
          <SelectionProvider value={selectionProviderProps}>
            <NewActivityProvider>
              <DescriptionProvider>
                <StatusProvider>
                  <ListItemBase {...rest}>{children}</ListItemBase>
                </StatusProvider>
              </DescriptionProvider>
            </NewActivityProvider>
          </SelectionProvider>
        </TitleProvider>
      </LeadingBadgeProvider>
    </ActionsProvider>
  )
}
