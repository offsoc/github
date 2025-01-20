import {SearchIcon} from '@primer/octicons-react'
import {Box, Dialog, Text, TextInput} from '@primer/react'
import type React from 'react'
import {useCallback, useRef, useState} from 'react'

import {makeCopilotChatReference, makeDocsetReference, makeSymbolReference} from '../utils/copilot-chat-helpers'
import type {BlackbirdSuggestion, CopilotChatRepo, Docset, SuggestionSymbolReference} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {ReferenceSearchResults} from './ReferenceSearchResults'

interface Props {
  returnFocusRef?: React.RefObject<HTMLElement>
  isOpen: boolean
  onDismiss: () => void
  refType: 'file' | 'symbol' | 'docset'
  repo: CopilotChatRepo
}

export function ReferenceSearchDialog({isOpen, returnFocusRef, onDismiss, refType, repo}: Props) {
  const state = useChatState()
  const manager = useChatManager()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  const handleDismiss = useCallback(() => {
    if (isOpen) {
      setQuery('')
      onDismiss()
      returnFocusRef?.current?.focus()
    }
  }, [onDismiss, isOpen, returnFocusRef])

  const handleFileSelection = useCallback(
    (file: string) => {
      const fileRef = makeCopilotChatReference(file, repo)

      manager.addReference(fileRef, 'searchDialog')
      handleDismiss()
    },
    [repo, handleDismiss, manager],
  )

  const handleSymbolSelection = useCallback(
    (suggestion: BlackbirdSuggestion) => {
      const symbolRef: SuggestionSymbolReference = makeSymbolReference(suggestion, repo)

      manager.addReference(symbolRef, 'searchDialog')
      handleDismiss()
    },
    [repo, manager, handleDismiss],
  )

  const handleDocsetSelection = useCallback(
    (docset: Docset) => {
      const docsetRef = makeDocsetReference(docset)
      manager.addReference(docsetRef, 'searchDialog')
      handleDismiss()
    },
    [manager, handleDismiss],
  )

  const handleSelection = useCallback(
    (item: string | BlackbirdSuggestion | Docset) => {
      if (refType === 'file') {
        handleFileSelection(item as string)
      } else if (refType === 'symbol') {
        handleSymbolSelection(item as BlackbirdSuggestion)
      } else if (refType === 'docset') {
        handleDocsetSelection(item as Docset)
      }
    },
    [refType, handleFileSelection, handleSymbolSelection, handleDocsetSelection],
  )

  return isOpen ? (
    <Dialog
      initialFocusRef={searchInputRef}
      returnFocusRef={returnFocusRef}
      isOpen={isOpen}
      onDismiss={handleDismiss}
      aria-labelledby="ref-search-dialog-id"
      sx={{
        '& button': {p: 2, mt: -2, mr: -2},
        overflow: 'hidden',
        width: 'small',
      }}
    >
      <Dialog.Header
        id="ref-search-dialog-id"
        sx={{
          backgroundColor: 'canvas.default',
          px: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <Text sx={{fontWeight: 600, mb: 3, ml: 1}}>Add a {refType}</Text>
          <TextInput
            value={query}
            onChange={e => setQuery(e.target.value)}
            ref={searchInputRef}
            leadingVisual={SearchIcon}
            placeholder={`Search ${refType}`}
            block
          />
        </Box>
      </Dialog.Header>
      <ReferenceSearchResults
        query={query}
        refType={refType}
        repo={repo}
        onSelect={handleSelection}
        workerPath={refType === 'file' ? state.findFileWorkerPath : undefined}
        currentReferences={state.currentReferences}
      />
    </Dialog>
  ) : null
}
