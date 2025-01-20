import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {DeleteCustomImageDialog} from '../DeleteCustomImageDialog'
import {deleteImageDefinition} from '../../../../services/custom-images'

jest.mock('../../../../services/custom-images', () => ({
  deleteImageDefinition: jest.fn(),
}))

const mockDeleteImageDefinition = deleteImageDefinition as jest.Mock

describe('DeleteCustomImageDialog', () => {
  const mockOnDismiss = jest.fn()
  const mockOnCancel = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly', () => {
    render(
      <DeleteCustomImageDialog
        imageDefinitionId="1"
        entityLogin="test-org"
        isEnterprise={false}
        onCancel={mockOnCancel}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    )

    expect(screen.getByText('Delete custom image')).toBeInTheDocument()
    expect(screen.getByText(/Deleting this custom image will free up/i)).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Delete'})).toBeInTheDocument()
  })

  test('calls deleteImageDefinition and handles success', async () => {
    mockDeleteImageDefinition.mockResolvedValueOnce({success: true})

    render(
      <DeleteCustomImageDialog
        imageDefinitionId="1"
        entityLogin="test-org"
        isEnterprise={false}
        onCancel={mockOnCancel}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    )

    fireEvent.click(screen.getByRole('button', {name: 'Delete'}))

    expect(mockDeleteImageDefinition).toHaveBeenCalledWith('1', 'test-org', false)

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled())
  })

  test('displays error message on failure', async () => {
    mockDeleteImageDefinition.mockResolvedValueOnce({success: false, errorMessage: 'Error deleting image'})

    render(
      <DeleteCustomImageDialog
        imageDefinitionId="1"
        entityLogin="test-org"
        isEnterprise={false}
        onCancel={mockOnCancel}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    )

    fireEvent.click(screen.getByRole('button', {name: 'Delete'}))

    await waitFor(() => expect(screen.getByTestId('server-error-banner')).toHaveTextContent('Error deleting image'))
  })
})
