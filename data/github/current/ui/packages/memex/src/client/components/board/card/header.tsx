import {testIdProps} from '@github-ui/test-id-props'
import {
  ArchiveIcon,
  ArrowBothIcon,
  ChevronRightIcon,
  CopyIcon,
  IssueDraftIcon,
  IssueOpenedIcon,
  KebabHorizontalIcon,
  LinkExternalIcon,
  LockIcon,
  MoveToBottomIcon,
  MoveToTopIcon,
  TrashIcon,
} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  Box,
  type BoxProps,
  IconButton,
  Octicon,
  SelectPanel,
  type SelectPanelProps,
  Text,
} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {forwardRef, memo, type RefObject, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {IterationValue} from '../../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {ColumnData} from '../../../api/columns/contracts/storage'
import {ItemType} from '../../../api/memex-items/item-type'
import {SidePanelTypeParam} from '../../../api/memex-items/side-panel-item'
import {
  type BoardActionUI,
  BoardCardActionMenuUI,
  CardContextMenuUI,
  CardMove,
  CardMoveUI,
  type CardMoveUIType,
  DraftConvert,
} from '../../../api/stats/contracts'
import {getAllIterationsForConfiguration} from '../../../helpers/iterations'
import {asSingleSelectValue} from '../../../helpers/parsing'
import {filterSuggestedSingleSelectOptions} from '../../../helpers/single-select-suggester'
import type {SuggestedIterationOption, SuggestedSingleSelectOption} from '../../../helpers/suggestions'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {
  convertOptionToItem as convertOptionToIterationItem,
  useIterationEditor,
} from '../../../hooks/editors/use-iteration-editor'
import {
  convertOptionToItem as convertOptionToSingleSelectItem,
  useSingleSelectEditor,
} from '../../../hooks/editors/use-single-select-editor'
import {useSortedBy} from '../../../hooks/use-sorted-by'
import type {ColumnModelForDataType} from '../../../models/column-model'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {MissingVerticalGroupId} from '../../../models/vertical-group'
import {ITEM_ID_PARAM, PANE_PARAM} from '../../../platform/url'
import {AssigneeStack} from '../../common/assignee-stack'
import {delKey as DelKey, eKey as EKey} from '../../common/keyboard-shortcuts'
import {ItemStateForTitle} from '../../item-state'
import {RepoPicker} from '../../repo-picker'
import {useBoardContext} from '../board-context'
import {useCardSelection} from '../hooks/use-card-selection'

type Props = BoxProps & {
  item: MemexItemModel
  verticalGroupId?: string
  columnData: ColumnData
  archiveItem?: (ui: BoardActionUI) => void
  removeItem: (ui: BoardActionUI) => void
  moveItemToTop?: (ui: CardMoveUIType) => void
  moveItemToBottom?: (ui: CardMoveUIType) => void
  contextMenuRef: RefObject<HTMLDivElement>
  disableContextMenu: boolean
}

const RedactedAvatar = () => (
  <Box
    sx={{
      width: '16px',
      height: '16px',
      bg: 'border.muted',
      borderRadius: 10,
      borderWidth: '0',
      borderStyle: 'solid',
      borderColor: 'border.default',
    }}
  />
)

export const Header: React.FC<Props> = memo(function Header({
  item,
  columnData,
  archiveItem,
  removeItem,
  moveItemToTop,
  moveItemToBottom,
  contextMenuRef,
  disableContextMenu,
  verticalGroupId,
  ...boxProps
}) {
  const assignees = columnData.Assignees
  const {postStats} = usePostStats()
  const headerInternalRef = useRef<HTMLDivElement>(null)
  const [repoPickerOpen, setRepoPickerOpen] = useState(false)
  const {hasWritePermissions} = ViewerPrivileges()

  let content: React.ReactNode | null = null
  const avatars = <AssigneeStack assignees={assignees} alignRight {...testIdProps(`board-card-assignees`)} />

  const titleValue = columnData.Title
  if (!titleValue) {
    return null
  }

  switch (titleValue.contentType) {
    case ItemType.RedactedItem: {
      content = (
        <HeaderInternal
          contextMenuRef={contextMenuRef}
          Icon={<Octicon icon={LockIcon} sx={{color: 'fg.muted'}} />}
          Title={
            <>
              <Box
                sx={{
                  width: '48px',
                  height: '4px',
                  bg: 'border.muted',
                  borderRadius: 1,
                  borderWidth: '0',
                  borderStyle: 'solid',
                  borderColor: 'border.default',
                }}
              />
              <h3 className="sr-only">Access prohibited</h3>
            </>
          }
          Avatars={<RedactedAvatar />}
          item={item}
          disableContextMenu
          removeItem={removeItem}
          verticalGroupId={verticalGroupId}
        />
      )
      break
    }
    case ItemType.DraftIssue: {
      const onCardConvertSuccess = () =>
        postStats({
          name: DraftConvert,
          ui: CardContextMenuUI,
          memexProjectItemId: item.id,
        })

      content = (
        <>
          <HeaderInternal
            ref={headerInternalRef}
            contextMenuRef={contextMenuRef}
            Icon={<Octicon icon={IssueDraftIcon} aria-label="Draft issue" sx={{color: 'fg.muted'}} />}
            Title={<Text sx={{fontSize: 0, color: 'fg.muted'}}>Draft</Text>}
            Avatars={avatars}
            item={item}
            convertToIssue={() => setRepoPickerOpen(true)}
            removeItem={removeItem}
            archiveItem={archiveItem}
            disableContextMenu={disableContextMenu || !hasWritePermissions}
            moveItemToTop={moveItemToTop}
            moveItemToBottom={moveItemToBottom}
            verticalGroupId={verticalGroupId}
          />
          <RepoPicker
            anchorRef={headerInternalRef}
            isOpen={repoPickerOpen}
            item={item}
            onOpenChange={(isOpen: boolean) => setRepoPickerOpen(isOpen)}
            onSuccess={onCardConvertSuccess}
            {...testIdProps('card-menu-repo-picker')}
          />
        </>
      )
      break
    }
    case ItemType.Issue:
    case ItemType.PullRequest: {
      const repoName = columnData.Repository?.name

      content = (
        <HeaderInternal
          ref={headerInternalRef}
          contextMenuRef={contextMenuRef}
          Icon={<ItemStateForTitle title={titleValue} size={16} />}
          Title={
            <Text sx={{fontSize: 0, color: 'fg.muted'}}>
              {repoName} #{titleValue.value.number}
            </Text>
          }
          Avatars={avatars}
          item={item}
          archiveItem={archiveItem}
          removeItem={removeItem}
          disableContextMenu={disableContextMenu || !hasWritePermissions}
          moveItemToTop={moveItemToTop}
          moveItemToBottom={moveItemToBottom}
          verticalGroupId={verticalGroupId}
        />
      )
    }
  }

  if (!content) return null
  return <Box {...boxProps}>{content}</Box>
})

const HeaderInternal = forwardRef<
  HTMLDivElement,
  {
    Icon: React.ReactNode
    Title: React.ReactNode
    Avatars: React.ReactNode
    contextMenuRef: RefObject<HTMLDivElement>
    item: MemexItemModel
    convertToIssue?: () => void
    archiveItem?: (ui: BoardActionUI) => void
    removeItem: (ui: BoardActionUI) => void
    moveItemToTop?: (ui: CardMoveUIType) => void
    moveItemToBottom?: (ui: CardMoveUIType) => void
    disableContextMenu?: boolean
    verticalGroupId?: string
  }
>(({Avatars, ...props}, ref) => {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between'}} ref={ref}>
      <IconAndTitle {...props} />
      <Box sx={{display: 'flex', flexShrink: 0, justifyContent: 'flex-end', alignItems: 'center'}}>{Avatars}</Box>
    </Box>
  )
})

HeaderInternal.displayName = 'HeaderInternal'

const IconAndTitleItems = {
  ARCHIVE_ITEM: 'archive-item',
  DELETE_FROM_PROJECT: 'delete-from-project',
} as const
type IconAndTitleItems = ObjectValues<typeof IconAndTitleItems>

const iconAndTitleStyle: BetterSystemStyleObject = {
  height: '24px',
  alignItems: 'center',
  userSelect: 'none',
  cursor: 'default',
  display: 'flex',
  '&:not(.js-disable-context-menu):not(.js-context-menu-open) .js-context-menu-trigger': {
    /* if we switch this to display: none or visibility: hidden,
    we will not be able to focus the menu button with the Tab key or ESC key when closing  the menu
    because of the event loop rendering process */
    opacity: 0,
  },
  '.js-context-menu-trigger:hover > div, &.js-context-menu-open .js-context-menu-trigger > div': {
    bg: 'canvas.subtle',
  },
}

const IconAndTitle = ({
  Icon,
  Title,
  contextMenuRef,
  item,
  convertToIssue,
  archiveItem,
  removeItem,
  moveItemToBottom,
  moveItemToTop,
  disableContextMenu,
  verticalGroupId,
}: {
  Icon: React.ReactNode
  Title: React.ReactNode
  contextMenuRef: RefObject<HTMLDivElement>
  item: MemexItemModel
  convertToIssue?: () => void
  archiveItem?: (ui: BoardActionUI) => void
  removeItem: (ui: BoardActionUI) => void
  moveItemToTop?: (ui: CardMoveUIType) => void
  moveItemToBottom?: (ui: CardMoveUIType) => void
  disableContextMenu?: boolean
  verticalGroupId?: string
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [itemInProjectUrl, setItemInProjectUrl] = useState('')
  const {filteredSelectedCardIds, state: selectionState} = useCardSelection()
  const isItemSelected = item.contentType !== ItemType.RedactedItem && selectionState[item.id]
  const isSingleItemSelected = filteredSelectedCardIds.length <= 1
  const itemHasUrl = item.contentType === ItemType.Issue || item.contentType === ItemType.PullRequest
  const itemHasUrlInProject = item.contentType === ItemType.Issue || item.contentType === ItemType.DraftIssue
  const {isSorted} = useSortedBy()
  const {groupedItems, groupByField, groupByFieldOptions} = useBoardContext()

  const changeFieldMenuTriggerRef = useRef<HTMLLIElement>(null)
  const [changeFieldMenuOpen, setChangeFieldMenuOpen] = useState(false)
  const [refToRefocus, setRefToRefocus] = useState<RefObject<HTMLElement | null> | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.append(PANE_PARAM, SidePanelTypeParam.ISSUE)
    url.searchParams.append(ITEM_ID_PARAM, item.id.toString())
    setItemInProjectUrl(url.href)
  }, [item.id])

  // When closing a sub-menu, we need to refocus the parent menu trigger
  useEffect(() => {
    if (refToRefocus?.current && menuOpen) {
      setTimeout(() => {
        refToRefocus?.current?.focus()
      })
      setRefToRefocus(null)
    }
  }, [menuOpen, refToRefocus])

  const onChangeFieldMenuOpenChange: SelectPanelProps['onOpenChange'] = useCallback(
    (_open, gesture) => {
      if (gesture === 'selection') {
        setChangeFieldMenuOpen(false)
        setTimeout(() => {
          // Try to refocus the context menu after a while to preserve focus state. We are using
          // a query selector here because the `contextMenuRef` will be stale and no longer applicable,
          // because it is now being rendered in a completely different component. So this is
          // a hacky way to quickly jump focus between components.
          const contextMenuTrigger = document.querySelector<HTMLElement>(
            `[data-board-card-id="${item.id}"] button[aria-labelledby]`,
          )
          contextMenuTrigger?.focus()
        })
      } else if (gesture === 'click-outside') {
        setChangeFieldMenuOpen(false)
      } else {
        setChangeFieldMenuOpen(false)
        setMenuOpen(true)
        setRefToRefocus(changeFieldMenuTriggerRef)
      }
    },
    [item.id],
  )

  const className = clsx({
    'js-disable-context-menu': disableContextMenu,
    'js-context-menu-open': menuOpen || changeFieldMenuOpen,
  })

  const itemsInColumn = groupedItems.allItemsByVerticalGroup[verticalGroupId ?? '']?.items
  const isFirstItemInColumn = itemsInColumn?.at(0)?.id === item.id
  const isLastItemInColumn = itemsInColumn?.at(-1)?.id === item.id

  const noGroupColumnItemsCount = groupedItems.allItemsByVerticalGroup[MissingVerticalGroupId]?.items.length ?? 0
  const isNoGroupColumnVisible = noGroupColumnItemsCount > 0
  const isColumnVisible = useCallback(
    (columnId: string) => {
      const isColumnRendered = groupByFieldOptions.some(option => option.id === columnId)
      return columnId === MissingVerticalGroupId ? isNoGroupColumnVisible : isColumnRendered
    },
    [groupByFieldOptions, isNoGroupColumnVisible],
  )

  const {postStats} = usePostStats()
  const onChangeField: MoveToFieldMenuProps<
    typeof MemexColumnDataType.SingleSelect | typeof MemexColumnDataType.Iteration
  >['onChangeField'] = useCallback(
    context => {
      if (!groupByField) return
      postStats({
        name: CardMove,
        ui: CardMoveUI.ContextMenu,
        context: JSON.stringify({
          type: 'column',
          itemId: item.id,
          fieldId: groupByField.databaseId,
          nextValue: context.nextValue,
          currentValue: context.currentValue,
        }),
      })
    },
    [groupByField, item.id, postStats],
  )

  const onMenuOpenChange = useCallback((open: boolean) => {
    setMenuOpen(open)
    if (open) {
      setChangeFieldMenuOpen(false)
    }
  }, [])

  return (
    <Box sx={iconAndTitleStyle} className={className}>
      <Box sx={{mr: 1}}>{Icon}</Box>
      {Title}
      {!disableContextMenu && (
        <Box sx={{mr: 0}} className="js-context-menu-trigger">
          <ActionMenu open={menuOpen} onOpenChange={onMenuOpenChange} anchorRef={contextMenuRef}>
            <ActionMenu.Anchor>
              <IconButton
                tooltipDirection="e"
                variant="invisible"
                icon={KebabHorizontalIcon}
                {...testIdProps('card-context-menu-trigger')}
                aria-label="More actions"
                sx={{
                  ml: 1,
                  color: 'fg.muted',
                  width: '24px',
                  height: '24px',
                  padding: 0,
                }}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay anchorSide="inside-right" onMouseDown={e => e.stopPropagation()}>
              <ActionList>
                {isSingleItemSelected && (
                  <>
                    {convertToIssue ? (
                      <ActionList.Item onSelect={convertToIssue} {...testIdProps('card-context-menu-convert-to-issue')}>
                        <ActionList.LeadingVisual>
                          <IssueOpenedIcon />
                        </ActionList.LeadingVisual>
                        Convert to issue
                      </ActionList.Item>
                    ) : null}
                    {itemHasUrl ? (
                      <ActionList.LinkItem
                        target="_blank"
                        href={item.getUrl()}
                        rel="noopener noreferrer"
                        {...testIdProps('card-context-menu-open-in-new-tab')}
                      >
                        <ActionList.LeadingVisual>
                          <LinkExternalIcon />
                        </ActionList.LeadingVisual>
                        Open in new tab
                      </ActionList.LinkItem>
                    ) : null}
                    {itemHasUrl ? (
                      <CopyUrl label="Copy link" url={item.getUrl()} testId="card-context-menu-copy-link" />
                    ) : null}
                    {itemHasUrlInProject ? (
                      <CopyUrl
                        label="Copy link in project"
                        url={itemInProjectUrl}
                        testId="card-context-menu-copy-link-in-project"
                      />
                    ) : null}
                    <ActionList.Divider />
                    {!isSorted && (moveItemToTop || moveItemToBottom) ? (
                      <>
                        {moveItemToTop && (
                          <ActionList.Item
                            disabled={isFirstItemInColumn}
                            onSelect={() => moveItemToTop(CardMoveUI.ContextMenu)}
                          >
                            <ActionList.LeadingVisual>
                              <MoveToTopIcon />
                            </ActionList.LeadingVisual>
                            Move to top
                          </ActionList.Item>
                        )}
                        {moveItemToBottom && (
                          <ActionList.Item
                            disabled={isLastItemInColumn}
                            onSelect={() => moveItemToBottom(CardMoveUI.ContextMenu)}
                          >
                            <ActionList.LeadingVisual>
                              <MoveToBottomIcon />
                            </ActionList.LeadingVisual>
                            Move to bottom
                          </ActionList.Item>
                        )}
                      </>
                    ) : null}
                    <ActionList.Item onSelect={() => setChangeFieldMenuOpen(true)} ref={changeFieldMenuTriggerRef}>
                      <ActionList.LeadingVisual>
                        <ArrowBothIcon />
                      </ActionList.LeadingVisual>
                      Move to column
                      <ActionList.TrailingVisual>
                        <ChevronRightIcon />
                      </ActionList.TrailingVisual>
                    </ActionList.Item>
                    <ActionList.Divider />
                  </>
                )}
                {archiveItem ? (
                  <ActionList.Item
                    id={IconAndTitleItems.ARCHIVE_ITEM}
                    onSelect={() => archiveItem?.(BoardCardActionMenuUI)}
                    {...testIdProps('card-context-menu-archive-item')}
                  >
                    <ActionList.LeadingVisual>
                      <ArchiveIcon />
                    </ActionList.LeadingVisual>
                    {isItemSelected && filteredSelectedCardIds.length > 1
                      ? `Archive ${filteredSelectedCardIds.length} selected items`
                      : 'Archive'}
                    <ActionList.TrailingVisual>
                      <EKey />
                    </ActionList.TrailingVisual>
                  </ActionList.Item>
                ) : null}
                <ActionList.Item
                  id={IconAndTitleItems.DELETE_FROM_PROJECT}
                  variant="danger"
                  onSelect={() => removeItem(BoardCardActionMenuUI)}
                  {...testIdProps('card-context-menu-delete')}
                >
                  <ActionList.LeadingVisual>
                    <TrashIcon />
                  </ActionList.LeadingVisual>
                  {isItemSelected && filteredSelectedCardIds.length > 1
                    ? `Delete ${filteredSelectedCardIds.length} selected items from project`
                    : 'Delete from project'}
                  <ActionList.TrailingVisual>
                    <DelKey />
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
      )}
      {!disableContextMenu && changeFieldMenuOpen && groupByField && (
        <>
          {groupByField.dataType === MemexColumnDataType.SingleSelect && (
            <MoveToSingleSelectFieldMenu
              model={item}
              groupByField={groupByField}
              onOpenChange={onChangeFieldMenuOpenChange}
              anchorRef={contextMenuRef}
              isColumnVisible={isColumnVisible}
              onChangeField={onChangeField}
            />
          )}
          {groupByField.dataType === MemexColumnDataType.Iteration && (
            <MoveToIterationFieldMenu
              model={item}
              groupByField={groupByField}
              onOpenChange={onChangeFieldMenuOpenChange}
              anchorRef={contextMenuRef}
              isColumnVisible={isColumnVisible}
              onChangeField={onChangeField}
            />
          )}
        </>
      )}
    </Box>
  )
}

type MoveToFieldMenuProps<DataType extends MemexColumnDataType> = {
  /** The item that we are changed the field for */
  model: MemexItemModel
  /** The currently grouped by field, generic over data type so we get better type safety */
  groupByField: ColumnModelForDataType<DataType>
  /** Callback to call when open state should change */
  onOpenChange: SelectPanelProps['onOpenChange']
  /** The anchor element to attach the menu overlay to */
  anchorRef: React.RefObject<HTMLElement>
  /** Filter function to return only columns that are currently rendered, for narrowing options */
  isColumnVisible: (columnId: string) => boolean
  /** Callback to call when the field is changed */
  onChangeField: (context: {nextValue: string | number | null; currentValue: string | number | null}) => void
}

function MoveToSingleSelectFieldMenu({
  model,
  groupByField,
  onOpenChange,
  anchorRef,
  isColumnVisible,
  onChangeField,
}: MoveToFieldMenuProps<typeof MemexColumnDataType.SingleSelect>) {
  const [filterValue, setFilterValue] = useState('')
  const selectedOption = asSingleSelectValue(model.columns[groupByField.id])

  const {options, saveSelected} = useSingleSelectEditor({
    model,
    columnModel: groupByField,
    selectedValueId: selectedOption ? selectedOption.id : null,
  })

  const optionsPlusNone = useMemo<Array<SuggestedSingleSelectOption>>(
    () => [
      ...options,
      {
        id: MissingVerticalGroupId,
        label: `No ${groupByField.name}`,
        color: 'GRAY',
        description: '',
        descriptionHtml: '',
        name: `No ${groupByField.name}`,
        nameHtml: `No ${groupByField.name}`,
        selected: selectedOption === null,
      },
    ],
    [groupByField.name, options, selectedOption],
  )
  const allOptionsGray = optionsPlusNone.every(option => option.color === 'GRAY')
  const convertOption = useCallback(
    (option: SuggestedSingleSelectOption) => convertOptionToSingleSelectItem(option, !allOptionsGray),
    [allOptionsGray],
  )
  const filteredOptions = useMemo(() => {
    // Filter down available options to just those which are being currently rendered
    const activeOptions = optionsPlusNone.filter(option => isColumnVisible(option.id))
    if (filterValue !== '') return filterSuggestedSingleSelectOptions(filterValue, activeOptions, 10).filteredItems
    return activeOptions
  }, [filterValue, isColumnVisible, optionsPlusNone])
  const items = useMemo(() => filteredOptions.map(convertOption), [convertOption, filteredOptions])
  const selectedItem = useMemo(() => items.find(item => item.selected), [items])

  if (model.contentType === ItemType.RedactedItem) return null

  return (
    <SelectPanel
      open
      onOpenChange={onOpenChange}
      items={items}
      selected={selectedItem}
      filterValue={filterValue}
      onFilterChange={setFilterValue}
      onSelectedChange={(nextSelected: ItemInput | undefined) => {
        if (!nextSelected || nextSelected.id === MissingVerticalGroupId) {
          saveSelected([])

          onChangeField({
            nextValue: null,
            currentValue: selectedOption ? selectedOption.id : null,
          })
        } else {
          const selected = options.filter(option => option.id === nextSelected.id)
          saveSelected(selected)

          onChangeField({
            nextValue: nextSelected.id ?? null,
            currentValue: selectedOption ? selectedOption.id : null,
          })
        }
      }}
      placeholderText="Filter options"
      renderAnchor={({children, ...anchorProps}) => <div {...anchorProps}>{children}</div>}
      anchorRef={anchorRef}
      {...testIdProps('move-to-single-select-field-menu')}
    />
  )
}

function MoveToIterationFieldMenu({
  model,
  groupByField,
  onOpenChange,
  anchorRef,
  isColumnVisible,
  onChangeField,
}: MoveToFieldMenuProps<typeof MemexColumnDataType.Iteration>) {
  const [filterValue, setFilterValue] = useState('')

  const selectedIterationOption = model.getCustomField<IterationValue>(groupByField.id)
  const iterationOptions = getAllIterationsForConfiguration(groupByField.settings.configuration)
  const iteration = iterationOptions.find(option => option.id === selectedIterationOption?.id) ?? null

  const {activeOptions, completedOptions, filterChange, saveSelected} = useIterationEditor({
    model,
    columnModel: groupByField,
    iteration,
  })
  const optionsPlusNone = useMemo<Array<SuggestedIterationOption>>(
    () => [
      ...activeOptions,
      ...completedOptions,
      {
        id: MissingVerticalGroupId,
        label: `No ${groupByField.name}`,
        selected: selectedIterationOption === undefined,
        duration: 0,
        startDate: '',
        title: `No ${groupByField.name}`,
        titleHtml: `No ${groupByField.name}`,
      },
    ],
    [activeOptions, completedOptions, groupByField.name, selectedIterationOption],
  )
  const filteredOptions = useMemo(() => {
    const optionsFilteredByQuery =
      filterValue !== '' ? filterChange(filterValue, optionsPlusNone, 10).filteredItems : optionsPlusNone
    // Filter down available options to just those which are being currently rendered
    return optionsFilteredByQuery.filter(option => isColumnVisible(option.id))
  }, [filterChange, filterValue, isColumnVisible, optionsPlusNone])
  const items = useMemo(() => filteredOptions.map(convertOptionToIterationItem), [filteredOptions])
  const selectedItem = useMemo(() => items.find(item => item.selected), [items])

  if (model.contentType === ItemType.RedactedItem) return null

  return (
    <SelectPanel
      open
      onOpenChange={onOpenChange}
      items={items}
      selected={selectedItem}
      filterValue={filterValue}
      onFilterChange={setFilterValue}
      onSelectedChange={(nextSelected: ItemInput | undefined) => {
        if (!nextSelected || nextSelected.id === MissingVerticalGroupId) {
          saveSelected([])

          onChangeField({
            nextValue: null,
            currentValue: selectedIterationOption ? selectedIterationOption.id : null,
          })
        } else {
          const selected = optionsPlusNone.filter(option => option.id === nextSelected.id)
          saveSelected(selected)

          onChangeField({
            nextValue: nextSelected.id ?? null,
            currentValue: selectedIterationOption ? selectedIterationOption.id : null,
          })
        }
      }}
      placeholderText="Filter options"
      renderAnchor={({children, ...anchorProps}) => <div {...anchorProps}>{children}</div>}
      anchorRef={anchorRef}
      {...testIdProps('move-to-iteration-field-menu')}
    />
  )
}

type CopyUrlProps = {url: string; label: string; testId: string}
const CopyUrl = ({url, label, testId}: CopyUrlProps) => {
  const onSelect = useCallback(() => {
    try {
      navigator.clipboard.writeText(url)
    } catch (error) {
      // ignore error when user did not grant clipboard access
    }
  }, [url])

  return (
    <ActionList.Item onSelect={onSelect} {...testIdProps(testId)}>
      <ActionList.LeadingVisual>
        <CopyIcon />
      </ActionList.LeadingVisual>
      {label}
    </ActionList.Item>
  )
}
