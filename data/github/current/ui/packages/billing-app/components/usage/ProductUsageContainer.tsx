import {useState} from 'react'
import {Box, UnderlineNav} from '@primer/react'

import {DefaultUsageContainer} from './DefaultUsageContainer'
import {SeatBasedUsageContainer} from './SeatBasedUsageContainer'

import {PRODUCT_TAB_ICON_MAP, PRODUCT_TAB_TEXT_MAP, Products, MeteredProducts, SeatBasedProducts} from '../../constants'

import type {Customer} from '../../types/common'
import type {EnabledProduct} from '../../types/products'
import type {Filters} from '../../types/usage'

interface Props {
  customer: Customer
  enabledProducts: EnabledProduct[]
  filters: Filters
  isOnlyOrgAdmin: boolean
}

export function ProductUsageContainer({customer, enabledProducts, filters, isOnlyOrgAdmin}: Props) {
  const sortedEnabledProducts = [...enabledProducts].sort((a, b) => a.name.localeCompare(b.name))
  const [selectedProduct, setSelectedProduct] = useState<Products>(sortedEnabledProducts[0]?.name || Products.actions)

  return (
    <>
      {sortedEnabledProducts.length > 0 && (
        <Box sx={{mb: 4}}>
          <UnderlineNav aria-label="Products selector" sx={{pl: 0, mb: 3}}>
            {sortedEnabledProducts.map((product: EnabledProduct) => (
              <UnderlineNav.Item
                aria-current={selectedProduct === product.name ? 'page' : undefined}
                onSelect={e => {
                  e.preventDefault()
                  setSelectedProduct(product.name)
                }}
                icon={PRODUCT_TAB_ICON_MAP[product.name]}
                sx={{textTransform: 'capitalize'}}
                key={`${product.name}-tab`}
                data-testid={`${product.name}-tab`}
              >
                {PRODUCT_TAB_TEXT_MAP[product.name]}
              </UnderlineNav.Item>
            ))}
          </UnderlineNav>
          <div>
            {sortedEnabledProducts.map((product: EnabledProduct) => (
              <Box
                aria-current={selectedProduct === product.name ? 'page' : undefined}
                sx={{display: selectedProduct === product.name ? 'block' : 'none'}}
                key={`${product.name}-tab-pane`}
                data-testid={`${product.name}-tab-pane`}
              >
                {product.name in MeteredProducts && (
                  <DefaultUsageContainer
                    customer={customer}
                    filters={{...filters, product: product.name}}
                    isOnlyOrgAdmin={isOnlyOrgAdmin}
                    product={product}
                  />
                )}
                {product.name in SeatBasedProducts && (
                  <SeatBasedUsageContainer
                    filters={{...filters, product: product.name}}
                    productName={PRODUCT_TAB_TEXT_MAP[product.name]}
                  />
                )}
              </Box>
            ))}
          </div>
        </Box>
      )}
    </>
  )
}
