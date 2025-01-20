import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Breadcrumbs} from '@primer/react'

import {PricingForm} from '../../components/pricings/PricingForm'

import {URLS} from '../../constants'

import type {PricingDetails} from '../../types/pricings'

export interface PricingEditPagePayload {
  pricing: PricingDetails
}

export const PricingEditPage = () => {
  const payload = useRoutePayload<PricingEditPagePayload>()
  const {pricing} = payload

  return (
    <>
      <Breadcrumbs sx={{mb: 3}}>
        <Breadcrumbs.Item href={URLS.STAFFTOOLS_PRODUCTS}>Products</Breadcrumbs.Item>
        <Breadcrumbs.Item href={`${URLS.STAFFTOOLS_PRODUCTS}/${pricing.product}`} sx={{textTransform: 'capitalize'}}>
          {pricing.product}
        </Breadcrumbs.Item>
        <Breadcrumbs.Item selected>Edit</Breadcrumbs.Item>
      </Breadcrumbs>
      <PricingForm action="edit" productId={pricing.product} initialValues={pricing} />
    </>
  )
}
