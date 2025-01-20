import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Breadcrumbs} from '@primer/react'

import {ProductForm} from '../../components/products/ProductForm'

import {URLS} from '../../constants'

import type {Product} from '../../types/products'

export interface ProductEditPagePayload {
  product: Product
}

export const ProductEditPage = () => {
  const payload = useRoutePayload<ProductEditPagePayload>()
  const {product} = payload

  return (
    <>
      <Breadcrumbs sx={{mb: 3}}>
        <Breadcrumbs.Item href={URLS.STAFFTOOLS_PRODUCTS}>Products</Breadcrumbs.Item>
        <Breadcrumbs.Item selected>Update product</Breadcrumbs.Item>
      </Breadcrumbs>
      <ProductForm initialValues={product} action="edit" />
    </>
  )
}
