import type {LineRange} from '@github-ui/diff-lines'
import {parseLineRangeHash} from '@github-ui/diff-lines/document-hash-helpers'
import {useObserveSelector} from '@github-ui/use-observe-selector'
import {useEffect, useState, useSyncExternalStore} from 'react'
import {DiffSelectionEvent} from './diff-selection-event'
import {useIsFocusWithinElement} from './use-is-focus-within-element'

export interface ActiveLines extends LineRange {
  /** The element into which we will insert the floating menu. */
  topRightElement: HTMLTableCellElement
}

const useSelectedLines = (): ActiveLines | null => {
  const hash = useSyncExternalStore(
    onUpdate => {
      window.addEventListener(DiffSelectionEvent.NAME, onUpdate)
      return () => window.removeEventListener(DiffSelectionEvent.NAME, onUpdate)
    },
    () => window.location.hash,
  )

  const lineRange = parseLineRangeHash(hash)
  if (!lineRange) return null

  // get the topmost and furthest-right selected line, and use that as the portal element
  const rightElement = document.querySelector<HTMLTableCellElement>(
    '.selected-line.selected-line-top.blob-code:not(.js-skip-tagsearch)',
  )
  const leftElement = document.querySelector<HTMLTableCellElement>(
    '.selected-line.selected-line-top.blob-code.js-skip-tagsearch',
  )
  const topRightElement = rightElement ?? leftElement
  if (!topRightElement) return null

  return {...lineRange, topRightElement}
}

const useHoveredLines = (): ActiveLines | null => {
  const [hoveredLine, setHoveredLine] = useState<HTMLTableCellElement>()

  const allLineElements = useObserveSelector('td.blob-code:not(.blob-code-empty)', HTMLTableCellElement)

  useEffect(() => {
    function onEnterLine(this: HTMLTableCellElement) {
      setHoveredLine(this)
    }

    function onExitLine() {
      setHoveredLine(undefined)
    }

    for (const line of allLineElements) {
      line.addEventListener('mouseenter', onEnterLine)
      line.addEventListener('mouseleave', onExitLine)
    }

    return () => {
      for (const line of allLineElements) {
        line.removeEventListener('mouseenter', onEnterLine)
        line.removeEventListener('mouseleave', onExitLine)
      }
    }
  }, [allLineElements])

  if (!hoveredLine) return null

  const [leftNumberCell, rightNumberCell] = hoveredLine?.parentElement?.querySelectorAll('td.blob-num') ?? []
  const hash = leftNumberCell?.id || rightNumberCell?.id || undefined
  const lineRange = hash ? parseLineRangeHash(hash) : undefined
  if (!lineRange) return null

  return {...lineRange, topRightElement: hoveredLine}
}

const useFocusVisibleLines = (): ActiveLines | null => {
  const allLineElements = useObserveSelector('td.blob-code:not(.blob-code-empty)', HTMLTableCellElement)

  // capture line that currently has focus / whose children have focus
  const [focusedLine, setFocusedLine] = useState<HTMLTableCellElement>()
  useEffect(() => {
    function onEnterLine(this: HTMLTableCellElement) {
      setFocusedLine(this)
    }

    for (const line of allLineElements) {
      line.addEventListener('focusin', onEnterLine)
    }

    return () => {
      for (const line of allLineElements) {
        line.removeEventListener('focusin', onEnterLine)
      }
    }
  }, [allLineElements])

  // had some trouble with the 'focusout' event so we'll handle that a slightly different way
  const isFocusWithinLine = useIsFocusWithinElement(focusedLine)
  useEffect(() => {
    if (!isFocusWithinLine) {
      setFocusedLine(undefined)
    }
  }, [isFocusWithinLine])

  if (!focusedLine) return null

  const [leftNumberCell, rightNumberCell] = focusedLine?.parentElement?.querySelectorAll('td.blob-num') ?? []
  const hash = leftNumberCell?.id || rightNumberCell?.id || undefined
  const lineRange = hash ? parseLineRangeHash(hash) : undefined
  if (!lineRange) return null

  return {...lineRange, topRightElement: focusedLine}
}

export const useActiveDiffLines = () => {
  const byId = new Map<string, ActiveLines>()

  const hovered = useHoveredLines()
  if (hovered) byId.set(hovered.diffAnchor, hovered)

  // selection overrides hover
  const selected = useSelectedLines()
  if (selected) byId.set(selected.diffAnchor, selected)

  // keyboard nav overrides everything!
  const focusVisible = useFocusVisibleLines()
  if (focusVisible) byId.set(focusVisible.diffAnchor, focusVisible)

  return byId
}
