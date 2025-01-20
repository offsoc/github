import type {LicenseHolder} from './types'
import {useCallback, useEffect, useState} from 'react'
import {Octicon, Link} from '@primer/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {Dialog} from '@primer/react/experimental'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {AlertFillIcon} from '@primer/octicons-react'
import {useCustomerId} from './CustomerIdContext'

export interface LicensifyLicenseDetailsProps {
  licenseHolder: LicenseHolder
  onClose: () => void
}

enum LoadingState {
  Loading,
  Loaded,
  Error,
}

export function LicenseDetails({licenseHolder, onClose}: LicensifyLicenseDetailsProps) {
  const customerId = useCustomerId()
  const {type, id} = licenseHolder

  const [state, setState] = useState<LoadingState>(LoadingState.Loading)
  const [licenseDetails, setLicenseDetails] = useState([])

  const fetchLicenseDetails = useCallback(async () => {
    setState(LoadingState.Loading)
    const response = await verifiedFetchJSON(`/stafftools/customers/${customerId}/licensify_licenses/${type}/${id}`)

    if (response.ok) {
      const data = await response.json()
      setState(LoadingState.Loaded)
      setLicenseDetails(data || [])
    } else {
      setState(LoadingState.Error)
    }
  }, [customerId, id, type])

  useEffect(() => {
    fetchLicenseDetails()
  }, [fetchLicenseDetails])

  const dialogbody = useCallback(() => {
    if (state === LoadingState.Loading) {
      return <LoadingSkeleton />
    } else if (state === LoadingState.Error) {
      return (
        <div>
          <Octicon className="blankslate-icon" icon={AlertFillIcon} sx={{color: 'attention.fg'}} />
          <span>There was an error loading license details </span>
          <Link onClick={fetchLicenseDetails}>Try again</Link>
        </div>
      )
    } else {
      return <pre>{JSON.stringify(licenseDetails, null, 2)}</pre>
    }
  }, [fetchLicenseDetails, licenseDetails, state])

  return (
    <Dialog onClose={onClose} title={`License details for ${licenseHolder.display_name}`}>
      {dialogbody()}
    </Dialog>
  )
}
