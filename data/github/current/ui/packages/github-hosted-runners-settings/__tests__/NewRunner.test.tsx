import {fireEvent, screen, act, waitFor, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {ERRORS} from '../helpers/constants'
import {getRunnerCreateForm, getNewRunnerRoutePayload, getImage} from '../test-utils/mock-data'
import {NewRunner} from '../routes/NewRunner'
import {createRunnerPath} from '../helpers/paths'
import {ImageSource, ImageVersionState} from '../types/image'

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
const navigateFn = jest.fn()

jest.mock('@github-ui/use-navigate')
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

beforeEach(() => {
  const {useNavigate, useSearchParams} = jest.requireMock('@github-ui/use-navigate')
  useNavigate.mockImplementation(() => navigateFn)
  useSearchParams.mockImplementation(() => [new URLSearchParams(), jest.fn()])
})

test('Renders NewRunner', () => {
  const routePayload = getNewRunnerRoutePayload()
  render(<NewRunner />, {
    routePayload,
  })
  expect(screen.getByTestId('subhead-runner-list-path')).toHaveAttribute('href', routePayload.runnerListPath)
  expect(screen.getByTestId('runner-name-input-section')).toBeVisible()
  expect(screen.getByTestId('create-runner-button')).toBeVisible()
  expect(screen.getByTestId('runner-group-selector')).toBeVisible()
})

test('Preselects runner group when it is passed in the query string', () => {
  const routePayload = getNewRunnerRoutePayload()
  const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
  useSearchParams.mockImplementation(() => [new URLSearchParams('runner_group_id=2'), jest.fn()])

  render(<NewRunner />, {
    routePayload,
  })

  expect(screen.getByTestId('runner-group-selector')).toHaveTextContent('Another Group')
})

describe('Create runner', () => {
  test('success', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        return {success: true, errors: [], data: {runnerId: 1}}
      },
    })
    const runnerName = 'NewRunner'
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: runnerName}})

    // Set platform, image, and size
    const platformOption = screen.getByTestId('platform-option-label-linux-x64')
    const platformSaveButton = screen.getByTestId('platform-save-button')
    fireEvent.click(platformOption)
    fireEvent.click(platformSaveButton)

    const imageOption = screen.getByTestId('image-option-radio-ubuntu-latest')
    const imageSaveButton = screen.getByTestId('image-save-button')
    fireEvent.click(imageOption)
    fireEvent.click(imageSaveButton)

    const sizeInput = screen.getByTestId(`runner-machine-spec-radio-4-core`)
    const sizeSaveButton = screen.getByTestId('runner-machine-spec-save-button')
    fireEvent.click(sizeInput)
    fireEvent.click(sizeSaveButton)

    // Submit form
    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    const expectedRunnerForm = getRunnerCreateForm({runnerName})
    await act(() =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        createRunnerPath({isEnterprise: false, entityLogin: routePayload.entityLogin}),
        {
          method: 'POST',
          body: expectedRunnerForm,
        },
      ),
    )
    expect(navigateFn).toHaveBeenCalledWith(
      `/organizations/${routePayload.entityLogin}/settings/actions/github-hosted-runners/1`,
    )
  })

  test('success with a custom image upload', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        return {success: true, errors: [], data: {runnerId: 1}}
      },
    })
    const runnerName = 'NewRunner'
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: runnerName}})

    // Set platform to custom
    fireEvent.click(screen.getByTestId('platform-option-label-custom'))
    fireEvent.click(screen.getByTestId('platform-save-button'))

    // Set image upload settings
    const imageUploadUriInputEl = screen.getByTestId('image-upload-uri-input')
    expect(imageUploadUriInputEl).toBeInTheDocument()
    fireEvent.change(imageUploadUriInputEl, {target: {value: 'https://example.com/'}})
    expect(screen.getByTestId('image-upload-uri-input')).toHaveValue('https://example.com/')
    fireEvent.click(screen.getByTestId('image-save-button'))
    expect(screen.getByText('Custom, Linux, https://example.com/')).toBeInTheDocument()

    // Set size to 4-core
    fireEvent.click(screen.getByTestId(`runner-machine-spec-radio-4-core`))
    fireEvent.click(screen.getByTestId('runner-machine-spec-save-button'))

    // Submit form
    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    const expectedRunnerForm = getRunnerCreateForm({
      runnerName,
      platform: 'custom',
      imageUploadTypeId: 'linux-x64',
      imageSasUri: 'https://example.com/',
      imageSource: ImageSource.Custom,
      imageId: null,
      imageVersion: null,
    })

    await act(() =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        createRunnerPath({isEnterprise: false, entityLogin: routePayload.entityLogin}),
        {
          method: 'POST',
          body: expectedRunnerForm,
        },
      ),
    )
    expect(navigateFn).toHaveBeenCalledWith(
      `/organizations/${routePayload.entityLogin}/settings/actions/github-hosted-runners/1`,
    )
  })

  test('success with public ip enabled', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => {
        return {
          data: {
            runnerId: 1,
          },
        }
      },
    })

    const runnerName = 'NewRunner'
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    // Runner name input
    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: runnerName}})

    // Check Public IP checkbox
    const publicIpCheckbox = screen.getByTestId('runner-public-ip-checkbox')
    fireEvent.click(publicIpCheckbox)

    // Set platform, image, and size
    const platformOption = screen.getByTestId('platform-option-label-linux-x64')
    const platformSaveButton = screen.getByTestId('platform-save-button')
    fireEvent.click(platformOption)
    fireEvent.click(platformSaveButton)

    const imageOption = screen.getByTestId('image-option-radio-ubuntu-latest')
    const imageSaveButton = screen.getByTestId('image-save-button')
    fireEvent.click(imageOption)
    fireEvent.click(imageSaveButton)

    const sizeInput = screen.getByTestId('runner-machine-spec-radio-4-core')
    const sizeSaveButton = screen.getByTestId('runner-machine-spec-save-button')
    fireEvent.click(sizeInput)
    fireEvent.click(sizeSaveButton)

    // Submit form
    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    const expectedRunnerForm = getRunnerCreateForm({runnerName, isPublicIpEnabled: true})
    await act(() =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        createRunnerPath({isEnterprise: false, entityLogin: routePayload.entityLogin}),
        {
          method: 'POST',
          body: expectedRunnerForm,
        },
      ),
    )
    expect(navigateFn).toHaveBeenCalledWith(
      `/organizations/${routePayload.entityLogin}/settings/actions/github-hosted-runners/1`,
    )
  })

  test('unclassified error', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        return {success: false, errors: ['Unable to create runner'], data: {}}
      },
    })
    const runnerName = 'NewRunner'
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: runnerName}})

    // Set platform, image, and size
    const platformOption = screen.getByTestId('platform-option-label-linux-x64')
    const platformSaveButton = screen.getByTestId('platform-save-button')
    fireEvent.click(platformOption)
    fireEvent.click(platformSaveButton)

    const imageOption = screen.getByTestId('image-option-radio-ubuntu-latest')
    const imageSaveButton = screen.getByTestId('image-save-button')
    fireEvent.click(imageOption)
    fireEvent.click(imageSaveButton)

    const sizeInput = screen.getByTestId('runner-machine-spec-radio-4-core')
    const sizeSaveButton = screen.getByTestId('runner-machine-spec-save-button')
    fireEvent.click(sizeInput)
    fireEvent.click(sizeSaveButton)

    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    const expectedRunnerForm = getRunnerCreateForm({runnerName})
    await act(async () =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        createRunnerPath({isEnterprise: false, entityLogin: routePayload.entityLogin}),
        {
          method: 'POST',
          body: expectedRunnerForm,
        },
      ),
    )
    expect(screen.getByText(ERRORS.CREATION_FAILED_REASON_UNKNOWN)).toBeInTheDocument()
  })

  test('name conflict error', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => {
        return {success: false, errors: ['Name conflict'], data: {}}
      },
    })
    const runnerName = 'NewRunner'
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: runnerName}})

    // Set platform, image, and size
    const platformOption = screen.getByTestId('platform-option-label-linux-x64')
    const platformSaveButton = screen.getByTestId('platform-save-button')
    fireEvent.click(platformOption)
    fireEvent.click(platformSaveButton)

    const imageOption = screen.getByTestId('image-option-radio-ubuntu-latest')
    const imageSaveButton = screen.getByTestId('image-save-button')
    fireEvent.click(imageOption)
    fireEvent.click(imageSaveButton)

    const sizeInput = screen.getByTestId(`runner-machine-spec-radio-4-core`)
    const sizeSaveButton = screen.getByTestId('runner-machine-spec-save-button')
    fireEvent.click(sizeInput)
    fireEvent.click(sizeSaveButton)

    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    const expectedRunner = getRunnerCreateForm({runnerName})
    await act(async () =>
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        createRunnerPath({isEnterprise: false, entityLogin: routePayload.entityLogin}),
        {
          method: 'POST',
          body: expectedRunner,
        },
      ),
    )
    expect(screen.getByText(ERRORS.RUNNER_NAME_ALREADY_EXISTS(runnerName))).toBeInTheDocument()
  })
})

describe('Form validation', () => {
  test('runner name cannot be empty', async () => {
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const runnerNameInput = screen.getByTestId('runner-name-input')

    // give the runner a valid name
    fireEvent.change(runnerNameInput, {target: {value: 'valid name'}})

    // change the name to an invalid name of empty string
    fireEvent.change(runnerNameInput, {target: {value: ''}})

    expect(
      screen.getByText(
        "Name must be between 1 and 64 characters and may only contain alphanumeric characters, '.', '-', and '_'.",
      ),
    ).toBeInTheDocument()
  })

  test('runner name cannot contain unallowed characters', async () => {
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: 'NewRunner%$'}})
    // eslint-disable-next-line github/no-blur
    fireEvent.blur(runnerNameInput)

    await waitFor(() => expect(runnerNameInput).toHaveAttribute('aria-invalid', 'true'))
    await screen.findByText(
      "Name must be between 1 and 64 characters and may only contain alphanumeric characters, '.', '-', and '_'.",
    )
  })

  test('max concurrency cannot be greater than allowed max', async () => {
    const createRunnerFn = jest.fn()
    jest.mock('../services/runner', () => {
      return {
        ...jest.requireActual('../services/runner'),
        createRunner: createRunnerFn,
      }
    })
    const routePayload = getNewRunnerRoutePayload({
      maxConcurrentJobsDefaultMax: 100,
    })
    render(<NewRunner />, {
      routePayload,
    })

    const maxConcurrencyInput = screen.getByTestId('runner-max-concurrency-input')
    fireEvent.change(maxConcurrencyInput, {target: {value: '100000'}})
    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    await waitFor(() => expect(maxConcurrencyInput).toHaveAttribute('aria-invalid', 'true'))
    await act(async () => expect(createRunnerFn).not.toHaveBeenCalled())
  })

  test('max concurrency cannot be less than allowed min', async () => {
    const createRunnerFn = jest.fn()
    jest.mock('../services/runner', () => {
      return {
        ...jest.requireActual('../services/runner'),
        createRunner: createRunnerFn,
      }
    })
    const routePayload = getNewRunnerRoutePayload({
      maxConcurrentJobsMin: 1,
    })
    render(<NewRunner />, {
      routePayload,
    })

    const maxConcurrencyInput = screen.getByTestId('runner-max-concurrency-input')
    fireEvent.change(maxConcurrencyInput, {target: {value: '0'}})
    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    await waitFor(() => expect(maxConcurrencyInput).toHaveAttribute('aria-invalid', 'true'))
    await act(async () => expect(createRunnerFn).not.toHaveBeenCalled())
  })

  test('image must be selected (when custom image upload is not selected)', async () => {
    const createRunnerFn = jest.fn()
    jest.mock('../services/runner', () => {
      return {
        ...jest.requireActual('../services/runner'),
        createRunner: createRunnerFn,
      }
    })
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    await expect(screen.findByText('Image is required.')).resolves.toBeInTheDocument()
    await act(async () => expect(createRunnerFn).not.toHaveBeenCalled())
  })

  test('image upload requires a file', async () => {
    const createRunnerFn = jest.fn()
    jest.mock('../services/runner', () => {
      return {
        ...jest.requireActual('../services/runner'),
        createRunner: createRunnerFn,
      }
    })
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    // select custom image upload option
    fireEvent.click(screen.getByTestId('platform-option-label-custom'))
    fireEvent.click(screen.getByTestId('platform-save-button'))

    // try to save image upload values without providing a file
    fireEvent.click(screen.getByTestId('image-save-button'))

    await expect(screen.findByText('Azure SAS URI may not be empty.')).resolves.toBeInTheDocument()
    await act(async () => expect(createRunnerFn).not.toHaveBeenCalled())
  })

  test('form cannot be submitted if validation failed', async () => {
    const createRunnerFn = jest.fn()
    jest.mock('../services/runner', () => {
      return {
        ...jest.requireActual('../services/runner'),
        createRunner: createRunnerFn,
      }
    })
    const routePayload = getNewRunnerRoutePayload()
    render(<NewRunner />, {
      routePayload,
    })

    const runnerNameInput = screen.getByTestId('runner-name-input')
    fireEvent.change(runnerNameInput, {target: {value: 'NewRunner%$'}})
    // eslint-disable-next-line github/no-blur
    fireEvent.blur(runnerNameInput)

    const submitBtn = screen.getByTestId('create-runner-button')
    fireEvent.click(submitBtn)

    await waitFor(() => expect(runnerNameInput).toHaveAttribute('aria-invalid', 'true'))
    await act(async () => expect(createRunnerFn).not.toHaveBeenCalled())
  })
})

describe('UI validation', () => {
  const images = {
    github: [getImage()],
    partner: [
      getImage({
        id: 'nvidia-image',
        displayName: 'Marketplace NVIDIA Image',
        source: ImageSource.Marketplace,
      }),
    ],
    custom: [
      getImage({
        id: '1',
        displayName: 'Custom Image',
        source: ImageSource.Custom,
        imageVersions: [
          {
            version: 'latest',
            state: ImageVersionState.Ready,
            createdOn: '2024-01-01',
          },
          {
            version: '1.0.0',
            state: ImageVersionState.Ready,
            createdOn: '2024-01-01',
          },
        ],
      }),
    ],
  }

  test('shows correct image source and image name for Curated image when image selector is collapsed', () => {
    const routePayload = getNewRunnerRoutePayload({images})
    render(<NewRunner />, {
      routePayload,
    })

    fireEvent.click(screen.getByTestId('platform-option-label-linux-x64'))
    fireEvent.click(screen.getByTestId('platform-save-button'))

    const imageOption = screen.getByTestId('image-option-radio-ubuntu-latest')
    const imageSaveButton = screen.getByTestId('image-save-button')
    fireEvent.click(imageOption)
    fireEvent.click(imageSaveButton)

    expect(screen.getByText('GitHub-owned, Ubuntu Latest (22.04)')).toBeInTheDocument()
  })

  test('shows correct image source and image name for Marketplace image when image selector is collapsed', () => {
    const routePayload = getNewRunnerRoutePayload({images})
    render(<NewRunner />, {
      routePayload,
    })

    fireEvent.click(screen.getByTestId('platform-option-label-linux-x64'))
    fireEvent.click(screen.getByTestId('platform-save-button'))

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const partnerTab = within(imageSelectorTabs).getByRole('tab', {name: 'Partner'})
    expect(partnerTab).toBeInTheDocument()
    fireEvent.click(partnerTab)

    const partnerImageOption = screen.getByTestId('image-option-radio-nvidia-image')
    fireEvent.click(partnerImageOption)

    const imageSaveButton = screen.getByTestId('image-save-button')
    fireEvent.click(imageSaveButton)

    expect(screen.getByText('Partner, Marketplace NVIDIA Image')).toBeInTheDocument()
  })

  test('shows correct image source, image name and version for Custom image when image selector is collapsed', () => {
    const routePayload = getNewRunnerRoutePayload({images})
    render(<NewRunner />, {
      routePayload,
    })

    fireEvent.click(screen.getByTestId('platform-option-label-linux-x64'))
    fireEvent.click(screen.getByTestId('platform-save-button'))

    const imageSelectorTabs = screen.getByTestId('image-selector-tabs')
    expect(imageSelectorTabs).toBeInTheDocument()

    const customTab = within(imageSelectorTabs).getByRole('tab', {name: 'Custom'})
    expect(customTab).toBeInTheDocument()
    fireEvent.click(customTab)

    const customImageOption = screen.getByTestId('image-option-radio-1')
    fireEvent.click(customImageOption)

    const imageVersionSelector = screen.getByTestId('image-versions-selector-btn')
    expect(imageVersionSelector).toBeInTheDocument()
    fireEvent.click(imageVersionSelector)

    const imageVersionSelectorOptions = screen.getByRole('menu')
    const options = within(imageVersionSelectorOptions).getAllByRole('menuitemradio')
    fireEvent.click(options[1]!)

    const imageSaveButton = screen.getByTestId('image-save-button')
    fireEvent.click(imageSaveButton)

    expect(screen.getByText('Custom, Custom Image, 1.0.0')).toBeInTheDocument()
  })
})
