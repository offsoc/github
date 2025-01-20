import {Box, Heading, FormControl, RadioGroup, Radio} from '@primer/react'

import type {Product} from '../../types/products'

interface Props {
  products: Product[]
  budgetProduct: string
  setBudgetProduct: React.Dispatch<React.SetStateAction<string>>
}

export function BudgetProductSelector({products, budgetProduct, setBudgetProduct}: Props) {
  return (
    <>
      <Box sx={{py: 2}}>
        <Heading as="h3" sx={{fontSize: 2}} className="Box-title">
          Product
        </Heading>
        <RadioGroup
          name="budget-product-choices"
          aria-labelledby="budget-product-choices"
          onChange={selection => selection && setBudgetProduct(selection)}
          sx={{mt: 2, mb: 4}}
        >
          <RadioGroup.Label sx={{fontSize: 1}}>Select the product to include in this budget.</RadioGroup.Label>
          <div className="Box">
            {products.map(product => (
              <div key={product.name} className="Box-row">
                <FormControl>
                  <Radio value={product.name} name="product" checked={budgetProduct === product.name} />
                  <FormControl.Label>{product.friendlyProductName}</FormControl.Label>
                </FormControl>
              </div>
            ))}
          </div>
        </RadioGroup>
      </Box>
    </>
  )
}
