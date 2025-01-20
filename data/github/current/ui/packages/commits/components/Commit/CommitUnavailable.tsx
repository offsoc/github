/* eslint eslint-comments/no-use: off */
/* eslint-disable primer-react/no-system-props */
import {contactPath} from '@github-ui/paths'
import {AlertIcon, HourglassIcon} from '@primer/octicons-react'
import {Blankslate, Stack} from '@primer/react/drafts'

import type {BranchCommitState} from '../../hooks/use-load-branch-commits'
import type {CommitExtended, CommitPayload} from '../../types/commit-types'
import {CommitInfo} from './CommitInfo'

export function CommitUnavailable({
  unavailableReason,
  commit,
  commitInfo,
}: {
  unavailableReason: NonNullable<CommitPayload['unavailableReason']>
  commit: CommitExtended
  commitInfo: BranchCommitState
}) {
  const unavailableReasonMetadata = unavailableReasonsMap[unavailableReason]

  return (
    <>
      <Stack data-hpc padding={{narrow: 'normal', regular: 'spacious'}}>
        <h1 className="sr-only">{commit.shortMessage}</h1>
        <CommitInfo commit={commit} commitInfo={commitInfo} />
      </Stack>
      <Blankslate>
        <Blankslate.Visual>{unavailableReasonMetadata.visual}</Blankslate.Visual>
        <Blankslate.Heading>{unavailableReasonMetadata.heading}</Blankslate.Heading>
        <Blankslate.Description>{unavailableReasonMetadata.description}</Blankslate.Description>
        {unavailableReasonMetadata.secondaryAction}
      </Blankslate>
    </>
  )
}

type UnavailableReasonMetadata = {
  visual: React.ReactNode
  heading: string
  description: string
  secondaryAction?: React.ReactNode
}

const unavailableReasonsMap: Record<NonNullable<CommitPayload['unavailableReason']>, UnavailableReasonMetadata> = {
  corrupt: {
    visual: <AlertIcon />,
    heading: 'Sorry, this diff is unavailable.',
    description: 'The repository may be missing relevant data.',
    secondaryAction: (
      <Blankslate.SecondaryAction href={contactPath()}>
        Please contact support for more information
      </Blankslate.SecondaryAction>
    ),
  },
  'missing commits': {
    visual: <AlertIcon />,
    heading: 'Sorry, this diff is unavailable.',
    description: 'The repository may be missing relevant data.',
    secondaryAction: (
      <Blankslate.SecondaryAction href={contactPath()}>
        Please contact support for more information
      </Blankslate.SecondaryAction>
    ),
  },
  timeout: {
    visual: <HourglassIcon />,
    heading: 'Sorry, this diff is taking too long to generate.',
    description: 'It may be too large to display on GitHub.',
  },
  'too busy': {
    visual: <HourglassIcon />,
    heading: 'Sorry, this diff is temporarily unavailable due to heavy server load.',
    description: 'Please try again later.',
  },
}
