import {type PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader} from 'react-relay'

import {ActionList, Box} from '@primer/react'
import {useEffect} from 'react'
import {InfoIcon} from '@primer/octicons-react'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import {renderGenericError} from '../shared/IssueViewerError'
import type {ParticipantsListQuery} from './__generated__/ParticipantsListQuery.graphql'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath} from '@github-ui/paths'

type ParticipantsListProps = {
  repo: string
  owner: string
  number: number
  totalCount: number
}

const ParticipantsListQueryGraphQL = graphql`
  query ParticipantsListQuery($repo: String!, $owner: String!, $number: Int!) {
    repository(name: $repo, owner: $owner) {
      issue(number: $number) {
        participants(first: 100) {
          nodes {
            avatarUrl(size: 64)
            login
            name
          }
        }
      }
    }
  }
`

export function ParticipantsList({repo, owner, number, totalCount}: ParticipantsListProps) {
  const [queryRef, loadParticipants] = useQueryLoader<ParticipantsListQuery>(ParticipantsListQueryGraphQL)

  useEffect(() => {
    loadParticipants({repo, owner, number})
  }, [loadParticipants, number, owner, repo])

  // return null to trigger suspense
  if (!queryRef) return null

  return (
    <PreloadedQueryBoundary
      onRetry={() => loadParticipants({owner, repo, number}, {fetchPolicy: 'network-only'})}
      fallback={renderGenericError}
    >
      <ParticipantsListInternal queryRef={queryRef} totalCount={totalCount} />
    </PreloadedQueryBoundary>
  )
}

function ParticipantsListInternal({
  queryRef,
  totalCount,
}: {
  queryRef: PreloadedQuery<ParticipantsListQuery>
  totalCount: number
}) {
  const {repository} = usePreloadedQuery<ParticipantsListQuery>(ParticipantsListQueryGraphQL, queryRef)
  const fitleredParticipants = (repository?.issue?.participants.nodes || []).flatMap(a => (a ? a : []))

  return (
    <>
      <ActionList>
        {fitleredParticipants.map(({login, avatarUrl, name}) => (
          <ActionList.LinkItem key={login} href={`/${login}`}>
            <ActionList.LeadingVisual>
              <GitHubAvatar
                src={avatarUrl}
                size={20}
                alt={`@${login}`}
                data-hovercard-url={userHovercardPath({owner: login})}
                sx={{boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))'}}
              />
            </ActionList.LeadingVisual>
            {name}
            <ActionList.Description>{login}</ActionList.Description>
          </ActionList.LinkItem>
        ))}
      </ActionList>
      {totalCount > 100 && (
        <Box sx={{ml: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1}}>
          <InfoIcon size={16} />
          Only the first 100 participants are shown in this list.
        </Box>
      )}
    </>
  )
}
