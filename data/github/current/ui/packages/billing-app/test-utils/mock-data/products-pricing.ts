import {Products} from '../../constants'
import type {PricingDetails} from '../../types/pricings'

import type {EnabledProduct} from '../../types/products'

export const MOCK_PRODUCT_ACTIONS = {
  name: Products.actions,
  friendlyProductName: 'Actions',
  zuoraUsageIdentifier: 'fake-identifier-actions',
}

export const MOCK_PRODUCT_COPILOT = {
  name: Products.copilot,
  friendlyProductName: 'Copilot',
  zuoraUsageIdentifier: 'fake-identifier-copilot',
}

export const MOCK_PRODUCT_LFS = {
  name: Products.git_lfs,
  friendlyProductName: 'Git LFS',
  zuoraUsageIdentifier: 'fake-usage-identifier',
}

// export const MOCK_PRODUCT_SHARED_STORAGE = {
//   name: Products.shared_storage,
//   friendlyProductName: 'LFS',
//   zuoraUsageIdentifier: 'fake-usage-identifier',
// }

export const MOCK_PRODUCTS: EnabledProduct[] = [MOCK_PRODUCT_ACTIONS, MOCK_PRODUCT_COPILOT, MOCK_PRODUCT_LFS]

export const initialPricingData: PricingDetails = {
  sku: 'linux_4_core',
  friendlyName: 'Ubuntu 4 Core',
  price: 33,
  meterType: 'Default',
  product: 'actions',
  azureMeterId: 'fake-azure-meter-id',
  freeForPublicRepos: true,
  unitType: 'Minutes',
  effectiveAt: 1689366600,
}
