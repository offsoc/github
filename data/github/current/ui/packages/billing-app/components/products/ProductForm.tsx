// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useNavigate} from '@github-ui/use-navigate'
import {CheckCircleIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, FormControl, Heading, TextInput} from '@primer/react'
import {useRef, useState} from 'react'

import {ERRORS, URLS} from '../../constants'
import {createProductRequest, editProductRequest} from '../../services/products'

import type {Product} from '../../types/products'

interface FormValues {
  name?: string
  friendlyProductName?: string
  zuoraUsageIdentifier?: string
}

export interface ProductFormProps {
  action: 'create' | 'edit'
  initialValues?: FormValues
}

export const ProductForm = ({action, initialValues}: ProductFormProps) => {
  const [name, setName] = useState(initialValues?.name || '')
  const [friendlyProductName, setFriendlyProductName] = useState(initialValues?.friendlyProductName || '')
  const [zuoraUsageIdentifier, setZuoraUsageIdentifier] = useState(initialValues?.zuoraUsageIdentifier || '')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {addToast} = useToastContext()
  const navigate = useNavigate()
  const returnFocusRef = useRef(null)
  const headerText = action === 'create' ? 'Create a new product' : `Update ${initialValues?.friendlyProductName}`
  const successMessage = action === 'create' ? 'Product added!' : 'Product updated!'
  const dialogText = action === 'create' ? 'This will create a new product.' : 'This will update this product.'
  const requiredFields = [name, friendlyProductName, zuoraUsageIdentifier]

  const handleError = (error: string) => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({
      type: 'error',
      message: error,
      role: 'alert',
    })
  }

  const handleSuccess = (message: string) => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({
      type: 'success',
      message,
      icon: <CheckCircleIcon />,
      role: 'status',
    })
    navigate(URLS.STAFFTOOLS_PRODUCTS)
  }

  const handleClick = () => {
    if (requiredFields.some(field => !field)) {
      handleError(ERRORS.REQUIRED_FIELD_ERROR)
    } else {
      setIsDialogOpen(true)
    }
  }

  const handleCreateProduct = async () => {
    setIsDialogOpen(false)
    try {
      const requestPayload: Product = {name, friendlyProductName, zuoraUsageIdentifier}
      const {error} = await createProductRequest(requestPayload)
      if (error) {
        handleError(error)
      } else handleSuccess(successMessage)
    } catch {
      handleError(ERRORS.CREATE_PRODUCT_ERROR)
    }
  }

  const handleEditProduct = async () => {
    setIsDialogOpen(false)
    try {
      const requestPayload: Product = {name, friendlyProductName, zuoraUsageIdentifier}
      const {error} = await editProductRequest(requestPayload)
      if (error) {
        handleError(error)
      } else handleSuccess(successMessage)
    } catch {
      handleError(ERRORS.UPDATE_PRODUCT_ERROR)
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
          <FormControl sx={{my: 2}} disabled={action === 'edit'}>
            <FormControl.Label>Name</FormControl.Label>
            <TextInput aria-label="Name" name="name" value={name} onChange={e => setName(e.target.value)} />
          </FormControl>
          <FormControl sx={{my: 3}}>
            <FormControl.Label>Friendly product name</FormControl.Label>
            <TextInput
              aria-label="Friendly product name"
              name="friendlyProductName"
              value={friendlyProductName}
              onChange={e => setFriendlyProductName(e.target.value)}
            />
          </FormControl>
          <FormControl sx={{my: 3}}>
            <FormControl.Label>Zuora usage identifier</FormControl.Label>
            <TextInput
              aria-label="Zuora usage identifier"
              name="zuoraUsageIdentifier"
              value={zuoraUsageIdentifier}
              onChange={e => setZuoraUsageIdentifier(e.target.value)}
            />
          </FormControl>
          <Button onClick={handleClick} sx={{my: 2}}>
            {action === 'create' ? 'Create product' : 'Edit product'}
          </Button>
        </Box>
      </Box>
      <Dialog returnFocusRef={returnFocusRef} isOpen={isDialogOpen} onDismiss={() => setIsDialogOpen(false)}>
        <Dialog.Header>Are you sure?</Dialog.Header>
        <Box sx={{p: 3}}>
          <span>{`${dialogText} Are you sure you want to continue?`}</span>
          <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
            <Button
              onClick={action === 'create' ? handleCreateProduct : handleEditProduct}
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
