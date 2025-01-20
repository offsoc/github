import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {type RefObject, useState} from 'react'
import {createPortal} from 'react-dom'

import {validateSuggestedChangeCanBeApplied} from '../suggested-changes'
import type {
  ApplySuggestedChangesValidationData,
  Comment,
  CommentingImplementation,
  Subject,
  SuggestedChange,
  SuggestedChangesConfiguration,
  ViewerData,
} from '../types'
import {CodeSuggestionActions} from './CodeSuggestionActions'
import {CodeSuggestionUnavailable} from './CodeSuggestionActions/CodeSuggestionUnavailable'

function useSuggestedChangesRefs(
  commentBodyRef: React.RefObject<HTMLDivElement>,
  comment: Comment,
  filePath: string,
  threadId: string,
  applySuggestedChangesValidationData: ApplySuggestedChangesValidationData,
) {
  const [suggestedChangeRefs, setSuggestedChangeRefs] = useState<SuggestedChangeWithRef[] | undefined>()

  // This useLayoutEffect will search the comment body for div.js-apply-changes elements.
  // The apply changes nodes will be stored in an Array and used as refs with React's createPortal.
  // The rest of the suggested change info will be stored in state to be used for batching or applying suggestions.
  // We choose to use useLayoutEffect here because we want to run this code before the comment body is rendered so we don't
  // flash content.
  useLayoutEffect(() => {
    if (!commentBodyRef.current) return
    if (comment.subjectType !== 'LINE') return

    const renderedApplyChangeElements = [...commentBodyRef.current.getElementsByClassName('js-apply-changes')]
    if (renderedApplyChangeElements.length > 0) {
      const suggestedChanges: SuggestedChangeWithRef[] = []

      for (const ref of renderedApplyChangeElements) {
        const changesBlobEl = ref?.closest('div.js-suggested-changes-blob')
        if (!changesBlobEl) continue
        const additionChangesEl = [...changesBlobEl.querySelectorAll('.js-blob-code-addition')]
        if (!applySuggestedChangesValidationData.lineRange) continue

        suggestedChanges.push({
          authorLogin: comment.author?.login ?? 'ghost',
          commentId: comment.id,
          path: filePath,
          ref,
          suggestion: additionChangesEl.map(x => x.textContent!),
          lineRange: applySuggestedChangesValidationData.lineRange,
          threadId,
        })
      }
      setSuggestedChangeRefs(suggestedChanges)
    }
  }, [
    applySuggestedChangesValidationData.lineRange,
    comment.author?.login,
    comment.bodyHTML,
    comment.id,
    comment.subjectType,
    commentBodyRef,
    filePath,
    threadId,
  ])

  return suggestedChangeRefs
}

type SuggestedChangeWithRef = SuggestedChange & {ref: Element}

export interface SuggestedChangeViewProps {
  applySuggestedChangesValidationData: ApplySuggestedChangesValidationData
  comment: Comment
  commentBodyRef: RefObject<HTMLDivElement>
  commentingImplementation: CommentingImplementation
  filePath: string
  isOutdated?: boolean
  isThreadResolved: boolean
  subject?: Subject
  suggestedChangesConfig?: SuggestedChangesConfiguration
  threadId: string
  viewerData?: ViewerData
}

export function SuggestedChangeView({
  applySuggestedChangesValidationData,
  comment,
  commentBodyRef,
  commentingImplementation,
  filePath,
  isOutdated,
  isThreadResolved,
  subject,
  suggestedChangesConfig,
  threadId,
  viewerData,
}: SuggestedChangeViewProps): JSX.Element {
  const suggestedChangeRefs = useSuggestedChangesRefs(
    commentBodyRef,
    comment,
    filePath,
    threadId,
    applySuggestedChangesValidationData,
  )

  return (
    <>
      {/* Insert suggested change button group inside of each div.js-apply-changes element. */}
      {suggestedChangeRefs?.length &&
        suggestedChangeRefs.map(suggestedChange => {
          const {isValid, reason} = validateSuggestedChangeCanBeApplied({
            suggestedChange,
            isOutdated,
            isPending: comment.state === 'PENDING',
            isResolved: isThreadResolved,
            pullRequestIsClosed: subject?.state !== 'OPEN',
            pullRequestIsInMergeQueue: !!subject?.isInMergeQueue,
            userCanApplySuggestion: !!viewerData?.viewerCanApplySuggestion,
            applySuggestedChangesValidationData,
            suggestedChangesConfig,
          })
          if (!isValid && reason) {
            return createPortal(<CodeSuggestionUnavailable reason={reason} />, suggestedChange.ref)
          }
          return createPortal(
            <CodeSuggestionActions
              commentingImplementation={commentingImplementation}
              suggestedChange={suggestedChange}
            />,
            suggestedChange.ref,
          )
        })}
    </>
  )
}
