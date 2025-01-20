/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Suspense, useEffect, useMemo} from 'react'
import {graphql, type PreloadedQuery, usePreloadedQuery, useQueryLoader} from 'react-relay'

import InboxDefaultViewRequest, {
  type InboxDefaultViewQuery,
  type InboxDefaultViewQuery$data,
} from './__generated__/InboxDefaultViewQuery.graphql'
import InboxDefaultViewAlert from './default-view/InboxDefaultViewAlert'
import InboxDefaultViewBody from './default-view/InboxDefaultViewBody'
import InboxDefaultViewHierarchy from './default-view/InboxDefaultViewHierarchy'
import InboxDefaultViewLoading from './default-view/InboxDefaultViewLoading'
import InboxDefaultViewMobileBack from './default-view/InboxDefaultViewMobileBack'
import InboxDefaultViewState from './default-view/InboxDefaultViewState'
import InboxDefaultViewTitle from './default-view/InboxDefaultViewTitle'
import type {SafeHTMLString} from '@github-ui/safe-html'

type InboxDefaultViewProps = {
  notificationId: string
}

type InboxDefaultViewRendererProps = {
  queryReference: PreloadedQuery<InboxDefaultViewQuery>
}

function getOwner(data: InboxDefaultViewQuery$data | null) {
  if (!data || !data.node) return null

  const {list} = data.node
  if (!list) return null

  const {__typename} = list

  switch (__typename) {
    case 'Repository':
      return list.owner
    case 'Team':
      return list.organization
    case 'User':
    case 'Organization':
      return list
    case 'Enterprise':
      return {login: list.slug, avatarUrl: list.avatarUrl, __typename: 'Enterprise'}
    default:
      return null
  }
}

function getState(data: InboxDefaultViewQuery$data | null) {
  if (!data || !data.node) return null

  const {subject} = data.node
  if (!subject) return null

  const {__typename} = subject

  switch (__typename) {
    case 'PullRequest':
      if (subject.merged) return 'MERGED'
      return subject.isDraft ? 'DRAFT' : subject.state.toUpperCase()
    case 'Discussion':
      if (subject.comments.nodes && subject.comments.nodes.length > 0) return 'ANSWERED'
      return 'UNANSWERED'
    case 'CheckSuite':
      return subject.status.toUpperCase()
    case 'WorkflowRun':
      return subject.workflow?.state
    case 'RepositoryAdvisory':
      return subject.repositoryAdvisoryState
    case 'AdvisoryCredit':
      return subject.advisoryCreditState
    default:
      return null
  }
}

function getTitle(data: InboxDefaultViewQuery$data | null) {
  if (!data || !data.node) return null

  const {subject} = data.node
  if (!subject) return null

  const {__typename} = subject

  switch (__typename) {
    case 'PullRequest':
      return subject.titleHTML
    case 'Discussion':
    case 'TeamDiscussion':
      return subject.title
    case 'CheckSuite':
      return `Check Suite: ${subject.name}`
    case 'Commit':
      return subject.message
    case 'Gist':
      return subject.gistTitle
    case 'Release':
      return subject.name
    case 'RepositoryAdvisory':
      return subject.repositoryAdvisoryTitle
    case 'RepositoryDependabotAlertsThread':
      return 'Your repository has dependencies with security vulnerabilities'
    case 'RepositoryInvitation':
      if (!subject.repositoryInvitation) return null
      return `Invitation to join ${subject.repositoryInvitation?.owner?.login}/${subject.repositoryInvitation?.name} from ${subject.inviter?.login}`
    case 'SecurityAdvisory':
      return subject.summary
    case 'AdvisoryCredit':
      return subject.advisory.summary
    case 'WorkflowRun':
      return subject.workflowTitle
    case 'MemberFeatureRequestNotification':
      return subject.title
    default:
      return null
  }
}

function getNumber(data: InboxDefaultViewQuery$data | null) {
  if (!data || !data.node) return null

  const {subject} = data.node
  if (!subject) return null

  const {__typename} = subject

  switch (__typename) {
    case 'PullRequest':
    case 'Discussion':
    case 'RepositoryVulnerabilityAlert':
    case 'WorkflowRun':
      return subject.number
    case 'CheckSuite':
      return subject.databaseId
    default:
      return null
  }
}

function getAuthor(data: InboxDefaultViewQuery$data | null) {
  if (!data || !data.node) return null

  const {subject} = data.node
  if (!subject) return null

  const {__typename} = subject

  switch (__typename) {
    case 'PullRequest':
    case 'Discussion':
    case 'Gist':
    case 'CheckSuite':
    case 'Release':
    case 'RepositoryAdvisory':
    case 'RepositoryVulnerabilityAlert':
    case 'TeamDiscussion':
      return subject.author
    case 'Commit':
      return subject.author?.actor
    default:
      return null
  }
}

function getBody(data: InboxDefaultViewQuery$data | null): SafeHTMLString | null {
  if (!data || !data.node) return null

  const {subject} = data.node
  if (!subject) return null
  const {__typename} = subject

  switch (__typename) {
    case 'PullRequest':
    case 'Discussion':
    case 'TeamDiscussion':
      return subject.bodyHTML as SafeHTMLString
    case 'Release':
      return subject.descriptionHTML as SafeHTMLString
    case 'RepositoryDependabotAlertsThread':
      if (!subject.repository.owner) return '' as SafeHTMLString
      return `Your repository ${subject.repository.owner?.login}/${subject.repository.name} has dependencies with security vulnerabilities.` as SafeHTMLString
    default:
      return null
  }
}

const notificationDefaultViewQuery = graphql`
  query InboxDefaultViewQuery($id: ID!) {
    node(id: $id) {
      ... on NotificationThread {
        id
        url
        summaryItemBody
        subject {
          __typename
          ... on Discussion {
            number
            author {
              login
            }
            title
            bodyHTML
            comments(first: 1) {
              nodes {
                author {
                  login
                }
              }
            }
            createdAt
          }
          ... on PullRequest {
            number
            author {
              login
            }
            isDraft
            state
            merged
            titleHTML
            bodyHTML
            body
            createdAt
          }
          ... on CheckSuite {
            databaseId
            author: creator {
              login
            }
            createdAt
            event
            name
            status
          }
          ... on Commit {
            oid
            author: committer {
              actor {
                login
              }
            }
            message
            messageBodyHTML
            createdAt: committedDate
          }
          ... on Gist {
            author: owner {
              login
            }
            gistTitle: title
            createdAt
          }
          ... on Release {
            author {
              login
            }
            name
            tagName
            descriptionHTML
            createdAt
          }
          ... on AdvisoryCredit {
            ghsaId
            advisory {
              description
              summary
            }
            advisoryCreditState: state
          }
          ... on RepositoryAdvisory {
            repositoryAdvisoryTitle: title
            repositoryAdvisoryState: state
            author: publisher {
              login
            }
            createdAt
          }
          ... on RepositoryInvitation {
            repositoryInvitation: repository {
              name
              owner {
                login
              }
            }
            inviter {
              login
            }
          }
          ... on RepositoryDependabotAlertsThread {
            repository {
              name
              owner {
                login
              }
            }
          }
          ... on RepositoryVulnerabilityAlert {
            number
            createdAt
            author: dismisser {
              login
            }
          }
          ... on SecurityAdvisory {
            ghsaId
            summary
            createdAt: publishedAt
          }
          ... on TeamDiscussion {
            number
            title
            bodyHTML
            author {
              login
            }
            createdAt
          }
          ... on WorkflowRun {
            number: runNumber
            workflowTitle: title
            workflow {
              state
            }
            createdAt
          }
          ... on MemberFeatureRequestNotification {
            title
            createdAt: updatedAt
          }
        }
        list {
          __typename
          ... on Repository {
            name
            owner {
              login
              avatarUrl
              url
            }
            isPrivate
            url
          }
          ... on Team {
            name
            slug
            organization {
              login
              avatarUrl
              url
            }
          }
          ... on User {
            login
            avatarUrl
          }
          ... on Organization {
            login
            avatarUrl
          }
          ... on Enterprise {
            slug
            avatarUrl
          }
        }
      }
    }
  }
`

export const InboxDefaultView = ({notificationId}: InboxDefaultViewProps) => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<InboxDefaultViewQuery>(InboxDefaultViewRequest)
  useEffect(() => {
    loadQuery({id: notificationId}, {fetchPolicy: 'store-or-network'})
    return () => {
      disposeQuery()
    }
  }, [disposeQuery, loadQuery, notificationId])

  return (
    <Suspense fallback={<InboxDefaultViewLoading />}>
      {queryReference && <InboxDefaultViewRenderer queryReference={queryReference} />}
    </Suspense>
  )
}

const InboxDefaultViewRenderer = ({queryReference}: InboxDefaultViewRendererProps) => {
  const data = usePreloadedQuery<InboxDefaultViewQuery>(notificationDefaultViewQuery, queryReference)

  const subject = data?.node?.subject
  const list = data?.node?.list
  const summaryItemBody = data?.node?.summaryItemBody as SafeHTMLString
  const url = data?.node?.url

  const ownerData = useMemo(() => getOwner(data), [data])
  const isRepository = list?.__typename === 'Repository'
  const isTeam = list?.__typename === 'Team'

  const owner = useMemo(() => {
    return {
      login: ownerData?.login ?? null,
      avatarUrl: ownerData?.avatarUrl ?? null,
      listName: isRepository || isTeam ? list.name : '',
      repoUrl: isRepository ? list.url : '',
      url: isRepository ? list.owner.url : '',
    }
  }, [ownerData, isRepository, isTeam, list])

  const subjectType = subject?.__typename

  const number = useMemo(() => getNumber(data), [data])
  const author = useMemo(() => getAuthor(data)?.login ?? null, [data])
  const state = useMemo(() => getState(data), [data])
  const title = useMemo(() => getTitle(data), [data])
  const body = useMemo(() => getBody(data) ?? summaryItemBody, [data, summaryItemBody])
  const createdAt =
    subjectType === 'RepositoryInvitation' ||
    subjectType === 'RepositoryDependabotAlertsThread' ||
    subjectType === 'AdvisoryCredit' ||
    subjectType === '%other'
      ? null
      : subject?.createdAt

  if (!list || !subjectType || !url) return null
  if (list?.__typename === '%other') return null

  return (
    <>
      <InboxDefaultViewAlert url={url} subjectType={subjectType} />

      {/* Mobile back nav */}
      <InboxDefaultViewMobileBack />

      {/* Hierarchy org/repository */}
      <InboxDefaultViewHierarchy owner={owner} listType={list?.__typename} />

      {/* Title and subject number */}
      <InboxDefaultViewTitle number={number} url={url} title={title} subjectType={subjectType} owner={owner} />

      {/* State, organization and creation date */}
      <InboxDefaultViewState
        state={state}
        subjectType={subjectType}
        isDraft={subject?.__typename === 'PullRequest' && subject.isDraft}
        author={author}
        owner={owner}
        createdAt={createdAt || null}
      />

      {/* Body */}
      {body && <InboxDefaultViewBody body={body} />}
    </>
  )
}
