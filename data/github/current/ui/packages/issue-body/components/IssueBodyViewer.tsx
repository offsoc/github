import {IssueMarkdownViewer} from '@github-ui/commenting/IssueMarkdownViewer'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {ReactionViewerAnchor} from '@github-ui/reaction-viewer/ReactionViewerAnchor'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {AddSubIssueButtonGroup} from '@github-ui/sub-issues/AddSubIssueButtonGroup'
import {useCanEditSubIssues} from '@github-ui/sub-issues/useCanEditSubIssues'
import {useHasSubIssues} from '@github-ui/sub-issues/useHasSubIssues'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import type {TaskItem} from '@github-ui/use-tasklist'
import {Box} from '@primer/react'
import {type RefObject, Suspense, useCallback} from 'react'
import React from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {ERRORS} from '../constants/errors'
import {commitCreateIssueFromChecklistItemMutation} from '../mutations/create-issue-from-checklist-item-mutation'
import {commitUpdateIssueBodyMutation} from '../mutations/update-issue-body-mutation'
import type {IssueBodyViewer$key} from './__generated__/IssueBodyViewer.graphql'
import type {IssueBodyViewerReactable$key} from './__generated__/IssueBodyViewerReactable.graphql'
import type {IssueBodyViewerSubIssues$key} from './__generated__/IssueBodyViewerSubIssues.graphql'
import {AddTasklistButton} from './AddTasklistButton'

const ReactionViewer = React.lazy(() => import('@github-ui/reaction-viewer/ReactionViewer'))

export type IssueBodyViewerProps = {
  html: SafeHTMLString
  markdown: string
  comment: IssueBodyViewer$key
  onLinkClick?: (event: MouseEvent) => void
  viewerRef?: RefObject<HTMLDivElement>
  issueBodyRef?: React.RefObject<HTMLDivElement>
  bodyVersion: string
  viewerCanUpdate: boolean
  locked: boolean
  reactable: IssueBodyViewerReactable$key
  subIssues?: IssueBodyViewerSubIssues$key | null
  insideSidePanel?: boolean
  repositoryId?: string
  onIssueEditStateChange?: (edited: boolean) => void
}

export function IssueBodyViewer({
  html,
  markdown,
  comment,
  onLinkClick,
  viewerRef,
  issueBodyRef,
  bodyVersion,
  locked,
  viewerCanUpdate,
  reactable,
  subIssues = null,
  insideSidePanel,
  repositoryId,
  onIssueEditStateChange,
}: IssueBodyViewerProps) {
  const {tasklist_block, sub_issues} = useFeatureFlags()
  const environment = useRelayEnvironment()
  const data = useFragment(
    graphql`
      fragment IssueBodyViewer on Comment {
        id
      }
    `,
    comment,
  )
  const dataReaction = useFragment(
    graphql`
      fragment IssueBodyViewerReactable on Reactable {
        ...ReactionViewerGroups
      }
    `,
    reactable,
  )
  const dataSubIssues = useFragment(
    graphql`
      fragment IssueBodyViewerSubIssues on Issue {
        ...useCanEditSubIssues
        ...useHasSubIssues
        ...AddSubIssueButtonGroup @arguments(fetchSubIssues: false)
      }
    `,
    sub_issues ? subIssues : null,
  )

  const hasSubIssues = useHasSubIssues(dataSubIssues)
  const canEditSubIssues = useCanEditSubIssues(dataSubIssues)
  const showAddSubIssueButton = sub_issues && canEditSubIssues && dataSubIssues && !hasSubIssues

  const onSave = useCallback(
    (newBody: string, onCompleted: () => void, onError: () => void) => {
      commitUpdateIssueBodyMutation({
        environment,
        input: {issueId: data.id, body: newBody, bodyVersion},
        onCompleted,
        onError,
      })
    },
    [bodyVersion, environment, data.id],
  )

  const {addToast} = useToastContext()

  const onConvertToIssue = useCallback(
    (task: TaskItem, setIsConverting: (converting: boolean) => void) => {
      if (!(repositoryId && onIssueEditStateChange)) return

      setIsConverting(true)
      commitCreateIssueFromChecklistItemMutation({
        environment,
        input: {parentIssueId: data.id, repositoryId, title: task.title, position: task.position},
        onCompleted: () => {
          onIssueEditStateChange?.(true)
          setIsConverting(false)
        },
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({type: 'error', message: ERRORS.couldNotConvertIssue})
          setIsConverting(false)
        },
      })
    },
    [repositoryId, onIssueEditStateChange, environment, data.id, addToast],
  )

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4, p: 3}} ref={issueBodyRef}>
      <IssueMarkdownViewer
        html={html}
        markdown={markdown}
        viewerCanUpdate={viewerCanUpdate}
        onSave={onSave}
        onLinkClick={onLinkClick}
        onConvertToIssue={onConvertToIssue}
      />
      <Box sx={{flexDirection: 'row', display: 'flex', alignItems: 'left'}}>
        {/* Only render the tasklist button if sub-issues are disabled and tasklists are enabled */}
        {tasklist_block && !sub_issues && viewerRef && viewerCanUpdate && <AddTasklistButton bodyRef={viewerRef} />}
        {showAddSubIssueButton && (
          <Box sx={{mr: 2}}>
            <AddSubIssueButtonGroup issue={dataSubIssues} insideSidePanel={insideSidePanel} />
          </Box>
        )}
        <Suspense fallback={<ReactionViewerAnchor />}>
          <ReactionViewer subjectId={data.id} reactionGroups={dataReaction} locked={locked} />
        </Suspense>
      </Box>
    </Box>
  )
}
