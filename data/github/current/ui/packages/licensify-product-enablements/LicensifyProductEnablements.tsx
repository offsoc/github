import {Flash} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'
import type {ProductEnablement} from './types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {EnablementTargetsTable} from './components/EnablementTargetsTable'

export interface LicensifyProductEnablementsProps {
  customerId: number
}

export function LicensifyProductEnablements({customerId}: LicensifyProductEnablementsProps) {
  const [enablements, setEnablements] = useState<ProductEnablement[]>([])
  const [flash, setFlash] = useState<string>('')
  const [flashVariant, setFlashVariant] = useState<'success' | 'danger'>('success')

  const fetchEnablements = useCallback(async () => {
    const params = new URLSearchParams({customer_id: customerId.toString()})
    const response = await verifiedFetchJSON(`/stafftools/product_enablements?${params.toString()}`)
    const data = await response.json()
    if (response.ok) {
      setEnablements(data.productEnablements || [])
    } else {
      setFlash('Failed to load product enablements')
      setFlashVariant('danger')
    }
  }, [customerId])

  useEffect(() => {
    fetchEnablements()
  }, [fetchEnablements])

  return (
    <div>
      <div className="d-flex flex-justify-between">
        <h3>Product enablements</h3>
      </div>
      {flash && <Flash variant={flashVariant}>{flash}</Flash>}
      <div className="Box-body">
        <EnablementTargetsTable enablements={enablements} editable={false} />
      </div>
    </div>
  )
}
