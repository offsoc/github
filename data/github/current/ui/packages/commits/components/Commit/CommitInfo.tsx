import {useCurrentRepository} from '@github-ui/current-repository'
import {commitHovercardPath, commitPath, repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {SafeHTMLText} from '@github-ui/safe-html'
import {SignedCommitBadge} from '@github-ui/signed-commit-badge'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {FileCodeIcon} from '@primer/octicons-react'
import {Button, Label, Link as PrimerLink} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {Fragment} from 'react'

import {useCommitsAppPayload} from '../../hooks/use-commits-app-payload'
import type {BranchCommitState} from '../../hooks/use-load-branch-commits'
import {useLoadSingleDeferredCommitData} from '../../shared/use-load-deferred-commit-data'
import type {CommitExtended} from '../../types/commit-types'
import {grabAndAppendUrlParameters} from '../../utils/grab-and-append-url-parameters'
import {shortSha} from '../../utils/short-sha'
import {AsyncChecksStatusBadge} from '../AsyncChecksStatusBadge'
import {CommitAttribution} from '../CommitAttribution'
import {verifiedBadgeWidth} from '../CommitRowBadges'
import {CopySHA} from '../CopySHA'
import {Panel} from '../Panel'
import {CommitBranchInfo} from './CommitBranchInfo'
import {CommitTagInfo} from './CommitTagInfo'
import {SpoofedCommitWarningBanner} from './SpoofedCommitWarningBanner'
import {WeirichCommitBanner} from './WeirichCommitBanner'

interface CommitInfoProps {
  commit: CommitExtended
  commitInfo: BranchCommitState
}

const alphaFeedback = {
  badgeLabel: 'Alpha',
  // swap this out for the real feedback link when we have it
  feedbackLink: 'https://github-grid.enterprise.slack.com/archives/C0357UQ03KN',
}

const betaFeedback = {
  badgeLabel: 'Beta',
  feedbackLink: 'https://gh.io/diff-refresh-feedback',
}

export function CommitInfo({commit, commitInfo}: CommitInfoProps) {
  const diffUXRefreshBeta = useFeatureFlag('diff_ux_refresh_beta')
  const {feedbackLink, badgeLabel} = diffUXRefreshBeta ? betaFeedback : alphaFeedback

  const repo = useCurrentRepository()
  const {helpUrl} = useCommitsAppPayload()

  const deferredData = useLoadSingleDeferredCommitData(
    `${commitPath({owner: repo.ownerLogin, repo: repo.name, commitish: commit.oid})}/deferred_commit_data`,
  )
  let checkStatusCount = ''
  try {
    checkStatusCount = deferredData?.statusCheckStatus?.short_text?.split('checks')[0]?.trim() || ''
  } catch {
    //noop
  }

  return (
    <div>
      {!commitInfo.loading && commitInfo.branches.length === 0 ? <SpoofedCommitWarningBanner /> : null}
      <WeirichCommitBanner oid={commit.oid} repo={repo} />

      <Panel>
        {/* Title and description */}
        <div className="d-flex flex-column bgColor-muted p-3 border-bottom rounded-top-2">
          <div className="d-flex flex-justify-end flex-md-justify-between flex-column-reverse flex-md-row gap-2">
            <div className="d-flex flex-items-center flex-wrap gap-2">
              <SafeHTMLText html={commit.shortMessageMarkdown} className="markdown-title f4 text-semibold" />
              <AsyncChecksStatusBadge
                oid={commit.oid}
                status={deferredData?.statusCheckStatus?.state}
                descriptionString={checkStatusCount}
                repo={repo}
              />
            </div>
            <div className="d-flex gap-2 flex-items-center flex-justify-between flex-md-justify-end">
              <div className="d-flex flex-items-center gap-2">
                <Label className="v-align-middle" variant="success">
                  {badgeLabel}
                </Label>

                <PrimerLink href={feedbackLink} target="_blank" rel="noopener noreferrer" className="no-wrap">
                  Give feedback
                </PrimerLink>
              </div>

              <Tooltip text="Browse the repository at this point in the history">
                <Button
                  as={PrimerLink}
                  href={repositoryTreePath({repo, action: 'tree', commitish: commit.oid})}
                  leadingVisual={FileCodeIcon}
                >
                  Browse files
                </Button>
              </Tooltip>
            </div>
          </div>
          {commit.bodyMessageHtml && (
            <SafeHTMLText
              html={commit.bodyMessageHtml}
              className="ws-pre-wrap extended-commit-description-container pt-2 f6 fgColor-muted wb-break-word text-mono"
            />
          )}
        </div>
        <CommitBranchInfo data={commitInfo} />
        <CommitTagInfo data={commitInfo} />
        {/* Commit attribution */}
        <div className="d-flex flex-justify-between p-3 gap-2 flex-column flex-md-row">
          <CommitAttribution
            commit={commit}
            repo={repo}
            settings={{fontColor: 'fg.default', avatarSize: 20, fontWeight: 'bold'}}
          >
            {deferredData ? (
              deferredData.signatureInformation ? (
                <div className="pl-2">
                  <SignedCommitBadge
                    commitOid={commit.oid}
                    hasSignature={true}
                    verificationStatus={deferredData.verifiedStatus}
                    signature={{helpUrl, ...deferredData.signatureInformation}}
                  />
                </div>
              ) : null
            ) : (
              <LoadingSkeleton className="ml-2" variant="rounded" width={verifiedBadgeWidth} />
            )}
          </CommitAttribution>
          <pre className="color-fg-muted d-flex flex-items-center">
            {`${commit.parents.length} parent${commit.parents.length > 1 || commit.parents.length === 0 ? 's' : ''} `}
            {commit.parents.map((parent, index) => {
              return (
                <Fragment key={parent}>
                  {index !== 0 ? ' + ' : ''}
                  <PrimerLink
                    to={
                      commitPath({owner: repo.ownerLogin, repo: repo.name, commitish: parent}) +
                      grabAndAppendUrlParameters()
                    }
                    as={Link}
                    className="color-fg-default Link--inTextBlock"
                    data-hovercard-url={commitHovercardPath({
                      owner: repo.ownerLogin,
                      repo: repo.name,
                      commitish: parent,
                    })}
                  >
                    {shortSha(parent)}
                  </PrimerLink>
                </Fragment>
              )
            })}
            {' commit '}
            <span className="fgColor-default">{shortSha(commit.oid)}</span>
            <CopySHA sha={commit.oid} direction="sw" />
          </pre>
        </div>
      </Panel>
    </div>
  )
}
