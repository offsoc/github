import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useNavigate} from '@github-ui/use-navigate'
import {Box, Button, Heading, Link, Text} from '@primer/react'

import {URLS} from '../../constants'
import {pageHeadingStyle} from '../../utils'

import type {Product} from '../../types/products'

export interface ProductsPagePayload {
  products: Product[]
}

export const productTableStyle = {
  width: '100%',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'border.default',
  borderRadius: 2,
}

export const productRowStyle = {
  p: 3,
  fontSize: 16,
  borderBottomColor: 'border.default',
  borderBottomStyle: 'solid',
}

export function ProductsPage() {
  const payload = useRoutePayload<ProductsPagePayload>()
  const {products} = payload
  const navigate = useNavigate()

  const handleNewProduct = () => {
    navigate(URLS.STAFFTOOLS_NEW_PRODUCT)
  }

  const skuQueryURL = 'webevents+%7C+where+action+%3D%3D+"billing.sku_update"+or+action+%3D%3D+"billing.sku_create"'

  return (
    <div>
      <div className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          Products
        </Heading>
        <Button onClick={handleNewProduct}>New product</Button>
      </div>
      <div className="Box mb-4 rounded-2">
        <Box className="Box d-flex flex-row flex-items-center gap-2" sx={{p: 3, fontSize: 16}}>
          <div className="flex-1 d-flex gap-2">
            <Text sx={{fontWeight: 'semibold'}}>Product Audit Logs</Text>
          </div>
          <Link href={`/stafftools/audit_log?query=${skuQueryURL}`}>View SKU change related events</Link>
        </Box>
      </div>
      {products?.length > 0 && (
        <Box sx={productTableStyle} data-testid="products-table">
          {products?.map((product, index) => (
            <Box
              key={product.name}
              sx={{
                ...productRowStyle,
                borderBottomWidth: index === products.length - 1 ? 0 : 1,
              }}
            >
              <Link href={`/stafftools/billing/products/${product.name}`}>{product.friendlyProductName}</Link>
            </Box>
          ))}
        </Box>
      )}
    </div>
  )
}
