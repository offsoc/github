import {assertDataPresent} from '@github-ui/assert-data-present'
import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {CopilotChatIntents, type FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {sendEvent} from '@github-ui/hydro-analytics'
import {CopilotIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Button, Tooltip} from '@primer/react'
import {memo} from 'react'
import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import {useFileDiffReference} from '../../use-file-diff-reference'
import {AskCopilotDiffEntriesSelectPanel} from './AskCopilotDiffEntriesSelectPanel'
import styles from './DiffHeaderAskCopilotButton.module.css'
import type {DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data$key} from './__generated__/DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data.graphql'
import type {DiffHeaderAskCopilotButton_data$key} from './__generated__/DiffHeaderAskCopilotButton_data.graphql'
import type {ButtonProps} from '@primer/react'

const askCopilotButtonProps = {
  size: 'small',
  leadingVisual: CopilotIcon,
  className: styles.askCopilotButton,
  children: 'Ask Copilot',
  trailingVisual: TriangleDownIcon,
} as const satisfies Partial<ButtonProps>

interface DiffHeaderAskCopilotButtonProps {
  pullRequestKey: DiffHeaderAskCopilotButton_data$key
}

export const DiffHeaderAskCopilotButton = memo(function CopilotChatDiffHeaderButton({
  pullRequestKey,
}: DiffHeaderAskCopilotButtonProps) {
  const data = useFragment(
    graphql`
      fragment DiffHeaderAskCopilotButton_data on PullRequest {
        ...AskCopilotDiffEntriesSelectPanel_data
        comparison(startOid: $startOid, endOid: $endOid) {
          ...DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data
          diffEntriesMetadata: diffEntries {
            totalCount
          }
        }
      }
    `,
    pullRequestKey,
  )
  const entriesCount = data.comparison?.diffEntriesMetadata.totalCount

  const onSubmit = (references: FileDiffReference[]) => {
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      references,
    })
    sendEvent('copilot.file-diff-header.discuss')
  }

  if (!data.comparison || entriesCount === 0) {
    return <UnavailableAskCopilotButton />
  }
  if (entriesCount === 1) {
    return <SingleFileAskCopilotButton comparisonKey={data.comparison} onSubmit={onSubmit} />
  }
  return (
    <AskCopilotDiffEntriesSelectPanel pullRequestKey={data} anchorProps={askCopilotButtonProps} onSubmit={onSubmit} />
  )
})

function UnavailableAskCopilotButton() {
  return (
    <Tooltip aria-label="Copilot is not available for this pull request">
      <Button {...askCopilotButtonProps} disabled />
    </Tooltip>
  )
}

export const ErrorAskCopilotButton = memo(function ErrorAskCopilotButton() {
  return (
    <Tooltip aria-label="Copilot failed to load">
      <Button {...askCopilotButtonProps} disabled />
    </Tooltip>
  )
})

export const LoadingAskCopilotButton = memo(function LoadingAskCopilotButton() {
  return (
    <Tooltip aria-label="Loading Copilot features…">
      <Button {...askCopilotButtonProps} disabled />
    </Tooltip>
  )
})
interface SingleFileAskCopilotButtonProps {
  comparisonKey: DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data$key
  onSubmit: (references: FileDiffReference[]) => void
}

function SingleFileAskCopilotButton({comparisonKey, onSubmit}: SingleFileAskCopilotButtonProps) {
  const data = useFragment(
    graphql`
      fragment DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data on PullRequestComparison {
        ...useFileDiffReference_Comparison
        firstDiffEntry: diffEntries(first: 1) {
          edges @required(action: THROW) {
            node @required(action: THROW) {
              ...useFileDiffReference_DiffEntry
            }
          }
        }
      }
    `,
    comparisonKey,
  )
  const firstEntry = data.firstDiffEntry.edges[0]?.node
  assertDataPresent(firstEntry)

  const reference = useFileDiffReference(data, firstEntry)

  // if we only have one item, and that item is not copilotable, there's nothing we can do here but throw to put the
  // button into an error state
  if (reference === undefined) {
    return <UnavailableAskCopilotButton />
  }

  return <Button {...askCopilotButtonProps} onClick={() => onSubmit([reference])} trailingVisual={null} />
}
