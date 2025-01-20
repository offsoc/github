import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {type SxProp, useRefObjectAsForwardedRef} from '@primer/react'
import {clsx} from 'clsx'
import {forwardRef, memo, useCallback, useContext, useEffect, useMemo, useRef} from 'react'
import {ThemeContext} from 'styled-components'

import {ItemType} from '../../../api/memex-items/item-type'
import {
  type BoardActionUI,
  BoardCardKeyboardUI,
  CardMove,
  CardMoveUI,
  type CardMoveUIType,
} from '../../../api/stats/contracts'
import {isMemexItemTypeArchivable} from '../../../helpers/archive-util'
import {SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {defined, isPlatformMeta} from '../../../helpers/util'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {sashClasses} from '../../../hooks/drag-and-drop/transformation'
import {useArchiveMemexItemsWithConfirmation} from '../../../hooks/use-archive-memex-items-with-confirmation'
import {useRemoveMemexItemWithConfirmation} from '../../../hooks/use-remove-memex-items-with-id'
import {useBoardSidePanel, useSidePanel} from '../../../hooks/use-side-panel'
import {useSortedBy} from '../../../hooks/use-sorted-by'
import {getHovercardSubjectTag, type MemexItemModel} from '../../../models/memex-item-model'
import {StatsNoValueGroupId} from '../../../models/vertical-group'
import {handleKeyboardNavigation, suppressEvents} from '../../../navigation/keyboard'
import {FocusType} from '../../../navigation/types'
import {Direction} from '../../../selection/types'
import {useFindMemexItem} from '../../../state-providers/memex-items/use-find-memex-item'
import {useCopyPaste} from '../../react_table/hooks/use-copy-paste'
import {CARD_MARGIN_BOTTOM} from '../constants'
import {useBoardCardActions} from '../hooks/use-board-card-actions'
import {useCardSelection} from '../hooks/use-card-selection'
import {
  type BoardFocus,
  type BoardNavigateAction,
  cardHasFocus,
  clearFocus,
  focusCard,
  focusNearestCard,
  selectCardsToMove,
  useStableBoardNavigation,
} from '../navigation'
import {CardBaseWithSash} from './card-base-with-sash'
import {CardInternalContent} from './card-internal-content'
import {INPUT_ELEMENT_NAME} from './constants'
import type {CardProps} from './types'

function eventTargetHasSuspendCardFocusAttribute(
  cardElementRef: React.RefObject<HTMLElement | null>,
  e: React.MouseEvent<HTMLElement>,
) {
  if (cardElementRef.current) {
    const elementWithAttribute = (e.target as HTMLElement).closest('[data-suspend-card-focus]')
    return elementWithAttribute != null && cardElementRef.current.contains(elementWithAttribute)
  }
  return false
}

const Card = memo(
  forwardRef<HTMLDivElement, CardProps & SxProp>(function Card(
    {
      item,
      scrollIntoView,
      index,
      verticalGroup,
      columnIndex,
      horizontalGroupIndex,
      onMouseDown,
      focusType,
      keyboardMovingCard,
      isDragDisabled,
      isVisible,
      size,
      ...rest
    },
    forwardedRef,
  ) {
    const theme = useContext(ThemeContext)
    const contextMenuRef = useRef<HTMLDivElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    useRefObjectAsForwardedRef(forwardedRef, ref)
    const {moveCard, moveCards, moveCardToPosition} = useBoardCardActions()
    const {navigationDispatch, stateRef: focusState} = useStableBoardNavigation()
    const {
      expandColumnSelectionViaKeys,
      filteredSelectedCardIds,
      onCardClick,
      resetSelection,
      selectSingleCard,
      selectAllCycle,
      state: selectionState,
    } = useCardSelection(item, contextMenuRef, horizontalGroupIndex, columnIndex)
    const {clearClipboard, copyItems: copyItemsToClipboard} = useCopyPaste()
    const {openPane: openSidePanel} = useBoardSidePanel()
    const {supportedItemTypes} = useSidePanel()
    const {hasWritePermissions} = ViewerPrivileges()
    const {findMemexItem} = useFindMemexItem()
    const {isSorted} = useSortedBy()
    const {postStats} = usePostStats()

    const isRedactedItem = item.contentType === ItemType.RedactedItem
    const isSelected = !isRedactedItem && !!selectionState[item.id]
    const isKeyboardMovingCard = keyboardMovingCard?.cardIds.includes(item.id)
    const isMovingMultipleCards = (keyboardMovingCard?.cardIds.length ?? 0) > 1

    const showKeyboardMoveSash =
      focusType === FocusType.Focus && keyboardMovingCard && keyboardMovingCard.cardIds.length <= 1
    const keyboardMovingCardSashSide = focusType === FocusType.Focus ? keyboardMovingCard?.sashSide : undefined

    const refocusCard = useCallback(() => {
      navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, item.id))
    }, [horizontalGroupIndex, columnIndex, item, navigationDispatch])

    const focusNearestCardOnDelete = useCallback(() => {
      resetSelection()
      navigationDispatch(focusNearestCard(index, columnIndex, horizontalGroupIndex, item.id, findMemexItem))
    }, [resetSelection, navigationDispatch, index, columnIndex, horizontalGroupIndex, item.id, findMemexItem])

    const {openRemoveConfirmationDialog} = useRemoveMemexItemWithConfirmation(
      undefined,
      focusNearestCardOnDelete,
      refocusCard,
    )
    const {openArchiveConfirmationDialog} = useArchiveMemexItemsWithConfirmation(
      undefined,
      focusNearestCardOnDelete,
      refocusCard,
    )

    const archiveItem = useCallback(
      (ui: BoardActionUI) => {
        const ids = isSelected && filteredSelectedCardIds.length > 1 ? filteredSelectedCardIds : [item.id]
        const isSelectionArchivable = ids.every(id => {
          const cardItem = findMemexItem(id)
          return cardItem ? isMemexItemTypeArchivable(cardItem.contentType) : false
        })

        if (isSelectionArchivable) {
          openArchiveConfirmationDialog(ids, ui)
        }
      },
      [isSelected, filteredSelectedCardIds, item.id, findMemexItem, openArchiveConfirmationDialog],
    )

    const removeItem = useCallback(
      (ui: BoardActionUI) => {
        const ids = isSelected && filteredSelectedCardIds.length > 1 ? filteredSelectedCardIds : [item.id]
        openRemoveConfirmationDialog(ids, ui)
      },
      [filteredSelectedCardIds, isSelected, item.id, openRemoveConfirmationDialog],
    )

    const moveItemToTop = useCallback(
      (ui: CardMoveUIType) => {
        if (!hasWritePermissions) return

        moveCardToPosition(item.id, verticalGroup.id, 'top')

        const fieldId = verticalGroup.groupMetadata?.id ?? StatsNoValueGroupId
        postStats({
          name: CardMove,
          ui,
          context: JSON.stringify({type: 'top', fieldId, itemId: item.id}),
        })
      },
      [hasWritePermissions, item.id, moveCardToPosition, postStats, verticalGroup.groupMetadata?.id, verticalGroup.id],
    )

    const moveItemToBottom = useCallback(
      (ui: CardMoveUIType) => {
        if (!hasWritePermissions) return

        moveCardToPosition(item.id, verticalGroup.id, 'bottom')

        const fieldId = verticalGroup.groupMetadata?.id ?? StatsNoValueGroupId
        postStats({
          name: CardMove,
          ui,
          context: JSON.stringify({type: 'bottom', fieldId, itemId: item.id}),
        })
      },
      [hasWritePermissions, item.id, moveCardToPosition, postStats, verticalGroup.groupMetadata?.id, verticalGroup.id],
    )

    const copyItems = useCallback(() => {
      const selected =
        isSelected && filteredSelectedCardIds.length > 1
          ? filteredSelectedCardIds.reduce<Array<MemexItemModel>>((acc, id) => {
              const model = findMemexItem(id)
              if (model) acc.push(model)
              return acc
            }, [])
          : [item]

      // In table view, we only include headers when copying the full table. But in board view, we always include headers
      // because they are not visible, so there's no predetermined expectation here.
      copyItemsToClipboard(selected, {withHeaders: true})
    }, [isSelected, filteredSelectedCardIds, item, findMemexItem, copyItemsToClipboard])

    const height = isVisible ? 'unset' : `${size}px`
    const style = useMemo(
      () => ({
        ...rest.sx,
        borderRadius: 2,
        borderColor: theme.colors.border.default,
        borderWidth: '1px',
        borderStyle: 'solid',
        boxShadow: theme.shadows.shadow.medium,
        height,
        '&:hover': {cursor: isRedactedItem ? 'not-allowed' : isDragDisabled ? 'default' : 'grab'},
      }),
      [rest.sx, theme.colors.border.default, theme.shadows.shadow.medium, height, isRedactedItem, isDragDisabled],
    )

    const keyboardSelectCards = useCallback(() => {
      if (keyboardMovingCard) {
        resetSelection()
      }

      if (filteredSelectedCardIds.length === 0) {
        selectSingleCard(item.id)
      }

      if (hasWritePermissions) {
        const ids = filteredSelectedCardIds.length > 1 ? filteredSelectedCardIds : [item.id]
        const currentFocusedCardId =
          focusState.current?.focus?.type === 'coordinate' ? focusState.current.focus.details.y : undefined
        if (currentFocusedCardId) {
          navigationDispatch(selectCardsToMove(currentFocusedCardId, horizontalGroupIndex, columnIndex, ids))
        }
      } else {
        navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, item.id))
      }
    }, [
      keyboardMovingCard,
      filteredSelectedCardIds,
      hasWritePermissions,
      resetSelection,
      selectSingleCard,
      horizontalGroupIndex,
      item.id,
      focusState,
      navigationDispatch,
      columnIndex,
    ])

    const keyboardMoveSelectedCard = useCallback(
      (cardId: number, side: 'top' | 'bottom') => {
        const card = findMemexItem(cardId)
        if (!card) return

        moveCard(card, item.id, side, verticalGroup)
        const fieldId = verticalGroup.groupMetadata?.id ?? StatsNoValueGroupId
        postStats({
          name: CardMove,
          ui: CardMoveUI.KeyboardShortcut,
          context: JSON.stringify({
            fieldId,
            itemId: cardId,
          }),
        })

        // Clear selected cards
        resetSelection()

        // Focus the card that was moved to current column
        navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, cardId))
      },
      [
        findMemexItem,
        moveCard,
        item.id,
        verticalGroup,
        postStats,
        resetSelection,
        navigationDispatch,
        horizontalGroupIndex,
        columnIndex,
      ],
    )

    /** Move the currently selected cards to the focused column */
    const keyboardMoveSelectedCards = useCallback(
      (cardIds: Array<number>) => {
        const items = cardIds.map(id => findMemexItem(id)).filter(defined)
        moveCards(items, verticalGroup)
        const fieldId = verticalGroup.groupMetadata?.id ?? StatsNoValueGroupId
        postStats({
          name: CardMove,
          ui: CardMoveUI.KeyboardShortcut,
          context: JSON.stringify({
            fieldId,
            itemIds: items.map(i => i.id),
          }),
        })

        // Return focus to the card that was first focused, but in the new column
        if (keyboardMovingCard) {
          navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, keyboardMovingCard.returnFocus.cardId))
        }
      },
      [
        moveCards,
        verticalGroup,
        postStats,
        keyboardMovingCard,
        findMemexItem,
        navigationDispatch,
        horizontalGroupIndex,
        columnIndex,
      ],
    )

    useEffect(() => {
      if (focusType !== FocusType.Focus || !ref.current) {
        return
      }
      ref.current.focus()
      ref.current.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'smooth'})
    }, [focusType, ref])

    useEffect(() => {
      if (scrollIntoView) {
        ref.current?.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'smooth'})
      }
    }, [scrollIntoView])

    const wrappedOnMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback(
      e => {
        // do not modify focus if user is shift/control clicking (multi select)
        const anyCardHasFocus = focusState.current?.focus?.type === 'coordinate'
        if (e.shiftKey || (isPlatformMeta(e) && anyCardHasFocus)) return e.preventDefault()

        // Clear any selected cards if we're no longer going to be moving a card with the keyboard.
        if (keyboardMovingCard) {
          resetSelection()
        }

        if (focusType !== FocusType.Edit) {
          // We don't want to respond to the mousedown to focus the card if we're in edit mode.
          // If the event is in the textarea, we want it to be handled there.
          // If it is somewhere else in the card that we're editing, we can rely on the blur
          // event that will be fired by the currently focused element.

          const shouldSuspendFocus = eventTargetHasSuspendCardFocusAttribute(ref, e)
          if (shouldSuspendFocus) {
            e.stopPropagation()
            navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, item.id, FocusType.Suspended))
          } else {
            navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, item.id))
            if (onMouseDown) {
              onMouseDown(e)
            }
          }
        }
      },
      [
        focusState,
        keyboardMovingCard,
        focusType,
        resetSelection,
        navigationDispatch,
        columnIndex,
        item.id,
        onMouseDown,
        horizontalGroupIndex,
      ],
    )

    const onKeyDown: React.KeyboardEventHandler = useCallback(
      e => {
        const element = e.target as HTMLElement
        if (focusType === FocusType.Focus && element.nodeName !== INPUT_ELEMENT_NAME) {
          // We are overriding the dispatch function with a noop so that we can prevent the dispatch
          // in some cases where we don't want to ignore the key event
          const result = handleKeyboardNavigation<
            BoardFocus,
            NonNullable<BoardNavigateAction['navigation']['details']>
          >(noop, e)
          if (result.action) {
            // We will still suppress events even if the action is not dispatched, to prevent things
            // like scrolling up and down the container.
            suppressEvents(e)

            // If the column is sorted, then we will skip moving the focus Y coordinate up and down, since
            // cards will be automatically sorted, so Y position will be computed based on the sort order.
            // Similarly, we also want to skip moving the focus Y coordinate if we are moving multiple cards.
            if ((isSorted || isMovingMultipleCards) && keyboardMovingCard && result.action.navigation.y) {
              return
            }
            navigationDispatch(result.action)

            // We do not want to lose reference to the selected card as a user navigates the board with a keyboard.
            // If multiple cards are selected, we want to deselect them until multiple card keyboard moving is
            // available.
            if (!keyboardMovingCard) {
              resetSelection()
            }
          } else if (
            (result.keyAsShortcut === SHORTCUTS.DELETE || result.keyAsShortcut === SHORTCUTS.BACKSPACE) &&
            hasWritePermissions &&
            !isRedactedItem
          ) {
            removeItem(BoardCardKeyboardUI)
            suppressEvents(e)
          } else if (result.keyAsShortcut === SHORTCUTS.ARCHIVE) {
            archiveItem(BoardCardKeyboardUI)
            suppressEvents(e)
          } else if (
            result.keyAsShortcut === SHORTCUTS.SHIFT_ARROW_UP ||
            result.keyAsShortcut === SHORTCUTS.SHIFT_ARROW_DOWN
          ) {
            // If we are moving a card with a keyboard, and expand the selection we should clear that the card is selected.
            if (keyboardMovingCard) {
              refocusCard()
            }

            const direction = result.keyAsShortcut === SHORTCUTS.SHIFT_ARROW_UP ? Direction.Up : Direction.Down
            expandColumnSelectionViaKeys(direction)
            suppressEvents(e)
          } else if (result.keyAsShortcut === SHORTCUTS.ENTER && keyboardMovingCard) {
            const side = keyboardMovingCardSashSide === 'before' ? 'top' : 'bottom'

            // Card selected while another card had been previously been selected and needs to be moved.
            if (keyboardMovingCard.cardIds.length === 1) {
              const cardId = keyboardMovingCard.cardIds[0]
              if (cardId) {
                keyboardMoveSelectedCard(cardId, side)
              }
            } else {
              keyboardMoveSelectedCards(keyboardMovingCard.cardIds)
            }
          } else if (
            (result.keyAsShortcut === SHORTCUTS.SHIFT_SPACE || result.keyAsShortcut === SHORTCUTS.ENTER) &&
            !isRedactedItem
          ) {
            keyboardSelectCards()
          } else if (result.keyAsShortcut === SHORTCUTS.SPACE && supportedItemTypes.has(item.contentType)) {
            openSidePanel(item)
          } else if (result.keyAsShortcut === SHORTCUTS.META_A) {
            selectAllCycle()
            suppressEvents(e)
          } else if (result.keyAsShortcut === SHORTCUTS.ESCAPE) {
            clearClipboard()
            resetSelection()

            if (keyboardMovingCard) {
              navigationDispatch(
                focusCard(
                  keyboardMovingCard.returnFocus.horizontalGroupIndex,
                  keyboardMovingCard.returnFocus.columnIndex,
                  keyboardMovingCard.returnFocus.cardId,
                ),
              )
            }
          } else if (result.keyAsShortcut === SHORTCUTS.META_C && hasWritePermissions && !isRedactedItem) {
            copyItems()
          } else if (result.keyAsShortcut === SHORTCUTS.TAB) {
            resetSelection()

            if (keyboardMovingCard) {
              navigationDispatch(
                focusCard(
                  keyboardMovingCard.returnFocus.horizontalGroupIndex,
                  keyboardMovingCard.returnFocus.columnIndex,
                  keyboardMovingCard.returnFocus.cardId,
                ),
              )
            } else {
              navigationDispatch(clearFocus())
            }
          }
        }
      },
      [
        focusType,
        hasWritePermissions,
        isRedactedItem,
        keyboardMovingCard,
        supportedItemTypes,
        item,
        isSorted,
        isMovingMultipleCards,
        navigationDispatch,
        resetSelection,
        removeItem,
        archiveItem,
        expandColumnSelectionViaKeys,
        refocusCard,
        keyboardMovingCardSashSide,
        keyboardMoveSelectedCard,
        keyboardMoveSelectedCards,
        keyboardSelectCards,
        openSidePanel,
        selectAllCycle,
        clearClipboard,
        copyItems,
      ],
    )

    const onFocus = useCallback(() => {
      if (cardHasFocus(focusState.current, item.id, columnIndex) || document.activeElement !== ref.current) {
        // We don't want to dispatch the action if the card is already focused in the navigation context.
        // We also don't want to dispatch the action if an element in the card is focused, as opposed to the card itself.
        return
      }
      navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, item.id))
    }, [focusState, item.id, columnIndex, navigationDispatch, horizontalGroupIndex])

    const onBlur: React.FocusEventHandler<HTMLElement> = useCallback(
      e => {
        // if no relatedTarget, then we are clicking outside of the card
        if (!e.relatedTarget) {
          resetSelection()
          navigationDispatch(clearFocus())
          return
        }

        if (
          focusType === FocusType.Suspended &&
          ref.current &&
          // ActionMenu will place focus on document.body when it opens...
          (ref.current.contains(document.activeElement) || document.activeElement === document.body)
        ) {
          // normally we will clear focus in an onBlur handler in the board, but we want to
          // prevent that behavior if we are in a card in a suspended focus state, and the
          // new activeElement is still a child of the card
          e.preventDefault()
        }
      },
      [focusType, resetSelection, navigationDispatch],
    )

    // Conditionally generate class names necessary to display permanant sash while moving a card with a keyboard.
    const keyboardMoveSashClassNames = useMemo(() => {
      if (showKeyboardMoveSash && keyboardMovingCardSashSide && !isSorted) {
        return Object.fromEntries(
          sashClasses(keyboardMovingCardSashSide, 'card', true).map<[className: string, enabled: boolean]>(
            className => [className, true],
          ),
        )
      }
      return {}
    }, [isSorted, keyboardMovingCardSashSide, showKeyboardMoveSash])

    return (
      <CardBaseWithSash
        {...testIdProps(`board-view-column-card`)}
        sx={{
          ...style,
          flexDirection: 'column',
          flexShrink: 0,
          mb: `${CARD_MARGIN_BOTTOM}px`,
          overflow: 'visible',
        }}
        ref={ref}
        data-board-card-id={item.id}
        data-hovercard-subject-tag={getHovercardSubjectTag(item)}
        onMouseDown={wrappedOnMouseDown}
        onClick={onCardClick}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={clsx(keyboardMoveSashClassNames, {
          'keyboard-moving-card': isKeyboardMovingCard,
          'suspended-focus': focusType === FocusType.Suspended,
          selected: isSelected,
          'board-view-column-card': true,
        })}
        {...rest}
        data-test-card-is-selected={isSelected || undefined}
        data-test-keyboard-moving-card={isKeyboardMovingCard || undefined}
        data-test-card-is-focused={focusType === FocusType.Focus || undefined}
      >
        {isVisible ? (
          <CardInternalContent
            item={item}
            verticalGroupId={verticalGroup.id}
            archiveItem={archiveItem}
            removeItem={removeItem}
            moveItemToTop={moveItemToTop}
            moveItemToBottom={moveItemToBottom}
            contextMenuRef={contextMenuRef}
          />
        ) : null}
      </CardBaseWithSash>
    )
  }),
)

Card.displayName = 'Card'

export {Card}
