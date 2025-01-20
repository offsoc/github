import {debounce} from '@github/mini-throttle'
import {CodeSquareIcon, FileDiffIcon, FileIcon, PaperclipIcon} from '@primer/octicons-react'
import {Box, IconButton, SelectPanel} from '@primer/react'
// eslint-disable-next-line import/no-deprecated
import {ActionList} from '@primer/react/deprecated'
import type {GroupedListProps, ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {fileDiffRefName, isRepository, referenceID} from '../utils/copilot-chat-helpers'
import {useFilter, useSidePanelPositionStyles} from '../utils/copilot-chat-hooks'
import type {CopilotChatReference, FileReference, SuggestionSymbolReference} from '../utils/copilot-chat-types'
import {copilotLocalStorage} from '../utils/copilot-local-storage'
import {useChatAutocomplete} from '../utils/CopilotChatAutocompleteContext'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'

export const ReferencesSelectPanel = ({panelWidth}: {panelWidth?: number}) => {
  const state = useChatState()
  const manager = useChatManager()
  const autocomplete = useChatAutocomplete()

  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ItemInput[]>([])
  const [loading, setLoading] = useState(true)
  const positionStyles = useSidePanelPositionStyles(open)

  // Holds selection IDs only to make Object comparison work of <SelectPanel>
  const [selectedIDs, setSelectedIDs] = useState<string[]>([])

  // Debounced version of query
  const [workerQuery, setWorkerQuery] = useState('')
  const debouncedOnFilterChange = useRef(
    debounce((value: string) => handleFileAndSymbolSuggestionAutocomplete(value), 250),
  )

  // Search Results
  const [filesAutocompleteList, setFilesAutocompleteList] = useState<string[] | null>(null)
  const [symbolsAutocompleteList, setSymbolsAutocompleteList] = useState<string[] | null>(null)

  // Search Triggers
  const [matchingFiles, filesSearching] = useFilter(filesAutocompleteList, workerQuery, state.findFileWorkerPath)
  const [matchingSymbols, symbolsSearching] = useFilter(symbolsAutocompleteList, workerQuery, state.findFileWorkerPath)

  const GROUP_SELECTIONS_ID = '0'
  const GROUP_FILES_ID = '1'
  const GROUP_SYMBOLS_ID = '2'

  const groups: GroupedListProps['groupMetadata'] = useMemo(() => {
    if (items.length === 0 && !loading) {
      return [{groupId: '-1', header: {title: 'No files or symbols found matching your query', variant: 'subtle'}}]
    }

    const DEFAULT_GROUPS: GroupedListProps['groupMetadata'] = [
      {groupId: GROUP_SELECTIONS_ID, header: {title: 'Current attachments', variant: 'subtle'}},
      {groupId: GROUP_FILES_ID, header: {title: 'Files', variant: 'subtle'}},
      {groupId: GROUP_SYMBOLS_ID, header: {title: 'Symbols', variant: 'subtle'}},
    ]

    const activeGroups: GroupedListProps['groupMetadata'] = []

    for (const group of DEFAULT_GROUPS) {
      const found = items.find(_item => _item.groupId === group.groupId) !== undefined
      if (found) {
        activeGroups.push(group)
      }
    }

    return activeGroups
  }, [items, loading])

  const selectedObjects: ItemInput[] = useMemo(() => {
    const selected: ItemInput[] = []

    // This is slow, but okay as we will only have ~10 items in each set
    // In the future we can make this faster with a hashmap cache
    for (const selectedID of selectedIDs) {
      const item = items.find(value => value.id === selectedID)
      if (item) {
        selected.push(item)
      }
    }
    return selected
  }, [items, selectedIDs])

  const applySelectionsToState = async (selections: ItemInput[]) => {
    const currentRepo = state.currentTopic && isRepository(state.currentTopic) ? state.currentTopic : undefined

    // Clear up removed references, iterate over current state selections
    for (const currentReference of state.currentReferences) {
      // try to find that selection in the dialogs selections
      const nameWithKey = referenceID(currentReference)

      const existing = selections.find(selection => selection.id === nameWithKey)
      if (!existing) {
        manager.removeReference(state.currentReferences.indexOf(currentReference))
      }
    }

    // Handle new references
    for (const selection of selections) {
      if (selection.id && typeof selection.id === 'string' && currentRepo) {
        const symbolSelection = autocomplete.symbolSuggestions.get(selection.text!)
        const fileSelection = autocomplete.fileSuggestions.get(selection.text!)

        if (symbolSelection) {
          await autocomplete.addToReferences(symbolSelection, state)
        }
        if (fileSelection) {
          await autocomplete.addToReferences(fileSelection, state)
        }
      }
    }
  }

  // <SelectPanel> does Object.is to figure out what item is selected
  // That doesn't work if we create new objects all the time
  // TL;DR the items in `selected` need to be a subset of `items`
  const onSelectedChange = async (selections: ItemInput[]) => {
    const _selectedIDs = selections.flatMap(item => {
      if (item.id === undefined || typeof item.id !== 'string') {
        return []
      }
      return item.id
    })

    setSelectedIDs(_selectedIDs)
    await applySelectionsToState(selections)
  }

  const handleFileAndSymbolSuggestionAutocomplete = useCallback(
    async (query: string) => {
      const topic = state.currentTopic
      if (!topic || !isRepository(topic)) return

      await autocomplete.fetchAutocompleteSuggestions(topic, query)

      // Hand data to worker
      setFilesAutocompleteList(Array.from(autocomplete.fileSuggestions.values()).map($result => $result.path))
      setSymbolsAutocompleteList(Array.from(autocomplete.symbolSuggestions.values()).map($result => $result.name))

      setWorkerQuery(query)
    },
    [autocomplete, state.currentTopic],
  )

  // Show initial results
  useEffect(() => {
    void handleFileAndSymbolSuggestionAutocomplete('')
  }, [handleFileAndSymbolSuggestionAutocomplete])

  const referenceToItemInput = useCallback((reference: CopilotChatReference): ItemInput | undefined => {
    const refID = referenceID(reference)
    switch (reference.type) {
      case 'symbol':
        return {
          id: refID,
          key: refID,
          leadingVisual: CodeSquareIcon,
          text: reference.name,
          groupId: GROUP_SYMBOLS_ID,
        }
      case 'file':
        return {
          id: refID,
          key: refID,
          leadingVisual: FileIcon,
          text: reference.path,
          groupId: GROUP_FILES_ID,
        }
      case 'file-diff':
        return {
          id: refID,
          key: refID,
          leadingVisual: FileDiffIcon,
          text: fileDiffRefName(reference),
          groupId: GROUP_FILES_ID,
        }
    }
  }, [])

  // Glue together autocomplete and the worker search
  useEffect(() => {
    const DISPLAYED_MATCHES_LIMIT = 7

    const selectedItems: ItemInput[] = state.currentReferences
      .filter(item => ['symbol', 'file', 'file-diff'].includes(item.type))
      .map(input => {
        return {...referenceToItemInput(input), groupId: GROUP_SELECTIONS_ID}
      })

    const itemsFiles: ItemInput[] = matchingFiles
      .slice(0, DISPLAYED_MATCHES_LIMIT)
      .map(e => autocomplete.fileSuggestions.get(e))
      .filter((item): item is FileReference => !!item)
      .map(item => referenceToItemInput(item))
      .filter((item): item is ItemInput => !!item)
      .filter(item => !selectedItems.find(selectedItem => selectedItem.id === item.id))

    const itemsSymbols: ItemInput[] = matchingSymbols
      .slice(0, DISPLAYED_MATCHES_LIMIT)
      .map(e => autocomplete.symbolSuggestions.get(e))
      .filter((item): item is SuggestionSymbolReference => !!item)
      .map(item => referenceToItemInput(item))
      .filter((item): item is ItemInput => !!item)
      .filter(item => !selectedItems.find(selectedItem => selectedItem.id === item.id))

    setItems([...selectedItems, ...itemsFiles, ...itemsSymbols])
  }, [autocomplete, matchingFiles, matchingSymbols, referenceToItemInput, state.currentReferences])

  useEffect(() => {
    if (!filesSearching && !symbolsSearching) {
      setLoading(false)
    }
  }, [filesSearching, symbolsSearching])

  // Update selection from state when Panel gets opened
  useEffect(() => {
    if (open) {
      setSelectedIDs(state.currentReferences.map(currentReference => referenceID(currentReference)))
    }
  }, [autocomplete, open, state.currentReferences])

  const persistentPanelStyles =
    state.mode === 'assistive'
      ? {
          position: 'fixed',
          bottom: 0,
          right: `${panelWidth || copilotLocalStorage.DEFAULT_PANEL_WIDTH}px`,
          left: 'auto !important',
          top: 'auto !important',
          maxWidth: '100vw',
          ...positionStyles,
        }
      : {}

  return (
    <SelectPanel
      loading={loading}
      title="Attach files and symbols"
      subtitle="Choose which files and symbols you want to chat about. Use fewer references for more accurate responses."
      placeholderText="Search files and symbols"
      overlayProps={{
        height: 'xlarge',
        width: 'large',
        anchorSide: 'outside-bottom',
        id: 'reference-select-panel',
        className: 'reference-select-panel',
        sx: {
          maxWidth: 'calc(max(var(--pane-width), var(--pane-min-width)) - 20px)',
          maxHeight: 'calc(100vh - 53px - 64px - 44px - 16px)', // 53px thread header, 64px page header, 44px references container. 16px bottom page margin.
          '@media screen and (max-height: 400px)': {maxHeight: 'calc(100vh - 64px)'},
          '@media screen and (max-width: 767px)': {maxWidth: 'calc(100vw - 2rem)'}, // This should match the chat panel's max width.
          ...persistentPanelStyles,
        },
      }}
      groupMetadata={groups}
      renderItem={data => (
        <ActionList.Item
          {...data}
          text={undefined}
          sx={{
            mx: 2,
            '&[data-is-active-descendant="activated-directly"]': {
              backgroundColor: 'transparent',
              outline: '2px solid var(--focus-outlineColor, var(--color-accent-emphasis))',
              outlineOffset: '-2px',
            },
          }}
        >
          {' '}
          <Box
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {data.text}
          </Box>
        </ActionList.Item>
      )}
      items={items}
      onOpenChange={setOpen}
      onFilterChange={value => {
        debouncedOnFilterChange.current(value)
      }}
      open={open}
      selected={selectedObjects}
      onSelectedChange={onSelectedChange}
      renderAnchor={({...anchorProps}) => {
        return (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            aria-label="Attach files or symbols"
            aria-labelledby={undefined}
            size="small"
            icon={PaperclipIcon}
            variant="invisible"
            sx={{flexShrink: 0}}
            {...anchorProps}
          />
        )
      }}
    />
  )
}
