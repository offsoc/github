import {announce} from '@github-ui/aria-live'
import {AlertIcon, DotFillIcon} from '@primer/octicons-react'
import {Box, Button, Octicon, Spinner, Text} from '@primer/react'
import {useCallback, useState} from 'react'

import {isDocset} from '../utils/copilot-chat-helpers'
import {CanIndexStatus, type IndexingState, TopicIndexStatus} from '../utils/copilot-chat-hooks'
import type {CopilotChatRepo, Docset} from '../utils/copilot-chat-types'

export interface TopicIndexStateProps {
  currentTopic: CopilotChatRepo | Docset
  indexingState: IndexingState
  okToIndex: boolean
  triggerIndexing: () => void
}

export function TopicIndexState({currentTopic, indexingState, okToIndex, triggerIndexing}: TopicIndexStateProps) {
  const [disabled, setDisabled] = useState(false)
  const triggerIndexingCallback = useCallback(() => {
    setDisabled(true)
    triggerIndexing()
    announce('Indexing requested.')
  }, [triggerIndexing])
  const isTopicDocset = isDocset(currentTopic)
  const topicTypeDescription = isTopicDocset ? 'knowledge base' : 'repository'
  const indexedState = isTopicDocset ? indexingState.docs : indexingState.code

  return indexedState === TopicIndexStatus.Indexed ? (
    <Box sx={{px: 3, pb: 3}}>
      <IndexedState />
    </Box>
  ) : (
    <Box
      className="indexed-state-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        m: 3,
        mt: 0,
        p: 3,
        gap: 3,
        background: 'var(--bgColor-muted, var(--color-canvas-subtle))',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: '6px',
        textAlign: 'center',
      }}
    >
      <IndexedStateInfo
        indexedState={indexedState}
        canIndexStatus={indexingState.requestStatus}
        topicType={topicTypeDescription}
      />
      {okToIndex && (
        <Button variant="primary" onClick={triggerIndexingCallback} disabled={disabled}>
          Index {currentTopic.name}
        </Button>
      )}
    </Box>
  )
}

function IndexedStateInfo({
  indexedState,
  canIndexStatus,
  topicType,
}: {
  indexedState: TopicIndexStatus
  canIndexStatus: CanIndexStatus
  topicType: string
}) {
  switch (indexedState) {
    case TopicIndexStatus.Indexing:
      return <IndexingInProgressState topicType={topicType} />
    case TopicIndexStatus.Indexed:
      return <IndexedState />
    case TopicIndexStatus.Unindexed:
      return <NotIndexedState canIndexStatus={canIndexStatus} topicType={topicType} />
    default:
      return <LoadingState topicType={topicType} />
  }
}

function NotIndexedState({canIndexStatus, topicType}: {canIndexStatus: CanIndexStatus; topicType: string}) {
  switch (canIndexStatus) {
    case CanIndexStatus.Requested:
      return <IndexingInProgressState topicType={topicType} />
    case CanIndexStatus.RequestFailed:
      return (
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          <Octicon icon={AlertIcon} size={16} sx={{color: 'fg.muted'}} />
          <div>
            <Text sx={{ml: 2}} aria-live="polite">
              Unable to queue for semantic indexing right now — try again later.
            </Text>
          </div>
        </Box>
      )
    default:
      return <span>Improve Copilot’s understanding and response quality by indexing this {topicType}.</span>
  }
}

function IndexingInProgressState({topicType}: {topicType: string}) {
  return (
    <Box sx={{display: 'flex', gap: 3, flexDirection: 'column', alignItems: 'center'}}>
      <span aria-live="polite">Copilot is indexing this {topicType}. This may take a few minutes.</span>
      <Spinner size="small" sx={{color: 'fg.muted'}} />
    </Box>
  )
}

function IndexedState() {
  return (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      <Octicon icon={DotFillIcon} size={16} sx={{color: 'success.fg'}} />
      <Box sx={{color: 'fg.muted', fontSize: 0, ml: 1}}>Indexed for improved understanding and accuracy.</Box>
    </Box>
  )
}

function LoadingState({topicType}: {topicType: string}) {
  return (
    <Box sx={{display: 'flex', gap: 3, alignItems: 'center'}}>
      <Spinner size="small" sx={{color: 'fg.muted', flexShrink: 0}} />
      <span>Checking for semantic {topicType === 'repository' ? 'code' : ''} search availability…</span>
    </Box>
  )
}
