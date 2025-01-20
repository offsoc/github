import {DragAndDrop, useDragAndDrop} from '@github-ui/drag-and-drop'
import {noop} from '@github-ui/noop'
import {ScopedCommands} from '@github-ui/ui-commands'
import {Box, TreeView, type TreeViewSubTreeProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import type React from 'react'
import type {FocusEvent, KeyboardEvent, PropsWithChildren, ReactElement} from 'react'
import {Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, useTransition} from 'react'

import {useNestedListViewItems} from '../context/ItemsContext'
import {useNestedListViewProperties} from '../context/PropertiesContext'
import {useNestedListViewSelection} from '../context/SelectionContext'
import {NestedListViewErrorBoundary} from '../ErrorBoundary'
import {NestedListItemActionBar} from './ActionBar'
import {NestedListItemActionsProvider} from './context/ActionsContext'
import {NestedListItemCompletionProvider, useNestedListItemCompletion} from './context/CompletionContext'
import {NestedListItemDescriptionProvider, useNestedListItemDescription} from './context/DescriptionContext'
import {NestedListItemLeadingBadgeProvider, useNestedListItemLeadingBadge} from './context/LeadingBadgeContext'
import {NestedListItemNewActivityProvider, useNestedListItemNewActivity} from './context/NewActivityContext'
import {NestedListItemSelectionProvider, useNestedListItemSelection} from './context/SelectionContext'
import {NestedListItemStatusProvider, useNestedListItemStatus} from './context/StatusContext'
import {NestedListItemTitleProvider, useNestedListItemTitle} from './context/TitleContext'
import {ControlsDialog} from './ControlsDialog'
import {ControlsDialogHint} from './ControlsDialogHint'
import {SuppressSecondaryActionsProvider} from './hooks/use-suppress-actions'
import {NestedListItemMetadataContainer} from './MetadataContainer'
import styles from './NestedListItem.module.css'
import {NestedListItemSelection} from './Selection'
import type {NestedListItemContentProps} from './types'

export interface NestedListItemProps extends NestedListItemContentProps {
  isSelected?: boolean
  isActive?: boolean
  onSelect?: (isSelected: boolean) => void
  /*
   * Optional. Overrides the default behavior of the list item when a key is pressed
   */
  onKeyDown?: (event: KeyboardEvent<HTMLLIElement>) => void
  onFocus?: (event: FocusEvent<HTMLLIElement>) => void
  sx?: BetterSystemStyleObject
  metadataContainerSx?: BetterSystemStyleObject
  /**
   * Optional. Show an expand icon to indicating that the list item has additional sub items to show.
   */
  subItemsCount?: number
  /**
   * Optional. Nested sub items that will be rendered when the sub tree is expanded.
   */
  subItems?: Array<ReactElement<typeof NestedListItem>>
  /**
   * Optional. Callback for loading sub items
   */
  loadSubItems?: () => void
  /** List Item's inner container class name */
  className?: string
  /** Metadata Container class name */
  metadataContainerClassName?: string
  dragAndDropProps?: {
    /**
     * Optional. Temporary prop to enable drag and drop and place the drag handle. Will be removed with M2 when we can
     * show drag handles for all items and not just first level items.
     */
    showTrigger?: boolean
    /**
     * Optional. Identify as drag overlay
     */
    isOverlay?: boolean
    /**
     * Optional. Individual item id
     */
    itemId?: string
  }
}

const NestedListItemInternal = ({
  children,
  isActive = false,
  title,
  metadata,
  secondaryActions,
  sx,
  metadataContainerSx,
  subItemsCount,
  subItems,
  loadSubItems,
  className,
  metadataContainerClassName,
  dragAndDropProps = {},
  isDragAndDropEnabled = false,
  ...props
}: Omit<NestedListItemProps, 'isSelected' | 'onSelect'> & {isDragAndDropEnabled?: boolean}): JSX.Element => {
  const {idPrefix, isReadOnly} = useNestedListViewProperties()
  const {isSelectable} = useNestedListViewSelection()
  const {anyItemsWithActionBar, hasResizableActionsWithActionBar} = useNestedListViewItems()
  const uniqueIdSuffix = useId()
  const {isSelected, onSelect: itemOnSelect} = useNestedListItemSelection()
  const {status: labelStatus} = useNestedListItemStatus()
  const {title: labelTitle, titleAction} = useNestedListItemTitle()
  const {description: labelDescription} = useNestedListItemDescription()
  const {leadingBadge: labelLeadingBadge} = useNestedListItemLeadingBadge()
  const completionContext = useNestedListItemCompletion()
  const {hasNewActivity} = useNestedListItemNewActivity()
  const itemRef = useRef<HTMLLIElement>(null)
  const [subItemsLoadingState, setSubItemsLoadingState] = useState<TreeViewSubTreeProps['state']>('initial')
  const [itemExpanded, setItemExpanded] = useState(false)
  const {isInDragMode} = useDragAndDrop()

  const triggerRef = useRef<HTMLElement>(null)
  const hasSubItems = subItemsCount && subItemsCount > 0

  useEffect(() => {
    if (!itemRef.current) return
    // Focus the element unless another element in the document is specifically focused
    if (isActive && document.activeElement?.tagName === 'BODY') {
      itemRef.current.focus()
    }
  })

  // Enter = primary action (link)
  // Space = Check/uncheck(if selection is enabled), otherwise navigate to the link
  // https://ui.githubapp.com/storybook/?path=/docs/recipes-nested-list-view-documentation-accessibility-overview--overview#navigating-and-taking-action
  const onSelect = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      if (e.nativeEvent instanceof KeyboardEvent) {
        const event = e as KeyboardEvent<HTMLElement>
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        switch (event.key) {
          case 'Enter':
            // Trigger titleAction if whole list item is selected
            if (itemRef?.current === document.activeElement && titleAction) titleAction(event)
            break
          case ' ':
            // Check if the focus is inside the listitem
            if (itemRef?.current !== document.activeElement) break
            event.preventDefault()

            // Order of priority for an accessible `Space` keypress:
            if (!isReadOnly) {
              // 1. Check if item can be dragged and dropped. Don't start drag if ctrl key is pressed.
              if (isDragAndDropEnabled && triggerRef.current && !event.nativeEvent.ctrlKey && !isInDragMode) {
                lastFocusedElement.current = document.activeElement as HTMLElement
                triggerRef.current?.focus()
                triggerRef.current?.click()
                event.preventDefault()
                break
              }
              // 2. Check/uncheck the item
              if (isSelectable) {
                itemOnSelect(!isSelected)
                break
              }
            }

            // 3. Then check if can activate title
            if (titleAction) {
              titleAction(event)
              break
            }
            // 4. Then expand and collapse. Use TreeView native onKeyDown handler to toggle
            if (hasSubItems || subItems) {
              setItemExpanded(!itemExpanded)
              break
            }

            break
          case 'Escape':
            itemRef?.current?.focus()
            break
          default:
            break
        }
      }
    },
    [
      titleAction,
      isReadOnly,
      hasSubItems,
      subItems,
      isDragAndDropEnabled,
      isInDragMode,
      isSelectable,
      itemOnSelect,
      isSelected,
      itemExpanded,
    ],
  )

  const getAriaLabel = useCallback(() => {
    const labelSelected = isSelected ? 'Selected' : ''
    const labelNewActivity = hasNewActivity ? 'New activity' : ''
    const labelAdditionalInfo = 'Press Control, Shift, U for more actions'
    let labelCompletion = ''
    if (completionContext) labelCompletion = completionContext.completion
    const main = [labelSelected, labelLeadingBadge, labelTitle, labelStatus]
      .filter(str => str.trim())
      .join(': ')
      .replace(/\.+$/, '') // Remove additional periods
    const ariaLabel = [main, labelDescription, labelNewActivity, labelCompletion, labelAdditionalInfo]
      .filter(str => str.trim())
      .join('. ')

    return ariaLabel.endsWith('.') ? ariaLabel : `${ariaLabel}.`
  }, [hasNewActivity, isSelected, completionContext, labelDescription, labelLeadingBadge, labelStatus, labelTitle])

  const [isPending, startTransition] = useTransition()
  const loadItems = useCallback(() => {
    if (isPending) return
    setSubItemsLoadingState('loading')
    startTransition(() => {
      loadSubItems?.()
    })
  }, [loadSubItems, isPending, setSubItemsLoadingState])

  useEffect(() => {
    if (isPending) {
      setSubItemsLoadingState('loading')
    } else {
      setSubItemsLoadingState('done')
    }
  }, [isPending])

  const [controlsDialogOpen, setControlsDialogOpen] = useState(false)

  const lastFocusedElement = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!isInDragMode && lastFocusedElement.current) {
      lastFocusedElement.current.focus()
      lastFocusedElement.current = null
    }
  }, [isInDragMode])

  return (
    <NestedListViewErrorBoundary
      onError={() => {
        setSubItemsLoadingState('error')
      }}
      onDismiss={() => {
        setSubItemsLoadingState('initial')
      }}
    >
      <ScopedCommands
        commands={{
          'list-views:open-manage-item-dialog': () => setControlsDialogOpen(true),
        }}
      >
        <TreeView.Item
          onSelect={onSelect}
          expanded={itemExpanded && !isInDragMode}
          onExpandedChange={expanded => {
            setItemExpanded(expanded)
            if (expanded && hasSubItems && !subItems) {
              loadItems()
            }
          }}
          ref={itemRef}
          id={`${idPrefix}-list-view-node-${uniqueIdSuffix}`}
          aria-label={getAriaLabel()}
          {...props}
        >
          {dragAndDropProps.showTrigger && isDragAndDropEnabled && !isReadOnly && (
            <TreeView.LeadingAction>
              <DragAndDrop.DragTrigger className={clsx(styles.dragHandle)} ref={triggerRef} />
            </TreeView.LeadingAction>
          )}
          <Box
            className={clsx(
              styles.item,
              styles.itemGrid,
              isSelected && styles.selected,
              anyItemsWithActionBar && hasResizableActionsWithActionBar && styles.hasResizableActionsWithActionBar,
              className,
            )}
            tabIndex={-1} // Handled by useFocusZone with roving tabIndex
            sx={sx}
          >
            <SuppressSecondaryActionsProvider value={true}>
              {title}
              <NestedListItemSelection />
              {children}
              {Array.isArray(metadata) && metadata.length > 0 ? (
                <NestedListItemMetadataContainer className={metadataContainerClassName} sx={metadataContainerSx}>
                  {metadata.map((metadataItem, index) => (
                    <Fragment key={index}>{metadataItem}</Fragment>
                  ))}
                </NestedListItemMetadataContainer>
              ) : (
                metadata &&
                !Array.isArray(metadata) && (
                  <NestedListItemMetadataContainer className={metadataContainerClassName} sx={metadataContainerSx}>
                    {metadata}
                  </NestedListItemMetadataContainer>
                )
              )}
              {secondaryActions ?? (anyItemsWithActionBar && <NestedListItemActionBar />)}
            </SuppressSecondaryActionsProvider>
          </Box>

          <ControlsDialogHint />

          {controlsDialogOpen && (
            <ControlsDialog
              onClose={() => setControlsDialogOpen(false)}
              title={title}
              metadata={metadata}
              secondaryActions={secondaryActions}
            >
              {children}
            </ControlsDialog>
          )}
          {(hasSubItems || subItems) && (
            <TreeView.SubTree state={subItemsLoadingState} count={subItemsCount}>
              {subItems}
            </TreeView.SubTree>
          )}
        </TreeView.Item>
      </ScopedCommands>
    </NestedListViewErrorBoundary>
  )
}

export const NestedListItem = ({
  children,
  isSelected = false,
  onSelect = noop,
  ...rest
}: PropsWithChildren<NestedListItemProps>): JSX.Element => {
  const {setSelectedCount} = useNestedListViewSelection()
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
    <NestedListItemCompletionProvider>
      <NestedListItemActionsProvider>
        <NestedListItemLeadingBadgeProvider>
          <NestedListItemTitleProvider>
            <NestedListItemSelectionProvider value={selectionProviderProps}>
              <NestedListItemNewActivityProvider>
                <NestedListItemDescriptionProvider>
                  <NestedListItemStatusProvider>
                    <DragAndDrop.Item
                      id={rest.dragAndDropProps?.itemId || ''}
                      index={0}
                      title={rest.dragAndDropProps?.itemId || ''}
                      as="div"
                      hideSortableItemTrigger={true}
                      isDragOverlay={rest.dragAndDropProps?.isOverlay ?? false}
                    >
                      <NestedListItemInternal isDragAndDropEnabled {...rest}>
                        {children}
                      </NestedListItemInternal>
                    </DragAndDrop.Item>
                  </NestedListItemStatusProvider>
                </NestedListItemDescriptionProvider>
              </NestedListItemNewActivityProvider>
            </NestedListItemSelectionProvider>
          </NestedListItemTitleProvider>
        </NestedListItemLeadingBadgeProvider>
      </NestedListItemActionsProvider>
    </NestedListItemCompletionProvider>
  )
}
