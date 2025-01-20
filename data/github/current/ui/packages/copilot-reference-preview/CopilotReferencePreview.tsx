import {useChatState} from '@github-ui/copilot-chat/CopilotChatContext'
import {useChatManager} from '@github-ui/copilot-chat/CopilotChatManagerContext'
import {referenceID} from '@github-ui/copilot-chat/utils/copilot-chat-helpers'
import type {
  CodeNavSymbolReferenceDetails,
  CopilotChatReference,
  FileDiffReference,
  FileReference,
  ReferenceDetails,
  SnippetReference,
  SuggestionSymbolReferenceDetails,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useQuery} from '@tanstack/react-query'
import {useCallback} from 'react'

import {CodeReferencePreview} from './components/CodeReferencePreview'
import {CommitReferencePreview} from './components/CommitReferencePreview'
import {MarkdownReferencePreview} from './components/MarkdownReferencePreview'
import {PullRequestReferencePreview} from './components/PullRequestReferencePreview'
import {SymbolReferencePreview} from './components/SymbolReferencePreview'
import {FileDiffReferencePreview} from './components/FileDiffReferencePreview'
import {WebSearchReferencePreview} from './components/WebSearchReferencePreview'

export interface CopilotReferencePreviewProps {
  dismissable?: boolean
}

export function CopilotReferencePreview({dismissable}: CopilotReferencePreviewProps) {
  const {reference, details, detailsLoading, detailsError, dismissReference} = useReferences()

  return (
    <CopilotReferencePreviewImpl
      reference={reference!}
      details={details}
      detailsLoading={detailsLoading}
      detailsError={detailsError}
      onDismiss={dismissable ? dismissReference : undefined}
    />
  )
}

function CopilotReferencePreviewImpl<T extends CopilotChatReference>({
  reference,
  details,
  detailsLoading,
  detailsError,
  onDismiss,
}: {
  reference: T
  details: ReferenceDetails<T> | undefined
  detailsLoading: boolean
  detailsError: boolean
  onDismiss?: () => void
}) {
  switch (reference.type) {
    case 'symbol':
      return (
        <SymbolReferencePreview
          key={referenceID(reference)}
          reference={reference}
          // Narrowing the type for reference in the switch does not
          // automatically narrow the type for details, which is kind of a bummer
          details={
            details as ReferenceDetails<CodeNavSymbolReferenceDetails | SuggestionSymbolReferenceDetails> | undefined
          }
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          onDismiss={onDismiss}
        />
      )
    case 'file':
    case 'snippet':
      return (reference as SnippetReference).languageName === 'Markdown' ? (
        <MarkdownReferencePreview
          key={referenceID(reference)}
          reference={reference}
          details={details as ReferenceDetails<SnippetReference | FileReference> | undefined}
          detailsError={detailsError}
          detailsLoading={detailsLoading}
          onDismiss={onDismiss}
        />
      ) : (
        <CodeReferencePreview
          key={referenceID(reference)}
          reference={reference}
          details={details as ReferenceDetails<SnippetReference | FileReference> | undefined}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          onDismiss={onDismiss}
        />
      )
    case 'file-diff':
      return (
        <FileDiffReferencePreview
          key={referenceID(reference)}
          reference={reference}
          details={details as ReferenceDetails<FileDiffReference> | undefined}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          onDismiss={onDismiss}
        />
      )
    case 'commit':
      return (
        <CommitReferencePreview
          key={referenceID(reference)}
          reference={reference}
          // TODO: details={details as ReferenceDetails<CommitReference>}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          onDismiss={onDismiss}
        />
      )
    case 'pull-request':
      return (
        <PullRequestReferencePreview
          key={referenceID(reference)}
          reference={reference}
          // details={details as ReferenceDetails<PullRequestReference>}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          onDismiss={onDismiss}
        />
      )
    case 'web-search':
      return <WebSearchReferencePreview key={referenceID(reference)} reference={reference} onDismiss={onDismiss} />
    default:
      return null
  }
}

/**
 * Manages the currently displayed reference.
 */
export function useReferences() {
  const manager = useChatManager()
  const state = useChatState()
  const reference = state.selectedReference

  const {isLoading, isError, data} = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['copilot', 'references', reference?.type, reference ? referenceID(reference) : undefined],
    queryFn: async () => {
      if (!reference) return null

      const result = await manager.service.hydrateReference(reference)
      if (!result.ok) return null

      return result.payload
    },
    // references include an OID and are thus not going to change ever
    staleTime: Number.MIN_VALUE,
  })

  const dismissReference = useCallback(() => manager.selectReference(null), [manager])

  return {
    reference,
    dismissReference,
    details: data ?? undefined,
    detailsLoading: isLoading,
    detailsError: isError,
  }
}
