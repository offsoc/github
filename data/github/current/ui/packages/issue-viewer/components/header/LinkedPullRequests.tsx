import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {LinkedPullRequest$key} from './__generated__/LinkedPullRequest.graphql'
import {ActionList, ActionMenu, Box} from '@primer/react'
import type {LinkedPullRequests$data, LinkedPullRequests$key} from './__generated__/LinkedPullRequests.graphql'
import {useMemo, type FC, type ReactNode} from 'react'
import {LABELS} from '../../constants/labels'
import {LinkedPullRequestListItem, LinkedPRIcon, LinkedPRName, LinkedPullRequestLinkItem} from './LinkedPullRequest'

const LinkedPRsPill: FC<{children: ReactNode}> = props => (
  <Box
    sx={{
      alignItems: 'center',
      bg: 'canvas.default',
      border: '1px solid',
      borderColor: 'border.default',
      borderRadius: '100px',
      color: 'fg.muted',
      display: 'flex',
      fontSize: 0,
      fontWeight: 'normal',
      height: '32px',
      px: 'var(--control-small-paddingInline-normal)',
      whiteSpace: 'nowrap',
    }}
    {...props}
  />
)

export const LinkedPullRequestsInternal = ({
  issueData,
  isSmall = false,
  isSticky = false,
}: {
  issueData: LinkedPullRequests$key
  isSmall?: boolean
  isSticky?: boolean
}) => {
  const data = useFragment(
    graphql`
      fragment LinkedPullRequests on Issue {
        repository {
          nameWithOwner
        }
        linkedPullRequests: closedByPullRequestsReferences(first: 10, includeClosedPrs: false, orderByState: true) {
          nodes {
            repository {
              nameWithOwner
            }
            state
            isDraft
            ...LinkedPullRequest
          }
        }
      }
    `,
    issueData,
  )
  const {mergedPullRequests, openPullRequests, draftPullRequests, externalPrsCount, issueRepositoryName, pullRequests} =
    getPullRequests(data)
  const remainingPRs = useMemo(() => [...openPullRequests, ...draftPullRequests], [openPullRequests, draftPullRequests])
  const hasRemainingAndMerged = useMemo(
    () => remainingPRs.length > 0 && mergedPullRequests.length > 0,
    [remainingPRs.length, mergedPullRequests.length],
  )

  // Show hovercard link if there is only one PR
  const isSinglePr = useMemo(() => pullRequests.length === 1, [pullRequests.length])

  // Show summary view if there is more than one external PR, or more than two PRs
  const showSummaryView = useMemo(
    () => externalPrsCount > 1 || pullRequests.length > 2,
    [externalPrsCount, pullRequests.length],
  )

  // Show hovercards with two icons if there is a mix of merged, open and draft PRs (and not in summary view)
  const showTwoIcons = useMemo(
    () =>
      !showSummaryView &&
      ((mergedPullRequests.length > 0 && (openPullRequests.length > 0 || draftPullRequests.length > 0)) ||
        (openPullRequests.length > 0 && draftPullRequests.length > 0)),
    [mergedPullRequests.length, openPullRequests.length, draftPullRequests.length, showSummaryView],
  )

  // Show hovercards with up to two pull requests in the same state
  const showTwoPrs = useMemo(() => !showTwoIcons && pullRequests.length === 2, [pullRequests.length, showTwoIcons])

  // Stop rendering if there are no linked pull requests
  if (pullRequests.length < 1 || !pullRequests[0]) return null

  const inner = isSinglePr ? (
    <LinkedPullRequestLinkItem
      pullKey={pullRequests[0]}
      issueRepositoryName={issueRepositoryName}
      omitHover={isSmall}
    />
  ) : showSummaryView ? (
    <Box sx={{display: 'flex', flexDirection: 'row', gap: 1}}>
      {isSmall ? (
        <LinkedPullRequestLinkItem
          pullKey={pullRequests[0]}
          issueRepositoryName={issueRepositoryName}
          omitHover={isSmall}
        />
      ) : (
        <>
          <LinkedPRIcon pullKey={pullRequests[0]} />
          <LinkedPRName pullKey={pullRequests[0]} issueRepositoryName={issueRepositoryName} />
        </>
      )}
      <span>
        <span> (</span>
        <span>+{pullRequests.length - 1}</span>
        <span>)</span>
      </span>
    </Box>
  ) : showTwoIcons ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'row'}}>
        <LinkedPullRequestLinkItem
          pullKey={pullRequests[0]}
          issueRepositoryName={issueRepositoryName}
          omitHover={isSmall}
        />
      </Box>

      {/* This should never be null because of `showTwoIcon` assertion */}
      {pullRequests[1] && (
        <Box sx={{display: 'flex', flexDirection: 'row'}}>
          <LinkedPullRequestLinkItem
            pullKey={pullRequests[1]}
            issueRepositoryName={issueRepositoryName}
            omitHover={isSmall}
          />
        </Box>
      )}
    </Box>
  ) : showTwoPrs ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        '& > *:not(:last-child)::after': {
          content: '","',
          mr: 1,
        },
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'row'}}>
        <LinkedPullRequestLinkItem
          pullKey={pullRequests[0]}
          issueRepositoryName={issueRepositoryName}
          omitHover={isSmall}
        />
      </Box>
      {pullRequests[1] && (
        <Box sx={{display: 'flex', flexDirection: 'row'}}>
          <LinkedPullRequestLinkItem
            pullKey={pullRequests[1]}
            issueRepositoryName={issueRepositoryName}
            omitIcon={true}
            omitHover={isSmall}
          />
        </Box>
      )}
    </Box>
  ) : null

  if (isSmall) {
    return <Box sx={{display: 'flex', flexDirection: 'row'}}>{inner}</Box>
  }

  return (
    <>
      {showSummaryView ? (
        <ActionMenu>
          <ActionMenu.Button
            aria-label={LABELS.linkedPrsLabel}
            sx={{
              bg: 'canvas.default',
              borderRadius: '100px',
              color: 'fg.muted',
              display: 'flex',
              fontSize: 0,
              fontWeight: 'normal',
              gap: 1,
            }}
          >
            {inner}
          </ActionMenu.Button>
          <ActionMenu.Overlay
            sx={{display: isSticky ? 'none' : 'block'}}
            width={externalPrsCount > 0 ? 'medium' : 'auto'}
          >
            <ActionList>
              {/* Merged PRs */}
              {hasRemainingAndMerged && (
                <ActionList.GroupHeading aria-label={LABELS.mergedPrs}>{LABELS.mergedPrs}</ActionList.GroupHeading>
              )}
              {mergedPullRequests.length > 0 && (
                <ListRenderer list={mergedPullRequests} issueRepositoryName={issueRepositoryName} />
              )}

              {/* Remaining PRs -- open and draft */}
              {hasRemainingAndMerged && (
                <>
                  <ActionList.Divider />
                  <ActionList.GroupHeading aria-label={LABELS.openPrs}>{LABELS.openPrs}</ActionList.GroupHeading>
                </>
              )}
              {remainingPRs.length > 0 ? (
                <ListRenderer list={remainingPRs} issueRepositoryName={issueRepositoryName} />
              ) : null}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      ) : (
        <LinkedPRsPill>{inner}</LinkedPRsPill>
      )}
    </>
  )
}

type ListRendererProps = {
  list: LinkedPullRequest$key[]
  issueRepositoryName: string
}

const ListRenderer: FC<ListRendererProps> = ({list, issueRepositoryName}) => (
  <>
    {list.map((pull, i) => (
      <LinkedPullRequestListItem pullKey={pull} issueRepositoryName={issueRepositoryName} key={i} />
    ))}
  </>
)

type LinkedPullRequestsData = {
  mergedPullRequests: LinkedPullRequest$key[]
  openPullRequests: LinkedPullRequest$key[]
  draftPullRequests: LinkedPullRequest$key[]
  externalPrsCount: number
  issueRepositoryName: string
  pullRequests: LinkedPullRequest$key[]
}

const getPullRequests = (data: LinkedPullRequests$data): LinkedPullRequestsData => {
  const mergedPullRequests: LinkedPullRequest$key[] = []
  const openPullRequests: LinkedPullRequest$key[] = []
  const draftPullRequests: LinkedPullRequest$key[] = []
  const issueRepositoryName = data.repository.nameWithOwner.toLocaleLowerCase()

  let externalPrsCount = 0

  data.linkedPullRequests?.nodes?.flatMap(a => {
    if (!a) return

    const isExternal = a.repository.nameWithOwner.toLocaleLowerCase() !== issueRepositoryName.toLocaleLowerCase()
    isExternal && externalPrsCount++

    // We add external PRs to the end of each list
    switch (a.state) {
      case 'MERGED':
        return isExternal ? mergedPullRequests.push(a) : mergedPullRequests.unshift(a)
      case 'OPEN':
        if (a.isDraft) {
          return isExternal ? draftPullRequests.push(a) : draftPullRequests.unshift(a)
        } else {
          return isExternal ? openPullRequests.push(a) : openPullRequests.unshift(a)
        }
      case 'CLOSED':
        // We specifically ignore closed PRs for the Header pill, they are shown in the sidebar
        return
      default:
        return
    }
  })

  // Combine all PRs into one list
  const pullRequests: LinkedPullRequest$key[] = [
    ...mergedPullRequests,
    ...openPullRequests,
    ...draftPullRequests,
  ] as LinkedPullRequest$key[]
  return {mergedPullRequests, openPullRequests, draftPullRequests, externalPrsCount, issueRepositoryName, pullRequests}
}
