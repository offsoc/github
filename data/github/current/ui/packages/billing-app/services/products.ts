import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {URLS} from '../constants'

import type {Product} from '../types/products'

export const createProductRequest = async (payload: Product) => {
  const response = await verifiedFetchJSON(URLS.STAFFTOOLS_PRODUCTS, {method: 'POST', body: payload})
  const data = await response.json()

  return {...data, statusCode: response.status}
}

export const editProductRequest = async (payload: Product) => {
  const response = await verifiedFetchJSON(`${URLS.STAFFTOOLS_PRODUCTS}/${payload.name}`, {
    method: 'PUT',
    body: payload,
  })
  const data = await response.json()

  return {...data, statusCode: response.status}
}
