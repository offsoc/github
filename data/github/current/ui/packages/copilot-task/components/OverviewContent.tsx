import {useCurrentRepository} from '@github-ui/current-repository'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {branchPath, pullRequestPath} from '@github-ui/paths'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {SafeHTMLDiv, type SafeHTMLString} from '@github-ui/safe-html'
import {ArrowLeftIcon, ArrowUpRightIcon} from '@primer/octicons-react'
import {BranchName, IssueLabelToken, LabelGroup, LinkButton, Octicon} from '@primer/react'
import {clsx} from 'clsx'

import type {OverviewPayload} from '../utilities/copilot-task-types'
import styles from './OverviewContent.module.css'

export function OverviewContent() {
  const {pullRequest} = useRoutePayload<OverviewPayload>()
  const {baseBranch, bodyHtml, headBranch, labels, number, titleHtml} = pullRequest
  const repo = useCurrentRepository()

  return (
    <div className="d-flex flex-column gap-3 overflow-y-auto height-full">
      <div>
        <div className="mb-2 d-flex">
          <div className="d-inline pr-2">
            <SafeHTMLDiv className="f5 inline text-semibold" html={titleHtml as SafeHTMLString} />
          </div>
          <span className="color-fg-muted">#{number}</span>
        </div>
        <div className={clsx('d-flex flex-items-center flex-row gap-1 flex-wrap', styles.maxWidthFull)}>
          <BranchName href={branchPath({owner: repo.ownerLogin, repo: repo.name, branch: baseBranch})}>
            {baseBranch}
          </BranchName>
          <Octicon className="color-fg-muted" icon={ArrowLeftIcon} size={16} />
          <BranchName
            href={branchPath({owner: repo.ownerLogin, repo: repo.name, branch: headBranch})}
            className={clsx(styles.maxWidthFull)}
          >
            {headBranch}
          </BranchName>
        </div>
      </div>

      {labels.length > 0 && (
        <LabelGroup>
          {labels.map(label => (
            <IssueLabelToken key={label.name} text={label.name} fillColor={`#${label.color}`} />
          ))}
        </LabelGroup>
      )}

      <div className="d-flex flex-column p-3 rounded-2 border">
        {bodyHtml ? (
          <MarkdownViewer verifiedHTML={bodyHtml as SafeHTMLString} />
        ) : (
          <div className="color-fg-muted italic">No description provided.</div>
        )}
      </div>

      <LinkButton
        href={pullRequestPath({repo, number: Number(number)})}
        leadingVisual={ArrowUpRightIcon}
        variant="invisible"
      >
        View pull request details
      </LinkButton>
    </div>
  )
}
