import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import type {GenerateInvoiceRequest} from '../types/invoices'

export const generateInvoiceRequest = async (
  slug: string,
  payload: GenerateInvoiceRequest,
): Promise<Record<string, never>> => {
  const url = `/stafftools/enterprises/${slug}/billing/invoices`

  const response = await verifiedFetchJSON(url, {method: 'POST', body: payload})
  const data = await response.json()

  return {...data, statusCode: response.status}
}

export const getInvoicesRequest = async (enterpriseSlug: string, customerId: string) => {
  const url = `/stafftools/enterprises/${enterpriseSlug}/billing/invoices?customer_id=${customerId}`
  const response = await verifiedFetchJSON(url, {method: 'GET'})
  const data = await response.json()
  return {...data, statusCode: response.status}
}
