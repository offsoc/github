import {testIdProps} from '@github-ui/test-id-props'
import {type SxProp, useRefObjectAsForwardedRef} from '@primer/react'
import {clsx} from 'clsx'
import {forwardRef, memo, useCallback, useEffect, useRef} from 'react'

import {CardMove, CardMoveUI} from '../../../api/stats/contracts'
import {SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {defined} from '../../../helpers/util'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useSortedBy} from '../../../hooks/use-sorted-by'
import {StatsNoValueGroupId} from '../../../models/vertical-group'
import {handleKeyboardNavigation, suppressEvents} from '../../../navigation/keyboard'
import {FocusType} from '../../../navigation/types'
import {useFindMemexItem} from '../../../state-providers/memex-items/use-find-memex-item'
import {useBoardCardActions} from '../hooks/use-board-card-actions'
import {useCardSelection} from '../hooks/use-card-selection'
import {focusCard, KeyboardMoveCardCoordinate, type MovingCards, useStableBoardNavigation} from '../navigation'
import {INPUT_ELEMENT_NAME} from './constants'
import {StyledKeyboardMovingCardPlaceholder} from './styled-keyboard-moving-card-placeholder'
import type {CardWithoutItemProps} from './types'

type KeyboardMovingCardPlaceholderProps = {
  keyboardMovingCard: MovingCards
}

/**
 * KeyboardMovingCardPlaceholder is a placeholder component used to provide continued keyboard navigation throughout
 * the board when a user encounters an empty column moving a card.
 *
 * This placeholder component must only be rendered at most once on the page. When the user navigates across
 * columns with no cards, a new KeyboardMovingCardPlaceholder component will be rendered in each column.
 *
 * The user can move a card to the column this placeholder component is rendered in by pressing Enter. Other shared
 * keyboard commands such as Arrow keys, Escape, and Tab all work as they do on ordinary Card components.
 */
export const KeyboardMovingCardPlaceholder = memo(
  forwardRef<HTMLDivElement, CardWithoutItemProps & KeyboardMovingCardPlaceholderProps & SxProp>(
    function KeyboardMovingCardPlaceholder(
      {keyboardMovingCard, verticalGroup, columnIndex, focusType, horizontalGroupIndex, ...rest},
      forwardedRef,
    ) {
      const ref = useRef<HTMLDivElement>(null)
      useRefObjectAsForwardedRef(forwardedRef, ref)
      const {moveCard, moveCards} = useBoardCardActions()
      const {navigationDispatch} = useStableBoardNavigation()
      const {resetSelection} = useCardSelection(undefined, undefined, horizontalGroupIndex, columnIndex)
      const {isSorted} = useSortedBy()
      const {findMemexItem} = useFindMemexItem()
      const {postStats} = usePostStats()

      const moveSelectedCards = useCallback(() => {
        if (keyboardMovingCard.cardIds.length === 1) {
          const cardId = keyboardMovingCard.cardIds[0]
          if (cardId) {
            const side = keyboardMovingCard.sashSide === 'after' ? 'bottom' : 'top'
            const card = findMemexItem(cardId)
            if (card) moveCard(card, undefined, side, verticalGroup)
          }
        } else {
          const items = keyboardMovingCard.cardIds.map(id => findMemexItem(id)).filter(defined)
          moveCards(items, verticalGroup)
        }

        postStats({
          name: CardMove,
          ui: CardMoveUI.KeyboardShortcut,
          context: JSON.stringify({
            fieldId: verticalGroup.groupMetadata?.id ?? StatsNoValueGroupId,
            ...(keyboardMovingCard.cardIds.length > 1
              ? {itemIds: keyboardMovingCard.cardIds}
              : {itemId: keyboardMovingCard.cardIds[0]}),
          }),
        })
        // Move focus to the first focused card in the new column
        navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, keyboardMovingCard.returnFocus.cardId))
      }, [
        horizontalGroupIndex,
        keyboardMovingCard.cardIds,
        keyboardMovingCard.returnFocus.cardId,
        keyboardMovingCard.sashSide,
        navigationDispatch,
        columnIndex,
        moveCard,
        verticalGroup,
        moveCards,
        findMemexItem,
        postStats,
      ])

      // There will only ever be one KeyboardMovingCardPlaceholder component rendered a time, and when it is rendered,
      // it needs to be focused allowing KeyboardMovingCardPlaceholder to continue receiving onKeyDown events enabling
      // the user to determine where to direct focus next or move to the column.
      useEffect(() => {
        ref.current?.focus()
      }, [ref])

      const onKeyDown: React.KeyboardEventHandler = useCallback(
        e => {
          const element = e.target as HTMLElement
          if (focusType === FocusType.Focus && element.nodeName !== INPUT_ELEMENT_NAME) {
            const result = handleKeyboardNavigation(navigationDispatch, e)
            if (result.action) {
              suppressEvents(e)
            } else if (result.keyAsShortcut === SHORTCUTS.ENTER) {
              moveSelectedCards()
            } else if (result.keyAsShortcut === SHORTCUTS.ESCAPE || result.keyAsShortcut === SHORTCUTS.TAB) {
              resetSelection()

              navigationDispatch(
                focusCard(
                  keyboardMovingCard.returnFocus.horizontalGroupIndex,
                  keyboardMovingCard.returnFocus.columnIndex,
                  keyboardMovingCard.returnFocus.cardId,
                ),
              )
            }
          }
        },
        [
          focusType,
          navigationDispatch,
          moveSelectedCards,
          resetSelection,
          keyboardMovingCard.returnFocus.horizontalGroupIndex,
          keyboardMovingCard.returnFocus.columnIndex,
          keyboardMovingCard.returnFocus.cardId,
        ],
      )

      // The placeholder should be visually hidden when the column itself is focused, not a particular position,
      // but we still need an element to receive focus and keyboard events
      const isMovingMultipleCards = keyboardMovingCard.cardIds.length > 1
      const visuallyHidden = isSorted || isMovingMultipleCards

      return (
        <StyledKeyboardMovingCardPlaceholder
          {...testIdProps('board-view-keyboard-moving-card-placeholder')}
          ref={ref}
          data-board-card-id={KeyboardMoveCardCoordinate}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className={clsx({
            'suspended-focus': focusType === FocusType.Suspended,
          })}
          {...rest}
          data-test-card-is-focused
          // We are using "opacity: 0" here vs "display: none" because the placeholder should still be focusable
          // but visually hidden when the column is sorted (since the sash position is irrelevant).
          sx={{opacity: visuallyHidden ? 0 : 1}}
        />
      )
    },
  ),
)
