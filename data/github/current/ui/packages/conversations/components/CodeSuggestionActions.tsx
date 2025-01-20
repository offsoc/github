import {Box} from '@primer/react'
import {type RefObject, useCallback, useMemo, useRef, useState} from 'react'

import {useDialogStateContext} from '../contexts/DialogStateContext'
import {isSuggestedChangeInPendingBatch, validateSuggestedChangeCanBeAddedToBatch} from '../suggested-changes'
import type {CommentingImplementation, SuggestedChange} from '../types'
import {AddToExistingBatch} from './CodeSuggestionActions/AddToExistingBatch'
import {ApplyOrAddToBatch} from './CodeSuggestionActions/ApplyOrAddToBatch'
import {ApplySuggestionDialog} from './CodeSuggestionActions/ApplySuggestionDialog'
import {CodeSuggestionUnavailable} from './CodeSuggestionActions/CodeSuggestionUnavailable'
import {CommitOrRemoveFromBatch} from './CodeSuggestionActions/CommitOrRemoveFromBatch'

export function CodeSuggestionActions({
  commentingImplementation,
  suggestedChange,
}: {
  commentingImplementation: CommentingImplementation
  suggestedChange: SuggestedChange
}) {
  const {setIsDialogOpen} = useDialogStateContext()
  const [isApplySuggestionsDialogOpen, setIsApplySuggestionsDialogOpen] = useState(false)
  const returnFocusRef = useRef<RefObject<HTMLElement>>()

  const {pendingSuggestedChangesBatch, submitSuggestedChanges} = commentingImplementation
  const isPendingInBatch = isSuggestedChangeInPendingBatch(suggestedChange, pendingSuggestedChangesBatch)
  const batchIsEmpty = pendingSuggestedChangesBatch.length === 0
  const {isValid, reason} = validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)

  // when a change is applied, it's either the single suggestion if it's not pending or the full batch if it is
  const changesToApply = useMemo(
    () => (isPendingInBatch ? pendingSuggestedChangesBatch : [suggestedChange]),
    [isPendingInBatch, pendingSuggestedChangesBatch, suggestedChange],
  )

  const setDialogOpen = useCallback(
    (isDialogOpen: boolean) => {
      setIsApplySuggestionsDialogOpen(isDialogOpen)
      setIsDialogOpen?.(isDialogOpen)
    },
    [setIsDialogOpen],
  )

  const closeDialog = useCallback(() => {
    setDialogOpen(false)

    // manually return focus to the button that opened the dialog
    if (returnFocusRef.current) {
      const ref = returnFocusRef.current.current
      setTimeout(() => ref?.focus())
    }
  }, [setDialogOpen])

  const openDialog = useCallback(
    (returnFocusTo?: RefObject<HTMLElement>) => {
      setDialogOpen(true)

      // store a ref to an element we will return focus to when the dialog closes
      returnFocusRef.current = returnFocusTo
    },
    [setDialogOpen, returnFocusRef],
  )

  const handleCommit = useCallback(
    (
      commitMessage: string,
      onError: (error: Error, type?: string, friendlyMessage?: string) => void,
      onCompleted: () => void,
    ) => {
      submitSuggestedChanges({
        suggestedChanges: changesToApply,
        commitMessage,
        onCompleted: () => {
          closeDialog()
          onCompleted()
        },
        onError,
      })
    },
    [closeDialog, submitSuggestedChanges, changesToApply],
  )

  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'border.default',
      }}
    >
      {isPendingInBatch && (
        <CommitOrRemoveFromBatch
          commentingImplementation={commentingImplementation}
          suggestedChange={suggestedChange}
          onOpenDialog={openDialog}
        />
      )}
      {!isPendingInBatch && !isValid && reason && <CodeSuggestionUnavailable reason={reason} sx={{m: 0}} />}
      {!isPendingInBatch && batchIsEmpty && (
        <ApplyOrAddToBatch
          commentingImplementation={commentingImplementation}
          suggestedChange={suggestedChange}
          onOpenDialog={openDialog}
        />
      )}
      {!isPendingInBatch && isValid && !batchIsEmpty && (
        <AddToExistingBatch commentingImplementation={commentingImplementation} suggestedChange={suggestedChange} />
      )}
      {isApplySuggestionsDialogOpen && (
        <ApplySuggestionDialog
          authorLogins={changesToApply.map(change => change.authorLogin)}
          batchSize={changesToApply.length}
          onClose={closeDialog}
          onCommit={handleCommit}
        />
      )}
    </Box>
  )
}
