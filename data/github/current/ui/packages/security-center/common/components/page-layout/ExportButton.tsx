import {SecurityOverviewExportButton} from '@github-ui/security-overview-export-button'

type Props = {
  exportUrl?: string
  startedBannerId: string
  successBannerId: string
  errorBannerId: string
}

function ExportButton({exportUrl, startedBannerId, successBannerId, errorBannerId}: Props): JSX.Element | null {
  return (
    <>
      {exportUrl && (
        <SecurityOverviewExportButton
          createExportUrl={exportUrl}
          startedBannerId={startedBannerId}
          successBannerId={successBannerId}
          errorBannerId={errorBannerId}
          buttonSize="medium"
        />
      )}
    </>
  )
}

ExportButton.displayName = 'PageLayout.ExportButton'

export default ExportButton
