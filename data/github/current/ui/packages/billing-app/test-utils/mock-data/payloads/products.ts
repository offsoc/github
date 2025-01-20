import {MOCK_PRODUCTS} from '../products-pricing'
import type {ProductDetailsPagePayload, ProductsPagePayload} from '../../../routes/stafftools'

export const getProductsRoutePayload = (): ProductsPagePayload => {
  return {
    products: MOCK_PRODUCTS,
  }
}

export const getProductDetailsRoutePayload = (): ProductDetailsPagePayload => {
  return {
    product: {
      name: 'actions',
      friendlyProductName: 'Actions',
      zuoraUsageIdentifier: 'actions-zuora-usage-identifier',
      pricings: [
        {
          sku: 'linux_4_core',
          friendlyName: 'Linux 4 Core',
          product: 'actions',
          price: 20,
          meterType: 'Default',
          azureMeterId: 'some-azure-meter-id',
          freeForPublicRepos: true,
          effectiveDatePrices: [
            {startDate: '2022-01-01', endDate: '2023-01-01', price: 20},
            {startDate: '2021-01-01', endDate: '2022-01-01', price: 18},
          ],
          unitType: 'Minutes',
          effectiveAt: 1689366600,
        },
        {
          sku: 'windows_4_core',
          friendlyName: 'Windows 4 Core',
          product: 'actions',
          price: 20,
          meterType: 'Default',
          azureMeterId: 'some-azure-meter-id',
          freeForPublicRepos: false,
          effectiveDatePrices: [
            {startDate: '2022-01-01', endDate: '2023-01-01', price: 20},
            {startDate: '2021-01-01', endDate: '2022-01-01', price: 18},
          ],
          unitType: 'Minutes',
          effectiveAt: 1689366600,
        },
      ],
    },
  }
}

export const getProductDetailsWithoutPricingsRoutePayload = (): ProductDetailsPagePayload => {
  return {
    product: {
      name: 'actions',
      friendlyProductName: 'Actions',
      zuoraUsageIdentifier: 'actions-zuora-usage-identifier',
      pricings: undefined,
    },
  }
}
