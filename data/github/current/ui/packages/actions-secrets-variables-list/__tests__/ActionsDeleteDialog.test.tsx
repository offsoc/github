import {act, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {getDeleteDialogProps} from '../test-utils/mock-data'
import {DeleteDialog} from '../DeleteDialog'
import {ListMode} from '../types'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {fetchSessionInSudo} from '@github-ui/sudo'

const mockVerifiedFetch = verifiedFetch as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetch: jest.fn(),
}))

const mockFetchSessionInSudo = fetchSessionInSudo as jest.Mock
jest.mock('@github-ui/sudo', () => ({
  fetchSessionInSudo: jest.fn(),
}))

describe('Normal deletion', () => {
  test('The dialog renders as expected for deleting secrets', async () => {
    const props = getDeleteDialogProps('A_SECRET', ListMode.secret)

    render(<DeleteDialog {...props} />)

    expect(screen.getByText('Delete secret')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete.*/)).toBeInTheDocument()
    expect(screen.getByText('A_SECRET')).toBeInTheDocument()
    expect(screen.getByText('Yes, delete this secret')).toBeInTheDocument()
  })

  test('The dialog renders as expected for deleting variables', async () => {
    const props = getDeleteDialogProps('A_VARIABLE', ListMode.variable)

    render(<DeleteDialog {...props} />)

    expect(screen.getByText('Delete variable')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete.*/)).toBeInTheDocument()
    expect(screen.getByText('A_VARIABLE')).toBeInTheDocument()
    expect(screen.getByText('Yes, delete this variable')).toBeInTheDocument()
  })

  test('onClick behaves as expected for deleting secrets golden path', async () => {
    const props = getDeleteDialogProps('A_SECRET', ListMode.secret, {
      commit: 'Delete',
      'codespaces_user_secret[key_id]': '123456',
    })
    mockFetchSessionInSudo.mockResolvedValue(true)
    mockVerifiedFetch.mockResolvedValue({
      ok: true,
      json: async () => {
        return {ok: true}
      },
    })

    render(<DeleteDialog {...props} />)

    const confirmButton = screen.getByTestId('confirm-delete-button')
    expect(confirmButton).toBeInTheDocument()

    act(() => {
      confirmButton.click()
    })

    await waitFor(() => {
      expect(mockVerifiedFetch).toHaveBeenCalled()
    })

    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
  })
})
