import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useNavigate} from '@github-ui/use-navigate'
import {Box, Breadcrumbs, Button, Heading, Link, Pagination, TextInput} from '@primer/react'
import {Banner} from '@primer/react/experimental'

import {URLS} from '../../constants'
import {pageHeadingStyle} from '../../utils'

import {productRowStyle, productTableStyle} from './ProductsPage'

import type {ProductDetails} from '../../types/products'
import PricingDetailsDialog from './PricingDetailsDialog'
import {useCallback, useEffect, useState} from 'react'
import type {PricingList} from '../../types/pricings'

export interface ProductDetailsPagePayload {
  product: ProductDetails
}

export function ProductDetailsPage() {
  const payload = useRoutePayload<ProductDetailsPagePayload>()
  const {product} = payload
  const {pricings} = product
  const navigate = useNavigate()
  const sortedPricings = pricings?.sort((a, b) => {
    return a.friendlyName.localeCompare(b.friendlyName, 'en', {numeric: true, sensitivity: 'base'})
  })
  const [updatedSkus, setUpdatedSkus] = useState(false)

  const pageSize = 10
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(sortedPricings ? Math.ceil(sortedPricings.length / pageSize) : 1)
  const [currentProduct, setCurrentProduct] = useState<PricingList[] | undefined>(sortedPricings?.slice(0, pageSize))
  const [searchFilter, setSearchFilter] = useState<string>('')

  const onPageChange: Parameters<typeof Pagination>[0]['onPageChange'] = (e, page) => {
    if (sortedPricings && sortedPricings.length > 0) {
      if (searchFilter) {
        const filtered = sortedPricings
          ?.filter(pricing => pricing.friendlyName.toLowerCase().includes(searchFilter.toLocaleLowerCase()))
          .slice((page - 1) * pageSize, page * pageSize)
        setCurrentProduct(filtered)
      } else {
        setCurrentProduct(sortedPricings.slice((page - 1) * pageSize, page * pageSize))
      }
    }
    e.preventDefault()
    setPageNumber(page)
  }

  const filterSearchResults = useCallback(() => {
    const filtered = sortedPricings?.filter(pricing =>
      pricing.friendlyName.toLowerCase().includes(searchFilter.toLocaleLowerCase()),
    )
    setCurrentProduct(filtered?.slice(0, pageSize))
    setPageNumber(1)
    setPageCount(filtered ? Math.ceil(filtered.length / pageSize) : 1)
  }, [searchFilter, sortedPricings])

  useEffect(() => {
    const val = localStorage.getItem('updatedSKUs')
    setUpdatedSkus(val === 'true')
  }, [])

  return (
    <div>
      <Breadcrumbs>
        <Breadcrumbs.Item href="/stafftools/billing/products">Products</Breadcrumbs.Item>
        <Breadcrumbs.Item selected>{product?.friendlyProductName}</Breadcrumbs.Item>
      </Breadcrumbs>
      {updatedSkus && (
        <Box sx={{mb: 2, mt: 2}}>
          <Banner
            title="Warning"
            onDismiss={() => {
              setUpdatedSkus(false)
              localStorage.setItem('updatedSKUs', 'false')
            }}
            variant="warning"
            description={
              <>
                SKU edits are not replicated to all stamps. To replicate changes, follow{' '}
                <Link
                  inline
                  href="https://github.com/github/gitcoin/blob/main/docs/playbook/howto/replicate_sku_changes_to_stamps.md"
                >
                  this playbook
                </Link>
                .
              </>
            }
          />
        </Box>
      )}
      <Box className="Subhead" sx={{display: 'flex', alignItems: 'center'}}>
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          {product?.friendlyProductName}
        </Heading>
        <Button sx={{ml: 'auto'}} onClick={() => navigate(`${URLS.STAFFTOOLS_PRODUCTS}/${product.name}/edit`)}>
          Edit
        </Button>
      </Box>
      <Box sx={{...productTableStyle, marginBottom: '16px'}}>
        <Box sx={{p: 3, fontSize: 16}}>
          <span>Product ID: {product?.name}</span>
          <br />
          <span>Zuora usage identifier: {product?.zuoraUsageIdentifier}</span>
          <br />
          <span>SKU count: {pricings?.length || 0}</span>
        </Box>
      </Box>
      <div className="Subhead">
        <Heading as="h3" className="Subhead-heading" sx={pageHeadingStyle}>
          SKU pricings
        </Heading>
        <Button onClick={() => navigate(`${product.name}/pricings/new`)}>New SKU pricing</Button>
      </div>
      <div className="Subhead">
        <Heading as="h3" className="Subhead-heading" sx={pageHeadingStyle}>
          Search SKU
        </Heading>
        <TextInput
          sx={{width: '50%', mr: 2}}
          onChange={e => setSearchFilter(e.target.value)}
          data-testid="search-input"
          aria-label="Search SKU"
          name="search"
          placeholder="Find a SKU..."
          onKeyDown={e => {
            // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
            if (e.key === 'Enter') {
              filterSearchResults()
            }
          }}
        />
        <Button onClick={() => filterSearchResults()}>Search</Button>
      </div>

      {currentProduct && currentProduct?.length > 0 && (
        <Box sx={productTableStyle} data-testid="pricings-table">
          {currentProduct?.map((pricing, index) => (
            <Box
              key={pricing.friendlyName}
              sx={{
                ...productRowStyle,
                borderBottomWidth: index === currentProduct.length - 1 ? 0 : 1,
              }}
            >
              <PricingDetailsDialog pricingDetails={pricing} />
            </Box>
          ))}
          {sortedPricings && sortedPricings.length > pageSize && (
            <Pagination pageCount={pageCount} currentPage={pageNumber} onPageChange={onPageChange} />
          )}
        </Box>
      )}
    </div>
  )
}
