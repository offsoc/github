import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {getRunnerEditForm, getEditRunnerRoutePayload} from '../test-utils/mock-data'
import {EditRunner} from '../routes/EditRunner'
import {runnerDetailsPath, updateRunnerPath} from '../helpers/paths'

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

describe('EditRunner rendering', () => {
  test('Main form elements are rendered', () => {
    const routePayload = getEditRunnerRoutePayload()
    render(<EditRunner />, {
      routePayload,
    })
    expect(screen.getByTestId('subhead-runner-list-path')).toHaveAttribute('href', routePayload.runnerListPath)
    expect(screen.getByTestId('runner-name-input-section')).toBeVisible()
    expect(screen.getByTestId('runner-public-ip-checkbox')).toBeVisible()
    expect(screen.getByTestId('edit-runner-save-button')).toBeVisible()
    expect(screen.getByTestId('edit-runner-cancel-button')).toBeVisible()
    expect(screen.getByTestId('runner-group-section')).toBeVisible()
  })

  test('"Runner specifications" section is hidden when runner does not have a custom image', async () => {
    const routePayload = getEditRunnerRoutePayload({runnerHasCustomImage: false})
    render(<EditRunner />, {routePayload})

    expect(screen.queryByTestId('edit-runner-specifications-section')).toBeNull()
  })

  test('"Runner specifications" section is visible when runner has a custom image', async () => {
    const routePayload = getEditRunnerRoutePayload({runnerHasCustomImage: true})
    render(<EditRunner />, {routePayload})

    expect(screen.getByTestId('edit-runner-specifications-section')).toBeVisible()
  })
})

describe('EditRunner form submission', () => {
  test('Basic form (changing runner name) submits and redirects', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        return {success: true, errors: []}
      },
    })

    const routePayload = getEditRunnerRoutePayload()
    const runnerId = routePayload.runnerId
    const editedRunnerName = 'EditedRunnerName'

    render(<EditRunner />, {
      routePayload,
    })

    // update runner name
    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: editedRunnerName}})

    // submit form
    const submitBtn = screen.getByTestId('edit-runner-save-button')
    fireEvent.click(submitBtn)

    // verify expected form submission
    const expectedRunnerEditForm = getRunnerEditForm({
      name: editedRunnerName,
    })
    await act(() =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        updateRunnerPath({isEnterprise: false, entityLogin: routePayload.entityLogin, runnerId}),
        {
          method: 'PATCH',
          body: expectedRunnerEditForm,
        },
      ),
    )

    // verify navigation to org runner details page
    expect(navigateFn).toHaveBeenCalledWith(
      runnerDetailsPath({isEnterprise: false, entityLogin: routePayload.entityLogin, runnerId}),
    )
  })

  test('form cannot be submitted if validation failed', async () => {
    const updateRunnerFn = jest.fn()
    jest.mock('../services/runner', () => {
      return {
        ...jest.requireActual('../services/runner'),
        createRunner: updateRunnerFn,
      }
    })
    const routePayload = getEditRunnerRoutePayload()
    render(<EditRunner />, {routePayload})

    // update runner name to blank
    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: ''}})
    // eslint-disable-next-line github/no-blur
    fireEvent.blur(runnerNameInput)

    const submitBtn = screen.getByTestId('edit-runner-save-button')
    fireEvent.click(submitBtn)

    await waitFor(() => expect(runnerNameInput).toHaveAttribute('aria-invalid', 'true'))
    await act(async () => expect(updateRunnerFn).not.toHaveBeenCalled())
  })

  test('cancel button navigates to runner details page', async () => {
    const routePayload = getEditRunnerRoutePayload()
    render(<EditRunner />, {routePayload})

    const cancelBtn = screen.getByTestId('edit-runner-cancel-button')
    fireEvent.click(cancelBtn)

    expect(navigateFn).toHaveBeenCalledWith(
      runnerDetailsPath({isEnterprise: false, entityLogin: routePayload.entityLogin, runnerId: routePayload.runnerId}),
    )
  })
})
