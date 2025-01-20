import {Box, Heading, Text} from '@primer/react'

import type {Product} from '../../types/products'

interface Props {
  budgetProduct: string
  enabledProducts: Product[]
}

export function BudgetSelectedProduct({budgetProduct, enabledProducts}: Props) {
  const product = enabledProducts.find(p => p.name === budgetProduct)

  return (
    <Box sx={{mb: 4}}>
      <Heading as="h3" sx={{fontSize: 2, mb: 2}} className="Box-title">
        Product
      </Heading>
      <div className="Box">
        <div className="Box-row">
          <Text sx={{fontWeight: 'bold'}}>{product?.friendlyProductName}</Text>
        </div>
      </div>
    </Box>
  )
}
