export interface ProductEnablement {
  customerId: number
  product: Product
  enablementType: EnablementTargetType
  enablementId: number
  globalId: string
  enabledAt: string
}

export enum Product {
  GHAS = 'PRODUCT_GHAS',
}

export enum EnablementTargetType {
  ORG = 'PRODUCT_ENABLEMENT_TARGET_TYPE_ORG',
  REPO = 'PRODUCT_ENABLEMENT_TARGET_TYPE_REPO',
}
