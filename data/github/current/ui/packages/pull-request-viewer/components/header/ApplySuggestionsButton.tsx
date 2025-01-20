import {ApplySuggestionDialog} from '@github-ui/conversations'
import {Button, type SxProp} from '@primer/react'
import {useCallback, useRef, useState} from 'react'

import {usePendingSuggestedChangesBatchContext} from '../../contexts/PendingSuggestedChangesBatchContext'
import {useSubmitSuggestedChanges} from '../../hooks/use-pull-request-commenting'

export function ApplySuggestionsButton({sx}: SxProp) {
  const returnFocusRef = useRef<HTMLButtonElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {pendingSuggestedChangesBatch} = usePendingSuggestedChangesBatchContext()
  const submitSuggestedChanges = useSubmitSuggestedChanges()

  const handleCommitChanges = useCallback(
    (
      commitMessage: string,
      onError: (error: Error, type?: string | undefined, friendlyMessage?: string | undefined) => void,
      onCompleted: () => void,
    ) => {
      submitSuggestedChanges({commitMessage, onCompleted, onError, suggestedChanges: pendingSuggestedChangesBatch})
    },
    [pendingSuggestedChangesBatch, submitSuggestedChanges],
  )

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setTimeout(() => returnFocusRef.current?.focus())
  }, [])

  if (!pendingSuggestedChangesBatch.length) return null

  return (
    <>
      <Button
        ref={returnFocusRef}
        count={pendingSuggestedChangesBatch.length}
        sx={sx}
        onClick={() => setIsDialogOpen(true)}
      >
        {`Apply suggestion${pendingSuggestedChangesBatch.length > 1 ? 's' : ''}`}
      </Button>
      {isDialogOpen && (
        <ApplySuggestionDialog
          authorLogins={pendingSuggestedChangesBatch.map(change => change.authorLogin)}
          batchSize={pendingSuggestedChangesBatch.length}
          onClose={handleCloseDialog}
          onCommit={handleCommitChanges}
        />
      )}
    </>
  )
}
