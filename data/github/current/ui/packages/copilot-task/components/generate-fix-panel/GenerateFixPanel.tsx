import CopilotBadge from '@github-ui/copilot-chat/components/CopilotBadge'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath} from '@github-ui/paths'
import {ThreeBarsIcon, XIcon} from '@primer/octicons-react'
import {Button, IconButton, Link, SplitPageLayout} from '@primer/react'
import {clsx} from 'clsx'
import {memo, useState} from 'react'

import type {FocusedGenerativeTaskData, ThreadComment} from '../../utilities/copilot-task-types'
import styles from './GenerateFixPanel.module.css'
import {PullThread} from './PullRequestThread'
import {SkeletonDiffBlock} from './SkeletonDiffBlock'

function GenerateFixPanelHeader({firstComment, onClose}: {firstComment: ThreadComment; onClose: () => void}) {
  const {author} = firstComment
  const {avatarUrl, login} = author

  return (
    <div className="d-flex flex-row flex-items-center gap-2 border-bottom width-full p-2">
      <IconButton aria-label="Return to task panel" icon={ThreeBarsIcon} variant="invisible" onClick={onClose} />
      <GitHubAvatar
        data-hovercard-url={userHovercardPath({owner: login})}
        src={avatarUrl}
        size={24}
        alt={`@${login}`}
      />
      <span style={{fontWeight: 500}}>
        Thread by{' '}
        <Link
          className={clsx('color-fg-default f5 overflow-hidden', styles.actorName)}
          data-hovercard-url={userHovercardPath({owner: login})}
          href={login}
        >
          @{login}
        </Link>
      </span>
      <IconButton
        aria-label="Close fix generation panel"
        className={styles.closePanelButton}
        icon={XIcon}
        variant="invisible"
        onClick={onClose}
      />
    </div>
  )
}

export type GeneratePanelFixProps = {
  focusedGenerativeTask: FocusedGenerativeTaskData
  onClose: () => void
}

export const GenerateFixPanel = memo(function GenerateFixPanel({
  focusedGenerativeTask,
  onClose,
}: GeneratePanelFixProps) {
  const [isBusy, setIsBusy] = useState(false)

  if (!focusedGenerativeTask || focusedGenerativeTask.comments.length === 0) return null
  const firstComment = focusedGenerativeTask.comments[0]!

  return (
    <SplitPageLayout.Pane position="end" resizable padding="none">
      <div className="d-flex flex-column height-full">
        <GenerateFixPanelHeader firstComment={firstComment} onClose={onClose} />
        <div className="d-flex flex-column height-full p-3">
          <PullThread comments={focusedGenerativeTask.comments} isBusy={isBusy} />
          {isBusy && (
            <div className="d-flex flex-column">
              <span className="d-flex flex-row flex-items-center mt-2 gap-2">
                <CopilotBadge isLoading />
                <div className={clsx('color-fg-default f5 overflow-hidden', styles.actorName)}>Copilot</div>
                <span className="color-fg-muted">responding...</span>
              </span>
              <SkeletonDiffBlock />
            </div>
          )}
        </div>
        {!isBusy && (
          <div className="border-top d-flex flex-row flex-justify-end gap-2 p-2" style={{marginTop: 'auto'}}>
            <Button onClick={onClose}>Dismiss</Button>
            <Button variant="primary" onClick={() => setIsBusy(!isBusy)}>
              Generate a fix
            </Button>
          </div>
        )}
      </div>
    </SplitPageLayout.Pane>
  )
})
