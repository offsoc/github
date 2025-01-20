import {Button, Flash, IconButton, Octicon, Spinner} from '@primer/react'
import {CheckIcon, InfoIcon, XIcon} from '@primer/octicons-react'
import {ExportJobState} from '../types/export-job-state'
import {clsx} from 'clsx'
import styles from './ExportStatusBanner.module.css'

interface ExportStatusBannerProps {
  exportJobState: ExportJobState
  onDismissClick: () => void
  emailNotificationMessage?: string
  showDownloadButtonOnReady?: boolean
  onDownloadButtonClick?: () => void
}
export function ExportStatusBanner({
  exportJobState,
  onDismissClick,
  emailNotificationMessage,
  showDownloadButtonOnReady,
  onDownloadButtonClick,
}: ExportStatusBannerProps) {
  return (
    <Flash full variant={exportJobState === ExportJobState.Error ? 'danger' : 'default'}>
      <div className="d-flex flex-row flex-items-center">
        <div className="flex-1" data-testid="export-status-text-long">
          <span>
            <InfoIcon />
          </span>
          {exportJobState === ExportJobState.Pending &&
            (emailNotificationMessage || 'The CSV report is being generated.')}
          {exportJobState === ExportJobState.Error && 'The CSV report could not be generated. Please try again later.'}
          {exportJobState === ExportJobState.Ready && 'CSV report generation complete.'}
        </div>
        <div className="d-flex flex-row flex-items-center gap-1" data-testid="export-status-text-short">
          {exportJobState === ExportJobState.Pending && (
            <Spinner size="small" data-testid="export-status-pending-spinner" />
          )}
          {exportJobState === ExportJobState.Ready && !showDownloadButtonOnReady && (
            <Octicon icon={CheckIcon} size="small" className="fgColor-success" />
          )}
          {exportJobState === ExportJobState.Error && <Octicon icon={XIcon} size="small" className="fgColor-danger" />}
          <div className="mr-1 color-fg-muted">
            {exportJobState === ExportJobState.Pending && 'Generating CSV'}
            {exportJobState === ExportJobState.Ready &&
              (showDownloadButtonOnReady ? (
                <Button onClick={onDownloadButtonClick}>Download CSV</Button>
              ) : (
                'Downloaded CSV'
              ))}
            {exportJobState === ExportJobState.Error && 'Download failed'}
          </div>
          <div className="text-center">
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={XIcon}
              className={clsx(styles.flashDismissButton)}
              size="medium"
              variant="invisible"
              aria-label={exportJobState === ExportJobState.Pending ? 'Cancel export' : 'Close export'}
              data-testid="ghe-button-dismiss-export"
              onClick={onDismissClick}
            />
          </div>
        </div>
      </div>
    </Flash>
  )
}
