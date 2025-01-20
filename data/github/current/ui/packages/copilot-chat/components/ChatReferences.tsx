import {ChevronDownIcon, ChevronUpIcon} from '@primer/octicons-react'
import {ActionList, Box, Details, Octicon, Text} from '@primer/react'
import type React from 'react'

import {isDocset} from '../utils/copilot-chat-helpers'
import type {CopilotChatReference} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {numberReferences} from '../utils/markdown'
import {DOC_LANGUAGES, OutputReference} from './ChatReference'

export const RENDERABLE_REFERENCE_TYPES = ['file', 'file-diff', 'snippet', 'symbol', 'commit', 'pull-request']

export interface ChatReferencesProps {
  showReferenceNumbers: boolean
  references: CopilotChatReference[]
  referenceMap: Map<number, number> | null
  onToggle?: (e: React.SyntheticEvent) => void
  summaryRef?: React.RefObject<HTMLElement>
}

export function ChatReferences(props: ChatReferencesProps) {
  const {referenceMap, showReferenceNumbers, onToggle, summaryRef} = props

  const state = useChatState() as ReturnType<typeof useChatState> | undefined // if we're run in tests without context, this will be undefined
  const renderableReferences = numberReferences(props.references, referenceMap).filter(reference =>
    RENDERABLE_REFERENCE_TYPES.includes(reference.type),
  )
  const allReferencesFromDocs = isDocset(state?.currentTopic) && renderableReferences.every(isDocReference)

  if (renderableReferences.length === 0) {
    return null
  }

  const title = allReferencesFromDocs
    ? `Search results from ${state.currentTopic!.name}`
    : `${renderableReferences.length} ${renderableReferences.length === 1 ? 'reference' : 'references'}`

  return (
    <Details
      sx={{
        '&[open]': {
          '.references-chevron-down': {
            display: 'none !important',
          },
          '.references-chevron-up': {
            display: 'inline-block !important',
          },
        },
      }}
      onToggle={onToggle}
    >
      <Box
        ref={summaryRef}
        as="summary"
        sx={{
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
          gap: 1,
          mt: 2,
          color: 'fg.muted',
          '&:hover': {
            color: 'fg.default',
          },
        }}
      >
        <Text sx={{fontWeight: 'normal', fontSize: 0}}>{title}</Text>
        <Octicon icon={ChevronDownIcon} className="references-chevron-down" />
        <Octicon icon={ChevronUpIcon} sx={{display: 'none !important'}} className="references-chevron-up" />
      </Box>
      <ActionList sx={{mt: 2, mx: '-1rem', p: 0}}>
        {renderableReferences.map((reference, index) => (
          <OutputReference key={index} reference={reference} n={showReferenceNumbers ? reference.n : null} />
        ))}
      </ActionList>
    </Details>
  )
}

function isDocReference(reference: CopilotChatReference): boolean {
  return reference.type === 'snippet' && !!reference.languageName && DOC_LANGUAGES.includes(reference.languageName)
}
