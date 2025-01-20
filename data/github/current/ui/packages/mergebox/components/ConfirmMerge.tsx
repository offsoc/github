import {useAnalytics} from '@github-ui/use-analytics'
import {AlertFillIcon} from '@primer/octicons-react'
import {Box, Button, FormControl, Heading, Spinner, Text, Textarea, TextInput} from '@primer/react'
import {useEffect, useRef, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'
import {useEnableAutoMergeMutation} from '../hooks/use-enable-auto-merge-mutation'

import mergePullRequest from '../mutations/merge-pull-request-mutation'
import {mergeButtonText} from '../helpers/merge-button-text'
import {MergeMethod} from '../types'

/**
 * Displays an error message if the merge fails
 * Per https://primer.style/ui-patterns/loading#button-loading-state,
 * we focus the heading of the error message when the error appears
 */
function MergeErrorMessage({errorMessage, isAutoMergeAllowed}: {errorMessage: string; isAutoMergeAllowed?: boolean}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <Heading
      ref={headingRef}
      as="h2"
      sx={{fontSize: 1, color: 'danger.emphasis', mt: 3, display: 'flex', alignItems: 'center', gap: 1}}
      tabIndex={0}
    >
      <AlertFillIcon size={14} />
      {isAutoMergeAllowed ? errorMessage : `Failed to merge due to ${errorMessage}`}
    </Heading>
  )
}

type ConfirmMergeProps = {
  commitAuthorEmail: string
  commitMessageBody: string
  commitMessageHeadline: string
  defaultBranchName: string
  isBypassMerge: boolean
  onCancel: () => void
  pullRequestId: string
  selectedMergeMethod: MergeMethod
  isAutoMergeAllowed: boolean
  refetchMergeBoxQuery: () => void
}

/**
 * Renders the confirmation options and inputs for commit header and message for merging
 */
export function ConfirmMerge({
  commitAuthorEmail,
  commitMessageBody,
  commitMessageHeadline,
  defaultBranchName,
  isBypassMerge,
  onCancel,
  pullRequestId,
  selectedMergeMethod,
  isAutoMergeAllowed = false,
  refetchMergeBoxQuery,
}: ConfirmMergeProps) {
  const commitHeaderRef = useRef<HTMLInputElement>(null)
  const confirmMergeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    commitHeaderRef.current?.focus()
    confirmMergeButtonRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest'})
  }, [])

  const [commitMessageHeadlineValue, setCommitMessageHeadlineValue] = useState(commitMessageHeadline)
  const [commitMessageBodyValue, setCommitMessageBodyValue] = useState(commitMessageBody)
  const {sendAnalyticsEvent} = useAnalytics()
  const environment = useRelayEnvironment()
  const [merging, setMerging] = useState(false)
  const [mergeErrorMessage, setMergeErrorMessage] = useState('')

  const {mutate} = useEnableAutoMergeMutation({
    onSuccess: () => {
      setMerging(false)
      refetchMergeBoxQuery()
    },
    onError: (e: Error) => {
      setMerging(false)
      setMergeErrorMessage(e.message)
    },
  })

  if (!mergePullRequest && !mutate) return

  const handleConfirmMerge = () => {
    if (merging) return

    setMerging(true)
    setMergeErrorMessage('')

    if (isAutoMergeAllowed) {
      mutate({
        authorEmail: commitAuthorEmail,
        commitMessage: commitMessageBodyValue,
        commitTitle: commitMessageHeadlineValue,
        mergeMethod: selectedMergeMethod,
      })
      sendAnalyticsEvent('direct_merge_section.confirm_auto_merge', 'MERGEBOX_AUTO_MERGE_CONFIRMATION_BUTTON')
    } else {
      mergePullRequest({
        environment,
        input: {
          pullRequestId,
          mergeMethod: selectedMergeMethod,
          commitHeadline: commitMessageHeadlineValue,
          commitBody: commitMessageBodyValue,
        },
        onCompleted: () => setMerging(false),
        onError: (e: Error) => {
          setMerging(false)
          setMergeErrorMessage(e.message)
        },
      })
      sendAnalyticsEvent('direct_merge_section.confirm_direct_merge', 'MERGEBOX_DIRECT_MERGE_CONFIRMATION_BUTTON')
    }
  }

  return (
    <div>
      {selectedMergeMethod !== MergeMethod.REBASE && (
        <>
          <FormControl>
            <FormControl.Label>Commit header</FormControl.Label>
            <TextInput
              ref={commitHeaderRef}
              block
              defaultValue={commitMessageHeadlineValue}
              onChange={e => setCommitMessageHeadlineValue(e.currentTarget.value)}
            />
          </FormControl>
          <FormControl className="mt-3 width-full">
            <FormControl.Label>Commit message</FormControl.Label>
            <Textarea
              block
              defaultValue={commitMessageBodyValue}
              onChange={e => setCommitMessageBodyValue(e.currentTarget.value)}
            />
          </FormControl>
          <Box sx={{mt: 3}}>
            <Text sx={{color: 'fg.muted', fontSize: 1}}>This commit will be authored by {commitAuthorEmail}.</Text>
          </Box>
        </>
      )}
      {selectedMergeMethod === MergeMethod.REBASE && (
        <Text sx={{color: 'fg.muted', fontSize: 1}}>
          This will rebase your changes and merge them into {defaultBranchName}.
        </Text>
      )}
      <Box sx={{display: 'flex', mt: 3, gap: 2}}>
        <Button
          ref={confirmMergeButtonRef}
          aria-busy={merging}
          aria-describedby={merging ? 'merging-message' : undefined}
          aria-disabled={merging}
          variant={isBypassMerge ? 'danger' : 'primary'}
          onClick={handleConfirmMerge}
        >
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {merging && <Spinner size={'small'} sx={{mr: 1}} />}
            <Text sx={{fontSize: 1}}>
              {mergeButtonText({
                mergeMethod: selectedMergeMethod,
                confirming: true,
                isBypassMerge,
                inProgress: merging,
                isAutoMergeAllowed,
              })}
            </Text>
          </Box>
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Box>
      {merging && (
        <Text aria-busy="true" aria-live="polite" id="merging-message" sx={{display: 'none'}}>
          Merging...
        </Text>
      )}
      {mergeErrorMessage && (
        <MergeErrorMessage errorMessage={mergeErrorMessage} isAutoMergeAllowed={isAutoMergeAllowed} />
      )}
    </div>
  )
}
