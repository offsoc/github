import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Breadcrumbs} from '@primer/react'

import {PricingForm} from '../../components/pricings/PricingForm'

import {URLS} from '../../constants'

export interface PricingNewPagePayload {
  productId: string
}

export const PricingNewPage = () => {
  const payload = useRoutePayload<PricingNewPagePayload>()

  return (
    <>
      <Breadcrumbs sx={{mb: 3}}>
        <Breadcrumbs.Item href={URLS.STAFFTOOLS_PRODUCTS}>Products</Breadcrumbs.Item>
        <Breadcrumbs.Item href={`${URLS.STAFFTOOLS_PRODUCTS}/${payload.productId}`} sx={{textTransform: 'capitalize'}}>
          {payload.productId}
        </Breadcrumbs.Item>
        <Breadcrumbs.Item selected>New SKU pricing</Breadcrumbs.Item>
      </Breadcrumbs>
      <PricingForm action="create" productId={payload.productId} />
    </>
  )
}
