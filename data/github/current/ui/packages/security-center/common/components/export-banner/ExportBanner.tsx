import {CheckCircleIcon, MailIcon, XCircleIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import type {ReactElement} from 'react'

type ExportBannerProps = {
  id: string
  type: 'success' | 'danger' | 'accent'
  errorMessage?: string
}

export function ExportBanner({id, type, errorMessage}: ExportBannerProps): JSX.Element {
  let icon: ReactElement | null = null
  let description: string = ''

  if (type === 'success') {
    icon = <CheckCircleIcon className={`color-fg-${type}`} size={16} />
    description =
      'Your report is ready and the download has started. An email with the report has also been sent to you.'
  } else if (type === 'accent') {
    icon = <MailIcon className={`color-fg-${type}`} size={16} />
    description =
      "Your report is being generated. You will receive an email when it's ready. Stay on this page to automatically download the report."
  } else {
    icon = <XCircleIcon className={`color-fg-${type}`} size={16} />
    description =
      errorMessage ||
      "We couldn't download your report. Please try again later. If the problem persists, please contact support."
  }

  return (
    <Box
      hidden={errorMessage ? false : true}
      sx={{
        display: 'flex',
        gap: 3,
        marginBottom: 3,
        borderRadius: '2',
        backgroundColor: `var(--bgColor-${type}-muted, var(--color-${type}-subtle))`,
        borderWidth: 0.5,
        borderStyle: 'solid',
        borderColor: `${type}.emphasis`,
        padding: 3,
      }}
      id={id}
    >
      {icon}
      <p className="mb-0">{description}</p>
    </Box>
  )
}
