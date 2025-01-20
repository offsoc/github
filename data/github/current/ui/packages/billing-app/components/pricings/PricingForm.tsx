// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useNavigate} from '@github-ui/use-navigate'
import {CheckCircleIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, FormControl, Heading, Select, TextInput} from '@primer/react'
import {useRef, useState} from 'react'

import {ERRORS, UNIT_TYPE, URLS} from '../../constants'
import {createSkuPricingRequest, updateSkuPricingRequest} from '../../services/sku_pricing'

import type {UpsertPricingRequestPayload, PricingDetails, MeterType, UnitType} from '../../types/pricings'

interface PricingFormProps {
  productId: string
  action: 'create' | 'edit'
  initialValues?: PricingDetails
}

export const PricingForm = ({productId, action, initialValues}: PricingFormProps) => {
  const [sku, setSku] = useState(initialValues?.sku || '')
  const [friendlyName, setFriendlyName] = useState(initialValues?.friendlyName || '')
  const [price, setPrice] = useState(initialValues?.price || 0)
  const [meterType, setMeterType] = useState<MeterType>(initialValues?.meterType || 'Default')
  const [unitType, setUnitType] = useState<UnitType>(initialValues?.unitType || 'Minutes')
  const [freeForPublicRepos, setFreeForPublicRepos] = useState<boolean>(initialValues?.freeForPublicRepos || false)
  const [effectiveAt, setEffectiveAt] = useState(initialValues?.effectiveAt || 25340221440)
  const [azureMeterId, setAzureMeterId] = useState(initialValues?.azureMeterId || '')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [effectiveAtError, setEffectiveAtError] = useState('')
  const returnFocusRef = useRef(null)
  const {addToast} = useToastContext()
  const navigate = useNavigate()
  const requiredFields = [sku, friendlyName, price, meterType, unitType, azureMeterId, effectiveAt]
  const headerText = action === 'create' ? 'Create a new SKU pricing' : 'Edit SKU pricing'
  const buttonText = action === 'create' ? 'Save SKU pricing' : 'Edit SKU pricing'
  const dialogText = action === 'create' ? 'This will create a new SKU pricing.' : 'This will update this SKU pricing.'

  const convertTimestampToDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    const d = new Date(year, month - 1, day)
    if (d && d.getMonth() + 1 === month) {
      return date.toLocaleString()
    } else {
      return 'Invalid date'
    }
  }

  const validateEffectiveAt = (value: number) => {
    if (convertTimestampToDate(value) === 'Invalid date') {
      setEffectiveAtError('Please enter a valid epoch timestamp.')
      return false
    } else {
      setEffectiveAtError('')
      return true
    }
  }

  const handleError = (error: string) => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({
      type: 'error',
      message: error,
      role: 'alert',
    })
  }

  const handleClick = () => {
    if (requiredFields.some(field => !field)) {
      handleError(ERRORS.REQUIRED_FIELD_ERROR)
    } else {
      setIsDialogOpen(true)
    }
  }

  const handleConfirmCreate = async () => {
    setIsDialogOpen(false)
    try {
      const requestPayload: UpsertPricingRequestPayload = {
        sku,
        friendlyName,
        price,
        meterType,
        unitType,
        freeForPublicRepos,
        azureMeterId,
        product: productId,
        effectiveAt,
      }
      const {error} = await createSkuPricingRequest(requestPayload)
      if (error) {
        handleError(error)
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'SKU pricing created!',
          icon: <CheckCircleIcon />,
          role: 'status',
        })
        localStorage.setItem('updatedSKUs', 'true')
        navigate(`${URLS.STAFFTOOLS_PRODUCTS}/${productId}`)
      }
    } catch {
      handleError(ERRORS.CREATE_SKU_PRICING_ERROR)
    }
  }

  const handleConfirmUpdate = async () => {
    setIsDialogOpen(false)
    try {
      const requestPayload: UpsertPricingRequestPayload = {
        sku,
        friendlyName,
        price,
        meterType,
        unitType,
        freeForPublicRepos,
        azureMeterId,
        product: productId,
        effectiveAt,
      }
      const {error} = await updateSkuPricingRequest(requestPayload)
      if (error) {
        handleError(error)
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'SKU pricing updated!',
          icon: <CheckCircleIcon />,
          role: 'status',
        })
        localStorage.setItem('updatedSKUs', 'true')
        navigate(`${URLS.STAFFTOOLS_PRODUCTS}/${productId}`)
      }
    } catch {
      handleError(ERRORS.UPDATE_SKU_PRICING_ERROR)
    }
  }

  return (
    <>
      <Box sx={{borderWidth: 1, borderStyle: 'solid', borderColor: 'border.default', borderRadius: 2}}>
        <Box sx={{bg: 'canvas.subtle', p: 3, mb: 2, borderRadius: 1}}>
          <Heading as="h2" sx={{fontSize: 2}}>
            {headerText}
          </Heading>
        </Box>
        <Box sx={{p: 2, m: 2}}>
          <FormControl sx={{my: 3}} disabled={action === 'edit'}>
            <FormControl.Label>SKU Name</FormControl.Label>
            <TextInput aria-label="SKU Name" name="skuName" value={sku} onChange={e => setSku(e.target.value)} />
          </FormControl>

          <FormControl sx={{my: 3}}>
            <FormControl.Label>Friendly SKU pricing name</FormControl.Label>
            <TextInput
              aria-label="Friendly SKU name"
              name="friendlySkuName"
              value={friendlyName}
              onChange={e => setFriendlyName(e.target.value)}
            />
          </FormControl>

          <FormControl disabled sx={{my: 3}}>
            <FormControl.Label>Product</FormControl.Label>
            <TextInput aria-label="Product" name="product" value={productId} />
          </FormControl>

          <FormControl sx={{my: 3}}>
            <FormControl.Label>Free for public repos</FormControl.Label>
            <Select
              defaultValue={freeForPublicRepos.toString()}
              onChange={e => setFreeForPublicRepos(Boolean(e.target.value))}
            >
              <Select.Option value="true">Yes</Select.Option>
              <Select.Option value="false">No</Select.Option>
            </Select>
          </FormControl>

          <FormControl sx={{my: 3}}>
            <FormControl.Label>Price</FormControl.Label>
            <TextInput
              leadingVisual="$"
              aria-label="Price"
              name="price"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
            />
          </FormControl>

          <FormControl sx={{my: 3}}>
            <FormControl.Label>Unit type</FormControl.Label>
            <Select defaultValue={unitType} onChange={e => setUnitType(e.target.value as UnitType)}>
              {UNIT_TYPE.map(unit => (
                <Select.Option key={unit} value={unit}>
                  {unit}
                </Select.Option>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{my: 3}}>
            <FormControl.Label>Meter type</FormControl.Label>
            <Select defaultValue={meterType} onChange={e => setMeterType(e.target.value as MeterType)}>
              <Select.Option value="Default">Default</Select.Option>
              <Select.Option value="PerHourUnitCharge">Per hour unit charge</Select.Option>
            </Select>
          </FormControl>

          <FormControl sx={{my: 3}}>
            <FormControl.Label>Effective at</FormControl.Label>
            <TextInput
              aria-label="Effective At"
              name="EffectiveAt"
              value={effectiveAt}
              onChange={e => {
                const isValid = validateEffectiveAt(Number(e.target.value))
                if (isValid) {
                  setEffectiveAt(Number(e.target.value))
                }
              }}
              placeholder="Enter an epoch timestamp"
            />
            {effectiveAtError && <div style={{color: 'red'}}>{effectiveAtError}</div>}
            <FormControl.Caption>{convertTimestampToDate(effectiveAt)}</FormControl.Caption>
          </FormControl>

          <FormControl sx={{my: 3}}>
            <FormControl.Label>Azure meter ID</FormControl.Label>
            <TextInput
              aria-label="Azure Meter ID"
              name="azureMeterId"
              value={azureMeterId}
              onChange={e => setAzureMeterId(e.target.value)}
            />
          </FormControl>

          <Button ref={returnFocusRef} onClick={handleClick} sx={{my: 2}}>
            {buttonText}
          </Button>
        </Box>
      </Box>
      <Dialog returnFocusRef={returnFocusRef} isOpen={isDialogOpen} onDismiss={() => setIsDialogOpen(false)}>
        <Dialog.Header>Are you sure?</Dialog.Header>
        <Box sx={{p: 3}}>
          <span>{`${dialogText} Are you sure you want to continue?`}</span>
          <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
            <Button
              onClick={action === 'create' ? handleConfirmCreate : handleConfirmUpdate}
              sx={{mr: 1}}
              variant="primary"
            >
              Continue
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </Box>
        </Box>
      </Dialog>
    </>
  )
}
