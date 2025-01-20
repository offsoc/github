import {GitHubAvatar} from '@github-ui/github-avatar'
import {ListItemDescriptionItem} from '@github-ui/list-view/ListItemDescriptionItem'
import {useListViewVariant} from '@github-ui/list-view/ListViewVariantContext'
import {Link, RelativeTime, Truncate} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {PullRequestItem$data} from './__generated__/PullRequestItem.graphql'
import {CheckRunStatus} from './PullRequestItem'
import {LABELS} from '../constants/labels'
import {TEST_IDS} from '../constants/test-ids'
import type {IssuePullRequestDescription$key} from './__generated__/IssuePullRequestDescription.graphql'
import {ReviewDecision} from './ReviewDecision'
import {userHovercardPath} from '@github-ui/paths'
import styles from './issue-item.module.css'
import {VALUES} from '../constants/values'
import {MilestoneMetadata} from './MilestoneMetadata'

const descriptionFragment = graphql`
  fragment IssuePullRequestDescription on IssueOrPullRequest {
    ... on Issue {
      createdAt
      updatedAt

      author {
        login
        avatarUrl
      }
      number
      ...MilestoneMetadata
    }

    ... on PullRequest {
      createdAt
      updatedAt
      author {
        login
        avatarUrl
      }
      number
      ...MilestoneMetadata
      reviewDecision
    }
  }
`

type DescriptionProps = {
  dataKey: IssuePullRequestDescription$key
  repositoryOwner: string
  repositoryName: string
  showRepository?: boolean
  showAuthorAvatar?: boolean
  showTimestamp?: boolean
  sortingItemSelected?: string
  statusCheckRollup?: NonNullable<PullRequestItem$data['headCommit']>['commit']['statusCheckRollup']
  getAuthorHref?: (login: string) => string
}

export function IssuePullRequestDescription({dataKey, repositoryOwner, repositoryName, ...props}: DescriptionProps) {
  const {number} = useFragment(descriptionFragment, dataKey)
  const nameWithOwner = `${repositoryOwner}/${repositoryName}`
  const ariaLabels: {[id: string]: string} = {
    number: `number ${number} `,
    repo: ` In ${nameWithOwner};`,
  }

  const defaultRepositoryRender = (
    <div className={styles.defaultRepoContainer}>
      <span>{props.showRepository ? nameWithOwner : ''}</span>
      <span className="sr-only">{ariaLabels.number}</span>
    </div>
  )

  const defaultNumberRender = (
    <span className={styles.defaultNumberDescription}>
      <span>#{number}</span>
      <span className="sr-only">{ariaLabels.repo}</span>
    </span>
  )

  return (
    <IssuePullRequestDescriptionItem
      dataKey={dataKey}
      defaultRepositoryRender={defaultRepositoryRender}
      defaultNumberRender={defaultNumberRender}
      nameWithOwner={nameWithOwner}
      repositoryOwner={repositoryOwner}
      repositoryName={repositoryName}
      ariaLabels={ariaLabels}
      {...props}
    />
  )
}

const IssuePullRequestDescriptionItem = ({
  dataKey,
  showRepository = true,
  showAuthorAvatar = false,
  showTimestamp = true,
  sortingItemSelected,
  statusCheckRollup,
  defaultRepositoryRender,
  defaultNumberRender,
  nameWithOwner,
  ariaLabels,
  getAuthorHref,
}: DescriptionProps & {
  defaultRepositoryRender: React.ReactNode
  defaultNumberRender: React.ReactNode
  nameWithOwner: string
  ariaLabels: {[id: string]: string}
}) => {
  const descriptionData = useFragment(descriptionFragment, dataKey)
  const {variant} = useListViewVariant()

  const {author, reviewDecision, createdAt: createdAtString, updatedAt: updatedAtString} = descriptionData

  const authorLogin = author?.login || VALUES.ghostUserLogin
  const authorAvatarUrl = author?.avatarUrl || VALUES.ghostUserAvatarUrl
  const createdAt = createdAtString ? new Date(createdAtString) : new Date()
  const updatedAt = updatedAtString ? new Date(updatedAtString) : new Date()

  return (
    <ListItemDescriptionItem data-testid={TEST_IDS.listRowRepoNameAndNumber}>
      {variant === 'compact'
        ? showRepository && (
            <>
              <Truncate
                title={nameWithOwner}
                sx={{color: 'fg.muted', fontWeight: 'normal', fontSize: 0, maxWidth: 300}}
              >
                <span className={styles.compactNameWithOwnerLabel}>{nameWithOwner}</span>
              </Truncate>
              <span className="sr-only">{ariaLabels.number}</span>
            </>
          )
        : showRepository && defaultRepositoryRender}
      {defaultNumberRender}
      {showTimestamp && variant === 'default' && (
        <div className={styles.timestampContainer}>
          {sortingItemSelected === LABELS.RecentlyUpdated ? (
            <>
              <div className={styles.visibleTimestampResponsive}>
                &middot;{' '}
                <RelativeTime format="micro" date={new Date(updatedAt)}>
                  on {updatedAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </RelativeTime>
              </div>
              <div className={styles.hiddenTimestampResponsive} aria-hidden="true">
                &middot; Updated{' '}
                <RelativeTime date={new Date(updatedAt)} sx={{verticalAlign: 'bottom'}}>
                  on {updatedAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </RelativeTime>
              </div>
            </>
          ) : (
            <>
              <div className={styles.visibleTimestampResponsive}>
                &middot;{' '}
                <RelativeTime format="micro" date={new Date(createdAt)}>
                  on {createdAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </RelativeTime>
              </div>
              <div className={styles.hiddenTimestampResponsive} aria-hidden="true">
                &middot;{' '}
                {showAuthorAvatar && authorAvatarUrl && (
                  <GitHubAvatar src={authorAvatarUrl} size={16} alt={authorLogin} sx={{mr: 1}} />
                )}
                <Link
                  href={getAuthorHref ? getAuthorHref(authorLogin) : `/${authorLogin}`}
                  aria-label={`Add author ${authorLogin} to current search query`}
                  className={styles.authorCreatedLink}
                  data-hovercard-url={userHovercardPath({owner: authorLogin})}
                >
                  {authorLogin}
                </Link>{' '}
                opened{' '}
                <RelativeTime date={new Date(createdAt)}>
                  on {createdAt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                </RelativeTime>
              </div>
            </>
          )}
        </div>
      )}
      {reviewDecision && <ReviewDecision decision={reviewDecision} variant={variant} />}
      <MilestoneMetadata data={descriptionData} />
      {statusCheckRollup && <CheckRunStatus variant={variant} statusCheckRollup={statusCheckRollup} />}
    </ListItemDescriptionItem>
  )
}
