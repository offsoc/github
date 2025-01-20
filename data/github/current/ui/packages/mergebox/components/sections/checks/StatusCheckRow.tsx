import {Label, Octicon, Spinner} from '@primer/react'
import {memo} from 'react'
import {clsx} from 'clsx'

import {GitHubAvatar} from '@github-ui/github-avatar'
import {ArrowRightIcon} from '@primer/octicons-react'
import {STATUS_CHECK_CONFIGS} from '../../../helpers/status-check-helpers'
import type {StatusCheck} from '../../../page-data/payloads/status-checks'
import styles from './StatusCheckRow.module.css'

function StatusIcon({iconColor, icon}: {iconColor: string; icon: React.ElementType}) {
  return (
    <Octicon
      icon={icon}
      sx={{
        color: iconColor,
      }}
    />
  )
}

function CheckSpinner() {
  return (
    <div className="position-relative d-flex color-fg-attention">
      <Spinner size="small" />
      <div className={styles['check-spinner-wrapper']}>
        <div className={styles['check-spinner-inner']} />
      </div>
    </div>
  )
}

/**
 * Renders either a check run or a status context in the DOM as link. This component does not use Relay.
 */
export const StatusCheckRow = memo(function StatusCheckRow({
  avatarUrl,
  displayName,
  description,
  state,
  targetUrl,
  isRequired,
}: Partial<StatusCheck>) {
  const statusState = STATUS_CHECK_CONFIGS[state as keyof typeof STATUS_CHECK_CONFIGS]
  return (
    <li className={clsx(styles['check-row'], targetUrl && styles['check-row-has-target'])}>
      <div className={styles['check-row-prepending-content']}>
        {state === 'IN_PROGRESS' ? (
          <CheckSpinner />
        ) : (
          <StatusIcon icon={statusState.icon} iconColor={statusState.iconColor} />
        )}
        {avatarUrl && <GitHubAvatar alt={displayName} size={20} square src={avatarUrl} className="flex-shrink-0" />}
      </div>
      <div className={styles['check-row-main-content']}>
        <div className={styles['check-row-left-content']}>
          {targetUrl ? (
            <a href={targetUrl} className={styles['check-row-link']}>
              {displayName}
            </a>
          ) : (
            <span className={styles['check-row-link']}>{displayName}</span>
          )}
          {description}
        </div>
        <div className="d-flex flex-items-center gap-1">
          {isRequired && (
            <div className="flex-shrink-0">
              <Label>Required</Label>
            </div>
          )}
          <div className={styles['control-small']}>
            {targetUrl && (
              <>
                <a
                  className={styles.button}
                  href={targetUrl}
                  tabIndex={-1} // Setting negative tabIndex as it's a repeated link, the whole row is focusable
                >
                  Go to Checks detail
                </a>
                <ArrowRightIcon />
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  )
})
