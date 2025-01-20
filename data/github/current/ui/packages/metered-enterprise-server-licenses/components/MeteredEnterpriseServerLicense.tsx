import {Link} from '@primer/react'

import type {ServerLicense} from '../types/server-licenses'
import {pluralize} from '../utils/text'

export interface Props {
  meteredServerLicensesBaseUrl: string
  serverLicense: ServerLicense
  showDownloadLink?: boolean
}

export function MeteredEnterpriseServerLicense({
  serverLicense,
  showDownloadLink = false,
  meteredServerLicensesBaseUrl,
}: Props) {
  const expiresAt = new Date(Date.parse(serverLicense.expires_at))

  const downloadLink = `${meteredServerLicensesBaseUrl}/${serverLicense.reference_number}`

  return (
    <div className="Box-row d-flex flex-items-center color-fg-muted">
      <div className="Box-title flex-1 ml-1 pl-6">
        {serverLicense.reference_number}
        <div className="text-small text-normal">Valid until {expiresAt.toDateString()}</div>
      </div>
      <div className="flex-1 text-center">
        <b>{serverLicense.seats}</b> {pluralize(serverLicense.seats, 'seat', false)}
      </div>
      <div className="flex-1">
        <div className="d-flex flex-justify-end">
          {showDownloadLink && (
            <Link href={downloadLink} className="Link--inTextBlock" download>
              Download
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
