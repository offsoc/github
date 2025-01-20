import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {ActionList, useRefObjectAsForwardedRef} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback, useEffect, useRef, useState} from 'react'
import type {CSSProperties} from 'styled-components'

import {usePrefixedId} from '../hooks/common/use-prefixed-id'
import getPositionOnScreen, {type XEdge} from '../hooks/get-position-on-screen'
import {useActiveDescendant} from '../hooks/use-active-descendant'
import {Resources} from '../strings'
import {useEventHandler} from './board/hooks/use-event-handler'
import {Portal} from './common/portal'
import {SuggestionsListItem, type SuggestionsListItemProps} from './suggestions-list-item'

export type SuggestionItems = Array<Omit<SuggestionsListItemProps, 'selected' | 'selectedItemRef' | 'id'>>

interface SuggestionsListProps {
  items: SuggestionItems
  controllingElementRef: React.RefObject<HTMLElement>
  inputRef?: React.RefObject<HTMLElement>
  listRef: React.Ref<HTMLUListElement>
  xAlign?: XEdge
  xOriginEdgeAlign?: XEdge
  testId: string
  style?: Pick<CSSProperties, 'width' | 'minWidth' | 'maxWidth' | 'marginLeft'>
}

/**
 * A simple list component that can be used to render a list of suggestions.
 * Supports basic keyboard navigation.
 */

const SuggestionsList: React.FC<SuggestionsListProps> = (props: SuggestionsListProps) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0)
  const {items, controllingElementRef, inputRef} = props

  const getListItemId = useCallback((index: number) => items[index]?.testId, [items])
  useActiveDescendant({inputRef: inputRef ?? controllingElementRef, selectedIndex: selectedItemIndex, getListItemId})

  useEffect(() => {
    setSelectedItemIndex(0)
  }, [items.length])

  const selectNextItem = useCallback(() => {
    setSelectedItemIndex(idx => (idx == null || idx + 1 === items.length ? 0 : idx + 1))
  }, [items.length])

  const selectPreviousItem = useCallback(() => {
    setSelectedItemIndex(idx => (idx == null || idx === 0 ? items.length - 1 : idx - 1))
  }, [items.length])

  useLayoutEffect(() => {
    selectedItemRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
  }, [selectedItemIndex])

  const onKeyDown = useEventHandler(
    (e: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (e.key) {
        case 'ArrowDown':
          selectNextItem()
          return true
        case 'ArrowUp':
          selectPreviousItem()
          return true
        case 'Enter':
          if (items.length) {
            items[selectedItemIndex]?.onSelect()
            return true
          }
          return false
        default:
          return false
      }
    },
    [items, selectNextItem, selectPreviousItem, selectedItemIndex],
  )

  useEffect(() => {
    addEventListener('keydown', onKeyDown)

    return () => {
      removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  const selectedItemRef = useRef<HTMLLIElement>(null)
  const portalId = usePrefixedId('__omnibarPortalRoot__')
  return items.length > 0 ? (
    <Portal id={portalId}>
      <List
        items={items}
        controllingElementRef={props.controllingElementRef}
        listRef={props.listRef}
        selectedItemIndex={selectedItemIndex}
        selectedItemRef={selectedItemRef}
        xAlign={props.xAlign}
        xOriginEdgeAlign={props.xOriginEdgeAlign}
        testId={props.testId}
        style={props.style}
      />
    </Portal>
  ) : null
}

const listSuggestionsStyles: BetterSystemStyleObject = {
  position: 'absolute',
  width: '300px',
  maxHeight: '220px',
  zIndex: 200,
  overflowY: 'auto',
  overflowX: 'hidden',
  m: 0,
  ml: '22px',
  py: 2,
  pr: 0,
  pl: 1,
  listStyle: 'none',
  bg: 'canvas.overlay',
  borderRadius: '12px',
  boxShadow: 'shadow.large',
}

function List({
  items,
  controllingElementRef,
  listRef: externalListRef,
  selectedItemIndex,
  selectedItemRef,
  xAlign,
  xOriginEdgeAlign,
  testId,
  style,
}: SuggestionsListProps & {selectedItemIndex: number; selectedItemRef: React.RefObject<HTMLLIElement>}) {
  const listRef = useRef<HTMLUListElement>(null)

  useRefObjectAsForwardedRef(externalListRef, listRef)

  useStyledSuggestionListStyles({
    controllingElementRef,
    items,
    listRef,
    xAlign,
    xOriginEdgeAlign,
  })

  return (
    <div role="dialog" aria-label="Filter suggestions">
      <ActionList
        sx={{...listSuggestionsStyles, ...style}}
        id={testId}
        aria-label="Results"
        role="listbox"
        ref={listRef}
        {...testIdProps(testId)}
        tabIndex={-1}
      >
        {items.map((item, index) => {
          return (
            <SuggestionsListItem
              id={item.testId}
              key={index}
              value={item.value}
              testId={item.testId}
              asHTML={item.asHTML}
              onSelect={item.onSelect}
              renderItem={item.renderItem}
              selected={selectedItemIndex === index}
              selectedItemRef={selectedItemIndex === index ? selectedItemRef : null}
            />
          )
        })}
      </ActionList>
      <span
        className="sr-only"
        id={`${testId}-feedback`}
        aria-live="polite"
        aria-atomic="true"
        {...testIdProps(`${testId}-feedback`)}
      >
        {Resources.resultCount(items.length)}
      </span>
    </div>
  )
}

/**
 * A hooks that returns a stateful style object
 * used to position the suggestions list
 * so that it is visible on screen after a re-render
 */
function useStyledSuggestionListStyles<T>({
  controllingElementRef,
  items,
  listRef,
  xAlign = 'left',
  xOriginEdgeAlign = 'right',
}: {
  controllingElementRef: React.RefObject<Element>
  items: Array<T>
  listRef: React.RefObject<HTMLUListElement>
  xAlign?: XEdge
  xOriginEdgeAlign?: XEdge
  style?: CSSProperties
}) {
  useEffect(() => {
    const {current} = listRef
    if (!controllingElementRef.current || !current) {
      return
    }

    const coordinates = getPositionOnScreen({
      originRef: controllingElementRef,
      contentRef: listRef,
      alignment: {xAlign, xOriginEdgeAlign},
    })

    current.style.top = `${coordinates.top}px`
    current.style.left = `${coordinates.left}px`
    current.style.transition = `left 0.1s ease`
  }, [controllingElementRef, items, listRef, xAlign, xOriginEdgeAlign])
}

export default SuggestionsList

SuggestionsList.displayName = 'SuggestionsList'
