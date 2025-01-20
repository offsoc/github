import {Breadcrumbs} from '@primer/react'

import {ProductForm} from '../../components/products/ProductForm'

import {URLS} from '../../constants'

export const ProductNewPage = () => {
  return (
    <>
      <Breadcrumbs sx={{mb: 3}}>
        <Breadcrumbs.Item href={URLS.STAFFTOOLS_PRODUCTS}>Products</Breadcrumbs.Item>
        <Breadcrumbs.Item selected>New product</Breadcrumbs.Item>
      </Breadcrumbs>
      <ProductForm action="create" />
    </>
  )
}
