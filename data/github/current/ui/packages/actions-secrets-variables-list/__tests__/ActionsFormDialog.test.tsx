import {act, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {getFormDialogProps} from '../test-utils/mock-data'
import {FormDialog} from '../FormDialog'
import {ListMode, FormMode, type RowData} from '../types'
import {verifiedFetch} from '@github-ui/verified-fetch'

const mockVerifiedFetch = verifiedFetch as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetch: jest.fn(),
}))

jest.mock('../util', () => ({
  encryptString: jest.fn(() => 'fake_encrypted_string'),
}))

describe('Normal operation', () => {
  test('The form renders as expected for adding new secrets', async () => {
    const props = getFormDialogProps(ListMode.secret, 'A_SECRET', 'a_value', FormMode.add)

    // We need the keyID and publicKey for encryption
    render(<FormDialog {...props} />)

    expect(screen.getByTestId('form-dialog')).toBeVisible()
    expect(screen.queryByTestId('error-block')).not.toBeInTheDocument()
    const submitButton = await screen.findByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('YOUR_SECRET_NAME')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Secret value')).toBeInTheDocument()
    expect(screen.queryAllByText('Add secret')).toHaveLength(2)

    const secretName = screen.getByTestId('environment-secret-name-input')
    expect(secretName).toBeInTheDocument()
    expect(secretName).toHaveProperty('value', 'A_SECRET')

    const secretValue = screen.getByTestId('environment-secret-value')
    expect(secretValue).toBeInTheDocument()
    expect(screen.getByText('a_value')).toBeInTheDocument()
  })

  test('The form renders as expected for updating secrets', async () => {
    const props = getFormDialogProps(ListMode.secret, 'A_SECRET', 'a_value', FormMode.update)

    // We need the keyID and publicKey for encryption
    render(<FormDialog {...props} />)

    expect(screen.getByTestId('form-dialog')).toBeVisible()
    expect(screen.queryByTestId('error-block')).not.toBeInTheDocument()
    const submitButton = await screen.findByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('YOUR_SECRET_NAME')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Secret value')).toBeInTheDocument()
    expect(screen.queryAllByText('Update secret')).toHaveLength(2)

    const secretNameInput = screen.queryByTestId('environment-secret-name-input')
    expect(secretNameInput).not.toBeInTheDocument()

    const secretName = screen.getByTestId('environment-secret-name')
    expect(secretName).toBeInTheDocument()

    const secretValue = screen.getByTestId('environment-secret-value')
    expect(secretValue).toBeInTheDocument()
  })

  test('The form renders as expected for adding new variables', async () => {
    const props = getFormDialogProps(ListMode.variable, 'A_VARIABLE', 'a_value', FormMode.add)

    render(<FormDialog {...props} />)

    expect(screen.getByTestId('form-dialog')).toBeVisible()
    expect(screen.queryByTestId('error-block')).not.toBeInTheDocument()
    const submitButton = await screen.findByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('YOUR_VARIABLE_NAME')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Variable value')).toBeInTheDocument()
    expect(screen.queryAllByText('Add variable')).toHaveLength(2)

    const variableName = screen.getByTestId('environment-variable-name-input')
    expect(variableName).toBeInTheDocument()
    expect(variableName).toHaveProperty('value', 'A_VARIABLE')

    const variableValue = screen.getByTestId('environment-variable-value')
    expect(variableValue).toBeInTheDocument()
    expect(screen.getByText('a_value')).toBeInTheDocument()
  })

  test('The form renders as expected for updating variables', async () => {
    const props = getFormDialogProps(ListMode.variable, 'A_VARIABLE', 'a_value', FormMode.update)

    render(<FormDialog {...props} />)

    expect(screen.getByTestId('form-dialog')).toBeVisible()
    expect(screen.queryByTestId('error-block')).not.toBeInTheDocument()
    const submitButton = await screen.findByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('YOUR_VARIABLE_NAME')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Variable value')).toBeInTheDocument()
    expect(screen.queryAllByText('Update variable')).toHaveLength(2)

    const variableName = screen.getByTestId('environment-variable-name-input')
    expect(variableName).toBeInTheDocument()
    expect(variableName).toHaveProperty('value', 'A_VARIABLE')

    const variableValue = screen.getByTestId('environment-variable-value')
    expect(variableValue).toBeInTheDocument()
    expect(screen.getByText('a_value')).toBeInTheDocument()
  })

  test('handleSubmit behaves as expected for secrets golden path', async () => {
    const props = getFormDialogProps(ListMode.secret, 'A_SECRET', 'a_value', FormMode.add)
    mockVerifiedFetch.mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => {
        return {ok: true}
      },
    })

    // We need the keyID and publicKey for encryption
    render(<FormDialog {...props} />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    await act(() => {
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockVerifiedFetch).toHaveBeenCalled()
    })

    expect(screen.queryByTestId('form-dialog')).not.toBeVisible()
  })

  test('handleSubmit calls the updater function for secrets', async () => {
    const rows = new Array<RowData>()
    const props = getFormDialogProps(
      ListMode.secret,
      'A_SECRET',
      'a_value',
      FormMode.add,
      '1990403164006699757',
      'dP7+LxNnA15igINQsIj0bHSPJOcgEmXTjErM+z0+IH0=',
      () => {
        const rowData = {
          id: 'rowId',
          name: 'newName',
          value: 'newValue',
        }
        rows.push(rowData)
        return rows
      },
    )

    mockVerifiedFetch.mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => {
        return {ok: true}
      },
    })

    render(<FormDialog {...props} />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    await act(() => {
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockVerifiedFetch).toHaveBeenCalled()
    })

    expect(rows).toHaveLength(1)
  })
})

describe('Component usage errors', () => {
  test('handleSumbit gives an error if missing keyId', async () => {
    const props = getFormDialogProps(ListMode.secret, 'A_SECRET', 'a_value', FormMode.add)

    render(<FormDialog {...props} keyId={undefined} />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    act(() => {
      submitButton.click()
    })

    const errorBlock = screen.getByTestId('error-block')
    expect(errorBlock).toBeInTheDocument()
    expect(errorBlock.textContent).toBe('Name and value are required')
  })

  test('handleSumbit gives an error if missing name and value', async () => {
    const props = getFormDialogProps(ListMode.secret, '', '', FormMode.add)

    render(<FormDialog {...props} keyId="someKeyId" />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    act(() => {
      submitButton.click()
    })

    const errorBlock = screen.getByTestId('error-block')
    expect(errorBlock).toBeInTheDocument()
    expect(errorBlock.textContent).toBe('Name and value are required')
  })

  test('handleSumbit gives an error if missing publicKey', async () => {
    const props = getFormDialogProps(ListMode.secret, 'A_SECRET', 'a_value', FormMode.add)

    render(<FormDialog {...props} publicKey={undefined} />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    act(() => {
      submitButton.click()
    })

    const errorBlock = screen.getByTestId('error-block')
    expect(errorBlock).toBeInTheDocument()
    expect(errorBlock).toHaveTextContent('Secret encryption failed: missing public key')
  })
})

describe('Input validation errors', () => {
  test('handleSubmit displays error when there is a validation failure', async () => {
    const props = getFormDialogProps(ListMode.secret, 'GITHUB_A_SECRET', 'a_value', FormMode.add)
    mockVerifiedFetch.mockResolvedValue({
      status: 400,
      ok: false,
      json: async () => {
        return {ok: false, message: 'validation error'}
      },
    })

    render(<FormDialog {...props} />)

    const submitButton = await screen.findByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    await act(() => {
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockVerifiedFetch).toHaveBeenCalled()
    })

    expect(screen.queryByTestId('form-dialog')).toBeVisible()
    expect(screen.getByTestId('error-block')).toBeInTheDocument()
    const errorValue = screen.getByTestId('error-block')
    expect(errorValue).toHaveTextContent('validation error')
  })

  test('handleSubmit displays default error when response has no message', async () => {
    const props = getFormDialogProps(ListMode.secret, 'A_SECRET', 'a_value', FormMode.add)
    mockVerifiedFetch.mockResolvedValue({
      status: 503,
      ok: false,
      json: async () => {
        return {ok: false}
      },
    })

    render(<FormDialog {...props} />)

    const submitButton = await screen.findByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()

    await act(() => {
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockVerifiedFetch).toHaveBeenCalled()
    })

    expect(screen.queryByTestId('form-dialog')).toBeVisible()
    expect(screen.getByTestId('error-block')).toBeInTheDocument()
    const errorValue = screen.getByTestId('error-block')
    expect(errorValue).toHaveTextContent('An error occurred while saving your secret, please try again')
  })
})
