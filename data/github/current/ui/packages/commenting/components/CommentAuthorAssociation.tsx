import type React from 'react'

import {TEST_IDS} from '../constants/test-ids'
import {CommentHeaderBadge} from './CommentHeaderBadge'
import type {CommentAuthorAssociation as GraphQlAuthorAssociation} from './issue-comment/__generated__/IssueCommentHeader.graphql'

type Props = {
  association: GraphQlAuthorAssociation
  viewerDidAuthor?: boolean
  org: string
  repo: string
}

type AssociationHash = Record<string, string>
type AssociationLabelMapper = (viewerDidAuthor: boolean, org?: string, repo?: string) => string

type AssociationLabelHash = Record<keyof AssociationHash, AssociationLabelMapper>

const MAP_ASSOCIATION: AssociationHash = {
  MEMBER: 'Member',
  OWNER: 'Owner',
  MANNEQUIN: 'Mannequin',
  COLLABORATOR: 'Collaborator',
  CONTRIBUTOR: 'Contributor',
  FIRST_TIME_CONTRIBUTOR: 'First-time contributor',
  FIRST_TIMER: 'First-time GitHub contributor',
  NONE: '',
}

const MAP_ASSOCIATION_LABELS: AssociationLabelHash = {
  MEMBER: (viewerDidAuthor: boolean, org?: string) =>
    `${viewerDidAuthor ? 'You are' : 'This user is'} a member of the ${org} organization.`,
  OWNER: (viewerDidAuthor: boolean, repo?: string) =>
    `${viewerDidAuthor ? 'You are' : 'This user is'} the owner of the ${repo} repository.`,
  MANNEQUIN: () => `This is a mannequin user.`,
  COLLABORATOR: (viewerDidAuthor: boolean, repo?: string) =>
    `${viewerDidAuthor ? 'You have' : 'This user has'} been invited to collaborate on the ${repo} repository.`,
  CONTRIBUTOR: (viewerDidAuthor: boolean, repo?: string) =>
    `${viewerDidAuthor ? 'You have' : 'This user has'} previously committed to the ${repo} repository.`,
  FIRST_TIME_CONTRIBUTOR: (viewerDidAuthor: boolean, repo?: string) =>
    `${viewerDidAuthor ? 'You are' : 'This user is'} a first-time contributor to the ${repo} repository.`,
  FIRST_TIMER: (viewerDidAuthor: boolean) =>
    `${viewerDidAuthor ? 'This is your' : "This user's"} first pull request on GitHub.`,
  NONE: () => '',
}

export const CommentAuthorAssociation: React.FC<Props> = ({association, org, repo, viewerDidAuthor}: Props) => {
  const associationForLabel = MAP_ASSOCIATION[association] ? association : 'NONE'
  if (associationForLabel === 'NONE') return null

  const ariaLabel = MAP_ASSOCIATION_LABELS[associationForLabel]!(viewerDidAuthor ?? false, org, repo)

  return (
    <CommentHeaderBadge
      label={MAP_ASSOCIATION[associationForLabel]!}
      ariaLabel={ariaLabel}
      testId={TEST_IDS.commentAuthorAssociation}
      viewerDidAuthor={viewerDidAuthor}
    />
  )
}
