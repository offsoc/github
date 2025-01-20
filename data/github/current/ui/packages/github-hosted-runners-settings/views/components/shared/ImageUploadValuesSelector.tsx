import {Box, FormControl, Select, TextInput} from '@primer/react'
import {type ImageUploadValues, type ImageUploadType, imageUploadTypeOptions} from '../../../types/image-upload'
import type {FormEvent} from 'react'

interface Props {
  value: ImageUploadValues
  onChange: (value: ImageUploadValues) => void
  validationError: boolean
  onValidationErrorChange: (value: boolean) => void
}

export function ImageUploadValuesSelector({value, onChange, validationError, onValidationErrorChange}: Props) {
  const sasUriValidationId = 'sas-uri-validation'
  const selectedType: ImageUploadType = value.imageType

  function handleImageTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedImageType = imageUploadTypeOptions.find(option => option.id === e.target.value)
    if (!selectedImageType) return
    onChange({...value, imageType: selectedImageType})
  }

  function handleSasUriChange(e: FormEvent<HTMLInputElement>) {
    onChange({...value, sasUri: e.currentTarget.value})
    onValidationErrorChange(e.currentTarget.value.length === 0)
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, m: 3, mt: 0}}>
      <span>Using an Azure shared access signature (SAS) URI, you can provide the custom VHD for this runner.</span>
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}}>
        <FormControl>
          <FormControl.Label visuallyHidden={true}>Select platform for custom image upload</FormControl.Label>
          <Select
            onChange={handleImageTypeChange}
            sx={{width: '100px'}}
            value={selectedType.id}
            data-testid="image-upload-image-type-select"
          >
            {imageUploadTypeOptions.map(option => (
              <Select.Option key={option.id} value={option.id}>
                {option.displayName}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        <FormControl required sx={{width: '100%'}}>
          <FormControl.Label visuallyHidden={true}>Azure shared access signature URI</FormControl.Label>
          <TextInput
            aria-invalid={validationError}
            data-testid="image-upload-uri-input"
            placeholder="Azure shared access signature URI"
            sx={{width: '100%'}}
            value={value?.sasUri}
            onChange={handleSasUriChange}
          />
          {validationError && (
            <FormControl.Validation variant="error" id={sasUriValidationId}>
              Azure SAS URI may not be empty.
            </FormControl.Validation>
          )}
        </FormControl>
      </Box>
    </Box>
  )
}
