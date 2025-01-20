import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {URLS} from '../constants'
import type {UpsertPricingRequestPayload} from '../types/pricings'

export const createSkuPricingRequest = async (payload: UpsertPricingRequestPayload) => {
  const url = `${URLS.STAFFTOOLS_PRODUCTS}/${payload.product}/pricings`
  const response = await verifiedFetchJSON(url, {method: 'POST', body: payload})
  const data = await response.json()

  return {...data, statusCode: response.status}
}

export const updateSkuPricingRequest = async (payload: UpsertPricingRequestPayload) => {
  const url = `${URLS.STAFFTOOLS_PRODUCTS}/${payload.product}/pricings/${payload.sku}`
  const response = await verifiedFetchJSON(url, {method: 'PUT', body: payload})
  const data = await response.json()

  return {...data, statusCode: response.status}
}
