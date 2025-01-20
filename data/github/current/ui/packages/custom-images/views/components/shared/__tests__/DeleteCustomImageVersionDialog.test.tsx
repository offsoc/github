import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {DeleteCustomImageVersionDialog} from '../DeleteCustomImageVersionDialog'
import {deleteImageVersion} from '../../../../services/custom-images'

jest.mock('../../../../services/custom-images', () => ({
  deleteImageVersion: jest.fn(),
}))

const mockDeleteImageVersion = deleteImageVersion as jest.Mock

describe('DeleteCustomImageVersionDialog', () => {
  const mockOnDismiss = jest.fn()
  const mockOnCancel = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly', () => {
    render(
      <DeleteCustomImageVersionDialog
        imageDefinitionId="1"
        version="1.0.1"
        entityLogin="test-org"
        isEnterprise={false}
        onCancel={mockOnCancel}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    )

    expect(screen.getByText('Delete custom image version')).toBeInTheDocument()
    expect(screen.getByText(/Deleting this custom image version will free up/i)).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Delete'})).toBeInTheDocument()
  })

  test('calls deleteImageVersion and handles success', async () => {
    mockDeleteImageVersion.mockResolvedValueOnce({success: true})

    render(
      <DeleteCustomImageVersionDialog
        imageDefinitionId="1"
        version="1.0.0"
        entityLogin="test-org"
        isEnterprise={false}
        onCancel={mockOnCancel}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    )

    fireEvent.click(screen.getByRole('button', {name: 'Delete'}))

    expect(mockDeleteImageVersion).toHaveBeenCalledWith('1', '1.0.0', 'test-org', false)

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled())
  })

  test('displays error message on failure', async () => {
    mockDeleteImageVersion.mockResolvedValueOnce({success: false, errorMessage: 'Error deleting image version'})

    render(
      <DeleteCustomImageVersionDialog
        imageDefinitionId="1"
        version="1.0.0"
        entityLogin="test-org"
        isEnterprise={false}
        onCancel={mockOnCancel}
        onDismiss={mockOnDismiss}
        onSuccess={mockOnSuccess}
      />,
    )

    fireEvent.click(screen.getByRole('button', {name: 'Delete'}))

    await waitFor(() =>
      expect(screen.getByTestId('server-error-banner')).toHaveTextContent('Error deleting image version'),
    )
  })
})
