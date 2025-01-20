import {render, screen} from '@testing-library/react'
import {imageUploadTypeOptions, imageUploadValuesDefault} from '../../../../types/image-upload'
import {ImageUploadValuesSelector} from '../ImageUploadValuesSelector'

describe('ImageUploadValuesSelector', () => {
  const mockOnChange = jest.fn()
  const mockOnValidationErrorChange = jest.fn()

  const defaultProps = {
    value: imageUploadValuesDefault,
    onChange: mockOnChange,
    validationError: false,
    onValidationErrorChange: mockOnValidationErrorChange,
  } as const satisfies React.ComponentProps<typeof ImageUploadValuesSelector>

  describe('Image type select', () => {
    test('renders correctly for defaults', () => {
      render(<ImageUploadValuesSelector {...defaultProps} />)
      const selectEl = screen.getByTestId('image-upload-image-type-select')
      expect(selectEl).toBeInTheDocument()
      expect(selectEl).toHaveValue(imageUploadTypeOptions[0].id)
    })

    test('renders all upload type options', () => {
      render(<ImageUploadValuesSelector {...defaultProps} />)
      for (const typeOption of imageUploadTypeOptions) {
        expect(screen.getByText(typeOption.displayName)).toBeInTheDocument()
      }
    })

    test('renders provided type as selected', () => {
      const windowsImageType = imageUploadTypeOptions[1]
      const props = {
        ...defaultProps,
        value: {
          ...imageUploadValuesDefault,
          imageType: windowsImageType,
        },
      } as const satisfies React.ComponentProps<typeof ImageUploadValuesSelector>

      render(<ImageUploadValuesSelector {...props} />)

      const selectEl = screen.getByTestId('image-upload-image-type-select')
      expect(selectEl).toHaveValue(windowsImageType.id)
    })
  })

  describe('SAS URI input', () => {
    test('renders correctly for defaults', () => {
      render(<ImageUploadValuesSelector {...defaultProps} />)
      expect(screen.getByTestId('image-upload-uri-input')).toBeInTheDocument()
    })

    test('renders SAS URI string when provided', () => {
      const sasUri = 'https://example.com'
      const props = {
        ...defaultProps,
        value: {
          ...imageUploadValuesDefault,
          sasUri,
        },
      } as const satisfies React.ComponentProps<typeof ImageUploadValuesSelector>

      render(<ImageUploadValuesSelector {...props} />)

      const inputEl = screen.getByTestId('image-upload-uri-input')
      expect(inputEl).toHaveValue(sasUri)
    })

    test('shows error when validationError is true', () => {
      const props = {...defaultProps, validationError: true}
      render(<ImageUploadValuesSelector {...props} />)
      expect(screen.getByText('Azure SAS URI may not be empty.')).toBeInTheDocument()
    })

    test('shows no error when validationError is false', () => {
      const props = {...defaultProps, validationError: false}
      render(<ImageUploadValuesSelector {...props} />)
      expect(screen.queryByText('Azure SAS URI may not be empty.')).not.toBeInTheDocument()
    })
  })
})
