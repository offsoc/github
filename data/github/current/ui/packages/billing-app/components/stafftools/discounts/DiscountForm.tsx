import {ssrSafeLocation} from '@github-ui/ssr-utils'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
// import {useNavigate} from '@github-ui/use-navigate'
import {Box, Button, FormControl, Heading, Select, Text, TextInput} from '@primer/react'
import {useState, type ChangeEvent, useEffect} from 'react'

import {HTTPMethod, doRequest} from '../../../hooks/use-request'
import useRoute from '../../../hooks/use-route'
import {CustomerType, DiscountTarget, DiscountType} from '../../../enums'
import {DISCOUNTS_ROUTE} from '../../../routes'
import {pageHeadingStyle} from '../../../utils'

import {DiscountTargetSelector} from './DiscountTargetSelector'

import type {Customer} from '../../../types/common'
import type {CreateDiscountRequest} from '../../../types/customer'
import type {Product} from '../../../types/products'

const inputWidth = '18ch'

export interface DiscountFormProps {
  customer: Customer
  enabledProducts: Product[]
}

export function DiscountForm({customer, enabledProducts}: DiscountFormProps) {
  let defaultTarget
  switch (customer.customerType) {
    case CustomerType.Business:
      defaultTarget = DiscountTarget.Enterprise
      break
    case CustomerType.Organization:
      defaultTarget = DiscountTarget.Organization
      break
    case CustomerType.User:
    default:
      defaultTarget = DiscountTarget.Product
  }

  const [discountTarget, setDiscountTarget] = useState<DiscountTarget>(defaultTarget)
  const [discountTargetIds, setDiscountTargetIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState<number>()
  const [endDate, setEndDate] = useState<number>()
  const [discountType, setDiscountType] = useState(DiscountType.NoDiscountType)
  const [discountAmount, setDiscountAmount] = useState<number>()

  const [discountTargetValid, setDiscountTargetValid] = useState<boolean>(true)
  const [discountTargetIdsValid, setDiscountTargetIdsValid] = useState<boolean>(true)
  const [startDateValid, setStartDateValid] = useState<boolean>(true)
  const [endDateValid, setEndDateValid] = useState<boolean>(true)
  const [discountTypeValid, setDiscountTypeValid] = useState<boolean>(true)
  const [discountAmountValid, setDiscountAmountValid] = useState<boolean>(true)

  // Wrapped so that we can prevent popping when switching targets while the target IDs are invalid
  const wrappedSetDiscountTarget = (newValue: DiscountTarget) => {
    setDiscountTargetIds([])
    setDiscountTargetIdsValid(true)
    setDiscountTarget(newValue)
  }

  const wrappedSetDiscountTargetIds = (newValue: string[]) => {
    setDiscountTargetIds(newValue)
    setDiscountTargetIdsValid(true)
  }

  const onChangeStartDate = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const newDate = new Date(value).getTime()
    let valid = true

    if (value && isNaN(newDate)) valid = false
    if (endDate) {
      // End date must come after start date
      if (newDate > endDate) valid = false
      else setEndDateValid(true)
    }

    setStartDateValid(valid)
    // Set the date as long as it is in-fact a date
    if (!isNaN(newDate)) setStartDate(newDate)
  }

  const onChangeEndDate = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const newDate = new Date(value).getTime()
    let valid = true

    if (value && isNaN(newDate)) valid = false
    // End date must come after start date
    if (startDate) {
      if (startDate > newDate) valid = false
      else setStartDateValid(true)
    }

    setEndDateValid(valid)
    // Set the date as long as it is in-fact a date
    if (!isNaN(newDate)) setEndDate(newDate)
  }

  const onChangeDiscountType = (event: ChangeEvent<HTMLSelectElement>) => {
    setDiscountTypeValid(true)
    setDiscountType(event.target.value as DiscountType)
  }
  // This effect allows us to validate discount amount after changing discount type
  useEffect(() => {
    validateDiscountAmount(discountAmount?.toString(), {allowBlank: true})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountType])

  const validateDiscountAmount = (rawValue: string | undefined, opts = {allowBlank: false}): boolean => {
    if (!opts.allowBlank && !rawValue) {
      setDiscountAmountValid(false)
      return false
    }
    if (rawValue) {
      const value = parseFloat(rawValue)
      // Discount amount must always be greater than 0
      // Percent discount may not exceed 100%
      if (isNaN(value) || (value > 100 && discountType === DiscountType.Percentage) || value <= 0) {
        setDiscountAmountValid(false)
        return false
      }
    }
    setDiscountAmountValid(true)
    return true
  }
  const onChangeDiscountAmount = (event: ChangeEvent<HTMLInputElement>) => {
    const valid = validateDiscountAmount(event.target.value, {allowBlank: true})
    if (valid) {
      const value = parseFloat(event.target.value)
      setDiscountAmount(value)
    }
  }

  const validateInputs = () => {
    // State changes are not immediate and therefore we have to separately track whether the inputs are valid
    let valid = true
    if (discountTarget === DiscountTarget.NoDiscountTarget) {
      valid = false
      setDiscountTargetValid(false)
    }
    if (discountTarget !== DiscountTarget.Enterprise && discountTargetIds.length === 0) {
      valid = false
      setDiscountTargetIdsValid(false)
    }
    if (!startDate) {
      valid = false
      setStartDateValid(false)
    }
    if (!endDate) {
      valid = false
      setEndDateValid(false)
    }
    if (discountType === DiscountType.NoDiscountType) {
      valid = false
      setDiscountTypeValid(false)
    } else if (!validateDiscountAmount(discountAmount?.toString())) {
      valid = false
      setDiscountAmountValid(false)
    }

    return valid
  }

  // const navigate = useNavigate()
  const {path: createDiscountPath} = useRoute(DISCOUNTS_ROUTE)
  const {addToast} = useToastContext()

  async function createDiscount() {
    const data: CreateDiscountRequest = {
      customerId: customer.customerId,
      endDate: endDate as number,
      percentage: discountType === DiscountType.Percentage ? (discountAmount as number) : 0,
      startDate: startDate as number,
      targets:
        discountTarget === DiscountTarget.Enterprise
          ? [{id: customer.customerId, type: discountTarget}]
          : discountTargetIds.map(id => ({id, type: discountTarget})),
      targetAmount: discountType === DiscountType.FixedAmount ? (discountAmount as number) : 0,
    }

    try {
      const {ok} = await doRequest<CreateDiscountRequest>(HTTPMethod.POST, createDiscountPath, data)

      if (!ok) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'There was an issue creating your discount',
          role: 'alert',
        })
      } else {
        // TODO: Replace with useNavigate once we figure out how to more gracefully handle splitting discounts#index
        window.location.href = ssrSafeLocation.pathname
      }
    } catch {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'There was an issue creating your discount',
        role: 'alert',
      })
    }
  }

  const onFormSubmit = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault()
    const valid = validateInputs()
    if (valid) {
      createDiscount()
    }
  }

  return (
    <>
      <header className="Subhead mt-3">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          Apply a new discount
        </Heading>
      </header>
      <Box sx={{maxWidth: '65ch'}}>
        <form onSubmit={onFormSubmit} autoComplete="off">
          <DiscountTargetSelector
            customer={customer}
            discountTarget={discountTarget}
            discountTargetIds={discountTargetIds}
            discountTargetIdsValid={discountTargetIdsValid}
            discountTargetValid={discountTargetValid}
            enabledProducts={enabledProducts}
            setDiscountTarget={wrappedSetDiscountTarget}
            setDiscountTargetIds={wrappedSetDiscountTargetIds}
          />

          <Box sx={{mb: 3}}>
            <Box sx={{mb: 2}}>
              <Heading as="h3" sx={{fontSize: 2}} className="Box-title">
                Date range
              </Heading>
              <span>Specify the date range over which the discount should be applied.</span>
            </Box>
            <div className="Box">
              <div className="Box-row d-flex">
                <FormControl sx={{mr: 2}}>
                  <FormControl.Label>Start date</FormControl.Label>
                  <TextInput type="date" sx={{width: inputWidth}} onChange={onChangeStartDate} />
                  {!startDateValid && (
                    <FormControl.Validation variant="error">Start date is not valid</FormControl.Validation>
                  )}
                </FormControl>
                <FormControl>
                  <FormControl.Label>End date</FormControl.Label>
                  <TextInput type="date" sx={{width: inputWidth}} onChange={onChangeEndDate} />
                  {!endDateValid && (
                    <FormControl.Validation variant="error">End date is not valid</FormControl.Validation>
                  )}
                </FormControl>
              </div>
            </div>
          </Box>

          <Box sx={{mb: 3}}>
            <Box sx={{mb: 2}}>
              <Heading as="h3" sx={{fontSize: 2}} className="Box-title">
                Discount
              </Heading>
              <span>Specify the type of discount and fixed amount or percentage to be applied.</span>
            </Box>
            <div className="Box">
              <div className="Box-row">
                <div className="d-flex">
                  <FormControl sx={{mr: 2}}>
                    <FormControl.Label>Discount type</FormControl.Label>
                    <Select onChange={onChangeDiscountType} sx={{width: inputWidth}}>
                      <Select.Option value={DiscountType.NoDiscountType}>Nothing selected</Select.Option>
                      <Select.Option value={DiscountType.FixedAmount}>Fixed amount</Select.Option>
                      <Select.Option value={DiscountType.Percentage}>Percentage</Select.Option>
                    </Select>
                    {!discountTypeValid && (
                      <FormControl.Validation variant="error">Discount type is not valid</FormControl.Validation>
                    )}
                  </FormControl>
                  {discountType !== DiscountType.NoDiscountType && (
                    <FormControl>
                      <FormControl.Label>Discount amount</FormControl.Label>
                      {discountType === DiscountType.FixedAmount && (
                        <TextInput leadingVisual="$" sx={{width: inputWidth}} onChange={onChangeDiscountAmount} />
                      )}
                      {discountType === DiscountType.Percentage && (
                        <TextInput trailingVisual="%" sx={{width: inputWidth}} onChange={onChangeDiscountAmount} />
                      )}
                      {!discountAmountValid && (
                        <FormControl.Validation variant="error">Discount amount is not valid</FormControl.Validation>
                      )}
                    </FormControl>
                  )}
                </div>
                {discountType === DiscountType.FixedAmount && (
                  <Text sx={{color: 'fg.muted', fontSize: '12px'}}>
                    Usage will be covered in full up to the specified amount.
                  </Text>
                )}
                {discountType === DiscountType.Percentage && (
                  <Text sx={{color: 'fg.muted', fontSize: '12px'}}>
                    Usage will be discounted by the specified percentage.
                  </Text>
                )}
              </div>
            </div>
          </Box>

          <Button type="submit" variant="primary">
            Create discount
          </Button>
        </form>
      </Box>
    </>
  )
}
