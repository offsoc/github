import {EMOJI_MAP} from '@github-ui/reaction-viewer/ReactionGroupsUtils'
import {SortDescIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState, useTransition} from 'react'
import {useLocation} from 'react-router-dom'

import {LABELS} from '../constants/labels'
import {findSortReactionInQuery, parseQuery, replaceSortInQuery} from '../utils/query'

export type SortingOptionsMenuProps = {
  activeSearchQuery: string
  dirtySearchQuery: string | null
  executeQuery: ((query: string) => void) | undefined
  setActiveSearchQuery: (newQuery: string) => void
  setDirtySearchQuery: (newQuery: string) => void
  setIsQueryLoading: (loading: boolean) => void
  setReactionEmojiToDisplay: (arg: {reaction: string; reactionEmoji: string}) => void
  sortingItemSelected: string
  setSortingItemSelected: (arg: string) => void
  searchUrl: (query?: string) => string
  nested?: boolean
}

export function SortingOptionsMenu({
  activeSearchQuery,
  dirtySearchQuery,
  setActiveSearchQuery,
  setDirtySearchQuery,
  setIsQueryLoading,
  executeQuery,
  setReactionEmojiToDisplay,
  sortingItemSelected,
  setSortingItemSelected,
  searchUrl,
  nested = false,
}: SortingOptionsMenuProps) {
  const [showReactionOptions, setShowReactionOptions] = useState(false)
  const initialFocusRef = useRef<HTMLLIElement>(null)

  const history = useLocation()

  const [, startTransition] = useTransition()

  const handleEmojiMapValue = (label: string): string => {
    return label.replace(' ', '_').toUpperCase()
  }

  const sortByLabel = (label: string): string => {
    return `${LABELS.sortBy} ${label}`
  }

  useEffect(() => {
    initialFocusRef?.current?.focus()
  }, [showReactionOptions])

  const parsedSortQuery = useMemo(() => parseQuery(activeSearchQuery).get('sort'), [activeSearchQuery])
  const sortReactionQuery = useMemo(() => findSortReactionInQuery(activeSearchQuery), [activeSearchQuery])

  useEffect(() => {
    setShowReactionOptions(false)
    const sortText = `sort:${parsedSortQuery?.[0]}`
    const selectedLabel = sortText && LABELS.sortingLabels[sortText]

    if (sortReactionQuery && selectedLabel) {
      const reactionEmojiText = handleEmojiMapValue(selectedLabel)
      const reactionEmoji = selectedLabel && EMOJI_MAP[reactionEmojiText]!
      setSortingItemSelected(`${reactionEmoji} ${selectedLabel}`)
      setShowReactionOptions(true)
      setReactionEmojiToDisplay({
        reaction: reactionEmojiText,
        reactionEmoji,
      })
    } else if (parsedSortQuery && selectedLabel) {
      setSortingItemSelected(selectedLabel)
    } else if (sortingItemSelected.length === 0 || (!parsedSortQuery && !selectedLabel)) {
      setSortingItemSelected(LABELS.sortingLabels['sort:created-desc']!)
    }
  }, [
    history.pathname,
    activeSearchQuery,
    setReactionEmojiToDisplay,
    setSortingItemSelected,
    parsedSortQuery,
    sortReactionQuery,
    sortingItemSelected.length,
  ])

  const onSelect = useCallback(
    (selectedText: string, key: string) => {
      if (!executeQuery) return
      setSortingItemSelected(selectedText)
      const queryText = replaceSortInQuery(dirtySearchQuery || '', key)
      setActiveSearchQuery(queryText)
      setDirtySearchQuery(queryText)

      const url = searchUrl(queryText)
      window.history.replaceState(history.state, '', url)

      setIsQueryLoading(true)
      startTransition(() => {
        executeQuery(queryText)
      })
    },
    [
      dirtySearchQuery,
      executeQuery,
      history.state,
      searchUrl,
      setActiveSearchQuery,
      setDirtySearchQuery,
      setIsQueryLoading,
      setSortingItemSelected,
    ],
  )

  const onSelectReactions = (value: string, key: string) => {
    const selectedText = `${EMOJI_MAP[handleEmojiMapValue(value)]} ${value}`
    onSelect(selectedText, key)
    setReactionEmojiToDisplay({
      reaction: handleEmojiMapValue(value),
      reactionEmoji: EMOJI_MAP[handleEmojiMapValue(value)]!,
    })
  }

  const sortingLabelKeyValuePairs = Object.entries(LABELS.sortingLabels)
  const firstSortKey = sortingLabelKeyValuePairs[0]![0]
  const firstReactionSortKey = sortingLabelKeyValuePairs.find(([key]) => key.includes('reaction'))?.[0]
  const nonReactionSortingLabelKeyValuePairs = useMemo(() => {
    return sortingLabelKeyValuePairs.filter(([key]) => !key.includes('reaction'))
  }, [sortingLabelKeyValuePairs])
  const reactionSortingLabelKeyValuePairs = useMemo(() => {
    return sortingLabelKeyValuePairs.filter(([key]) => key.includes('reaction'))
  }, [sortingLabelKeyValuePairs])

  const nonReactionItems = nonReactionSortingLabelKeyValuePairs.map(([key, value]) => (
    <ActionList.Item
      ref={key === firstSortKey ? initialFocusRef : undefined}
      key={key}
      onSelect={() => onSelect(value, key)}
      selected={sortingItemSelected === value}
      aria-label={sortByLabel(value)}
      role="menuitemradio"
    >
      {value}
    </ActionList.Item>
  ))
  const reactionGroup = (
    <ActionList.Group>
      <ActionList.GroupHeading>Sort by reactions</ActionList.GroupHeading>
      {reactionSortingLabelKeyValuePairs.map(([key, value]) => (
        <ActionList.Item
          ref={key === firstReactionSortKey ? initialFocusRef : undefined}
          key={key}
          onSelect={() => onSelectReactions(value, key)}
          selected={sortingItemSelected === `${EMOJI_MAP[handleEmojiMapValue(value)]} ${value}`}
          aria-label={sortByLabel(value)}
          role="menuitemradio"
        >
          <ActionList.LeadingVisual>{EMOJI_MAP[handleEmojiMapValue(value)]}</ActionList.LeadingVisual>
          {value}
        </ActionList.Item>
      ))}
    </ActionList.Group>
  )

  const sortReactionsMenu = (
    <ActionMenu>
      <ActionMenu.Anchor>
        <ActionList.Item>{LABELS.mostReactions}</ActionList.Item>
      </ActionMenu.Anchor>

      <ActionMenu.Overlay>
        <ActionList selectionVariant="single">{reactionGroup}</ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )

  if (nested)
    return (
      <>
        <ActionList.Group selectionVariant="single">
          <ActionList.GroupHeading>{LABELS.sortBy}</ActionList.GroupHeading>
          {nonReactionItems}
        </ActionList.Group>
        {sortReactionsMenu}
      </>
    )

  return (
    <ActionMenu>
      <ActionMenu.Button
        variant="invisible"
        sx={{
          color: 'fg.muted',
          width: 'fit-content',
        }}
        leadingVisual={SortDescIcon}
      >
        {LABELS.sort}
      </ActionMenu.Button>

      <ActionMenu.Overlay>
        <ActionList selectionVariant="single">
          <ActionList.Group>
            <ActionList.GroupHeading>{LABELS.sortBy}</ActionList.GroupHeading>
            {nonReactionItems}
          </ActionList.Group>

          {sortReactionsMenu}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
