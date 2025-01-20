import type {Products} from '../constants'
import type {PricingList} from './pricings'

// Products can be added via Stafftools but may not be implemented/supported by the front-end.
export interface Product {
  friendlyProductName: string
  name: string
  zuoraUsageIdentifier: string
}

// To prevent risky type casting of the name if a product is not yet supported by the front-end
// The list of supported products should be pulled from a single source, probably billing platform
export interface EnabledProduct extends Product {
  name: Products
}

export interface ProductDetails {
  name: string
  friendlyProductName: string
  zuoraUsageIdentifier: string
  pricings?: PricingList[]
}
