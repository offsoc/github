import {Box, FormControl, Heading, Radio, RadioGroup, Select, Spinner, Text} from '@primer/react'
import {Suspense, type ChangeEvent, useEffect} from 'react'
import {useQueryLoader} from 'react-relay'

import {OrganizationPicker, OrganizationPickerRecentQuery} from '../../pickers/OrganizationPicker'
import {RepositoryPicker, RepositoryPickerRecentQuery} from '../../pickers/RepositoryPicker'
import {SkuPicker} from '../../pickers/SkuPicker'

import {CustomerType, DiscountTarget} from '../../../enums'

import type {Customer} from '../../../types/common'
import type {Product} from '../../../types/products'

import type {OrganizationPickerRecentQuery as OrganizationPickerQueryType} from '../../pickers/__generated__/OrganizationPickerRecentQuery.graphql'
import type {RepositoryPickerRecentQuery as RepositoryPickerQueryType} from '../../pickers/__generated__/RepositoryPickerRecentQuery.graphql'

export interface DiscountTargetSelectorProps {
  customer: Customer
  discountTarget: DiscountTarget
  discountTargetIds: string[]
  discountTargetIdsValid: boolean
  discountTargetValid: boolean
  enabledProducts: Product[]
  setDiscountTarget: (discountTarget: DiscountTarget) => void
  setDiscountTargetIds: (discountTargetIds: string[]) => void
}

export function DiscountTargetSelector({
  customer,
  discountTarget,
  discountTargetIds,
  discountTargetIdsValid,
  discountTargetValid,
  enabledProducts,
  setDiscountTarget,
  setDiscountTargetIds,
}: DiscountTargetSelectorProps) {
  const [organizationsRef, loadOrganizations, disposeOrganizationsRef] =
    useQueryLoader<OrganizationPickerQueryType>(OrganizationPickerRecentQuery)
  const [repositoriesRef, loadRepositories, disposeRepositoriesRef] =
    useQueryLoader<RepositoryPickerQueryType>(RepositoryPickerRecentQuery)

  useEffect(() => {
    loadOrganizations({slug: customer.displayId}, {fetchPolicy: 'store-or-network'})
    loadRepositories({slug: customer.displayId}, {fetchPolicy: 'store-or-network'})

    return () => {
      disposeOrganizationsRef()
      disposeRepositoriesRef()
    }
  }, [
    discountTargetIds,
    discountTarget,
    loadOrganizations,
    disposeOrganizationsRef,
    customer.displayId,
    loadRepositories,
    disposeRepositoriesRef,
  ])

  const onChangeDiscountTarget = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target.value as DiscountTarget
    setDiscountTarget(target)
  }

  return (
    <Box sx={{mb: 3}}>
      <Box sx={{mb: 2}}>
        <Heading as="h3" sx={{fontSize: 2}} className="Box-title">
          Discount scope
        </Heading>
        <span>Specify the scope of spending for this discount.</span>
        {discountTargetValid === false && <Text sx={{color: 'fg.danger'}}>Discount scope is not valid</Text>}
      </Box>
      <RadioGroup aria-labelledby="budget-scope-choices" name="budget-scope-choices" sx={{mt: 2, mb: 4}}>
        <div className="Box">
          {customer.customerType === CustomerType.Business && (
            <>
              <div className="Box-row">
                <FormControl>
                  <Radio
                    checked={discountTarget === DiscountTarget.Enterprise}
                    value={DiscountTarget.Enterprise.toString()}
                    onChange={onChangeDiscountTarget}
                  />
                  <FormControl.Label>Enterprise</FormControl.Label>
                  <FormControl.Caption>
                    Spending for all organizations and repositories in this enterprise.
                  </FormControl.Caption>
                </FormControl>
              </div>

              <div className="Box-row">
                <FormControl>
                  <Radio
                    checked={discountTarget === DiscountTarget.Organization}
                    value={DiscountTarget.Organization.toString()}
                    onChange={onChangeDiscountTarget}
                  />
                  <FormControl.Label>Organization</FormControl.Label>
                  <FormControl.Caption>Spending for a single organization.</FormControl.Caption>
                </FormControl>
                {discountTarget === DiscountTarget.Organization && (
                  <Suspense fallback={<Spinner size="small" />}>
                    {organizationsRef && (
                      <OrganizationPicker
                        initialSelectedItemIds={[]}
                        preloadedOrganizationsRef={organizationsRef}
                        selectionVariant="single"
                        setSelectedItems={setDiscountTargetIds}
                        slug={customer.displayId}
                        valid={discountTargetIdsValid}
                      />
                    )}
                  </Suspense>
                )}
              </div>
            </>
          )}

          {[CustomerType.Business, CustomerType.Organization].includes(customer.customerType) && (
            <div className="Box-row">
              <FormControl>
                <Radio
                  checked={discountTarget === DiscountTarget.Repository}
                  value={DiscountTarget.Repository.toString()}
                  onChange={onChangeDiscountTarget}
                />
                <FormControl.Label>Repository</FormControl.Label>
                <FormControl.Caption>Spending for a single repository.</FormControl.Caption>
              </FormControl>
              {discountTarget === DiscountTarget.Repository && (
                <Suspense fallback={<Spinner size="small" />}>
                  {repositoriesRef && (
                    <RepositoryPicker
                      initialSelectedItemIds={[]}
                      preloadedRepositoriesRef={repositoriesRef}
                      selectionVariant="single"
                      setSelectedItems={setDiscountTargetIds}
                      slug={customer.displayId}
                      valid={discountTargetIdsValid}
                    />
                  )}
                </Suspense>
              )}
            </div>
          )}

          <div className="Box-row">
            <FormControl>
              <Radio
                checked={discountTarget === DiscountTarget.Product}
                value={DiscountTarget.Product.toString()}
                onChange={onChangeDiscountTarget}
              />
              <FormControl.Label>Product</FormControl.Label>
              <FormControl.Caption>Spending for a single product.</FormControl.Caption>
            </FormControl>
            {discountTarget === DiscountTarget.Product && (
              <FormControl sx={{ml: 4, mt: 1}}>
                <FormControl.Label visuallyHidden>Select product</FormControl.Label>
                <Select onChange={event => setDiscountTargetIds([event.target.value])}>
                  <Select.Option value="">Select product</Select.Option>
                  {enabledProducts.map(product => (
                    <Select.Option key={product.name} value={product.name}>
                      {product.friendlyProductName}
                    </Select.Option>
                  ))}
                </Select>
                {!discountTargetIdsValid && (
                  <FormControl.Validation variant="error" sx={{mt: 1}}>
                    Please select at least one product
                  </FormControl.Validation>
                )}
              </FormControl>
            )}
          </div>

          <div className="Box-row">
            <FormControl>
              <Radio
                checked={discountTarget === DiscountTarget.SKU}
                value={DiscountTarget.SKU.toString()}
                onChange={onChangeDiscountTarget}
              />
              <FormControl.Label>SKU</FormControl.Label>
              <FormControl.Caption>Spending for a single SKU.</FormControl.Caption>
            </FormControl>
            {discountTarget === DiscountTarget.SKU && (
              <SkuPicker
                setSelectedItems={setDiscountTargetIds}
                selectionVariant="single"
                valid={discountTargetIdsValid}
              />
            )}
          </div>
        </div>
      </RadioGroup>
    </Box>
  )
}
