import {act, screen, waitFor} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {TestWrapper} from '@github-ui/security-campaigns-shared/test-utils/TestWrapper'
import {
  EditSecurityCampaignFormDialog,
  type EditSecurityCampaignFormDialogProps,
} from '../../components/EditSecurityCampaignFormDialog'
import {getEditSecurityCampaignFormDialogProps} from '../../test-utils/mock-data'
import {queryClient} from '@github-ui/security-campaigns-shared/test-utils/query-client'
import {getSecurityCampaign, getUser} from '@github-ui/security-campaigns-shared/test-utils/mock-data'
import type {User} from '@github-ui/security-campaigns-shared/types/user'
import type {SecurityManagersResult} from '@github-ui/security-campaigns-shared/hooks/use-campaign-managers-query'
import {ApiError} from '@github-ui/security-campaigns-shared/utils/api-error'
import type {SecurityCampaignForm} from '@github-ui/security-campaigns-shared/SecurityCampaign'

const render = (props?: Partial<EditSecurityCampaignFormDialogProps>) =>
  reactRender(<EditSecurityCampaignFormDialog {...getEditSecurityCampaignFormDialogProps(props)} />, {
    wrapper: TestWrapper,
  })

beforeEach(() => {
  queryClient.clear()
})

test('The dialog shows blank inputs when no campaign is given', () => {
  render({
    defaultDueDate: undefined,
  })

  const nameInput = getCampaignNameInput()
  expect(nameInput).toBeInTheDocument()
  expect(nameInput.tagName).toBe('INPUT')
  expect(nameInput).toHaveValue('')
  expect(nameInput).toBeEnabled()
  expect(nameInput).toHaveProperty('type', 'text')

  const descriptionInput = getCampaignDescriptionInput()
  expect(descriptionInput).toBeInTheDocument()
  expect(descriptionInput.tagName).toBe('TEXTAREA')
  expect(descriptionInput).toHaveValue('')
  expect(descriptionInput).toBeEnabled()

  const dueDateInput = getCampaignDueDateButton()
  expect(dueDateInput).toBeInTheDocument()
  expect(dueDateInput.tagName).toBe('BUTTON')
  expect(dueDateInput).toBeEnabled()

  const campaignManagerInput = getCampaignManagerButton()
  expect(campaignManagerInput).toBeInTheDocument()
  expect(campaignManagerInput.tagName).toBe('BUTTON')
  expect(campaignManagerInput).toBeEnabled()
})

test('The dialog shows campaign details when a campaign is given', () => {
  render({campaign: getSecurityCampaign()})

  const nameInput = getCampaignNameInput()
  expect(nameInput).toBeInTheDocument()
  expect(nameInput.tagName).toBe('INPUT')
  expect(nameInput).toHaveValue('User-controlled code injection')
  expect(nameInput).toBeEnabled()
  expect(nameInput).toHaveProperty('type', 'text')

  const descriptionInput = getCampaignDescriptionInput()
  expect(descriptionInput).toBeInTheDocument()
  expect(descriptionInput.tagName).toBe('TEXTAREA')
  expect(descriptionInput).toHaveValue(
    'Directly evaluating user input (for example, an HTTP request parameter) as code without first sanitizing the input allows an attacker arbitrary code execution.',
  )
  expect(descriptionInput).toBeEnabled()

  const dueDateInput = getCampaignDueDateButton()
  expect(dueDateInput).toBeInTheDocument()
  expect(dueDateInput.tagName).toBe('BUTTON')
  expect(dueDateInput).toBeEnabled()

  const campaignManagerInput = getCampaignManagerButton()
  expect(campaignManagerInput).toBeInTheDocument()
  expect(campaignManagerInput.tagName).toBe('BUTTON')
  expect(campaignManagerInput).toBeEnabled()
  expect(campaignManagerInput).toHaveTextContent('monalisa')
})

test('the campaign manager can be empty', () => {
  render()

  const campaignManagerInput = getCampaignManagerButton()
  expect(campaignManagerInput).toHaveTextContent('Select manager')
})

test('the campaign manager defaults to the current user', () => {
  render({
    currentUser: getUser(),
  })

  const campaignManagerInput = getCampaignManagerButton()
  expect(campaignManagerInput).toHaveTextContent('monalisa')
})

test('The dialog has a cancel button that closes the dialog', () => {
  const setIsOpen = jest.fn()
  render({
    setIsOpen,
  })

  const cancelButton = screen.getByRole('button', {
    name: 'Cancel',
  })

  expect(cancelButton).toBeInTheDocument()
  expect(cancelButton).toBeEnabled()

  act(() => {
    cancelButton.click()
  })

  expect(setIsOpen).toHaveBeenCalledWith(false)
})

test('When no campaign is given the submit button is disabled by default', () => {
  render()

  const createButton = getCreateButton()

  expect(createButton).toBeInTheDocument()
  expect(createButton).toBeDisabled()
})

test('When a campaign is given the submit button is enabled by default', () => {
  render({campaign: getSecurityCampaign(), allowDueDateInPast: true})

  const updateButton = getUpdateButton()

  expect(updateButton).toBeInTheDocument()
  expect(updateButton).toBeEnabled()
})

test('The submit button is disabled if the campaign name is missing', async () => {
  const {user} = render({
    currentUser: getUser(),
  })

  // Fill in all inputs except name
  const descriptionInput = getCampaignDescriptionInput()
  await user.type(descriptionInput, 'My campaign description')

  expect(getCreateButton()).toBeDisabled()
})

test('The submit button is disabled if the campaign description is missing', async () => {
  const {user} = render({
    currentUser: getUser(),
  })

  // Fill in all inputs except description
  const nameInput = getCampaignNameInput()
  await user.type(nameInput, 'My campaign')

  expect(getCreateButton()).toBeDisabled()
})

test('The submit button is disabled if the campaign manager is missing', async () => {
  const {user} = render()

  // Fill in all inputs
  const nameInput = getCampaignNameInput()
  await user.type(nameInput, 'My campaign')
  const descriptionInput = getCampaignDescriptionInput()
  await user.type(descriptionInput, 'My campaign description')

  expect(getCreateButton()).toBeDisabled()
})

test('The submit button is enabled if all inputs are valid', async () => {
  const {user} = render({
    currentUser: getUser(),
  })

  await user.type(getCampaignNameInput(), 'My campaign')
  await user.type(getCampaignDescriptionInput(), 'My campaign description')

  expect(getCreateButton()).toBeEnabled()
})

test('Calls the submitForm callback when the form is submitted without an existing campaign', async () => {
  const campaignManagersPath = '/github/security-campaigns/security/campaigns/managers'

  const manager = getUser({
    id: 3,
    login: 'octocat',
  })

  const managers: User[] = [
    getUser(),
    manager,
    getUser({
      id: 4,
      login: 'hubot',
    }),
  ]

  mockFetch.mockRoute(campaignManagersPath, {managers} satisfies SecurityManagersResult, {
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })

  const currentUser = getUser()
  const submitForm = jest.fn().mockResolvedValue({ok: true})
  const setIsOpen = jest.fn()
  const {user} = render({
    campaignManagersPath,
    currentUser,
    submitForm,
    setIsOpen,
  })

  await user.type(getCampaignNameInput(), 'My campaign')
  await user.type(getCampaignDescriptionInput(), 'My campaign description')

  await user.click(getCampaignManagerButton())

  // Wait for the managers to load
  await waitFor(() => {
    expect(
      screen.getByRole('option', {
        name: manager.login,
      }),
    ).toBeInTheDocument()
  })

  await user.click(
    screen.getByRole('option', {
      name: manager.login,
    }),
  )

  await user.click(getCreateButton())

  expect(submitForm).toHaveBeenCalledTimes(1)
  expect(submitForm).toHaveBeenCalledWith(
    {
      name: 'My campaign',
      description: 'My campaign description',
      endsAt: expect.any(String),
      manager,
    },
    {
      onSuccess: expect.any(Function),
    },
  )

  expect(setIsOpen).not.toHaveBeenCalled()

  submitForm.mock.calls[0][1].onSuccess()

  expect(setIsOpen).toHaveBeenCalledWith(false)
})

test('Calls the submitForm callback with unchanged values when the form is submitted with an existing campaign', async () => {
  const campaign = getSecurityCampaign()
  const campaignForm: SecurityCampaignForm = {
    name: campaign.name,
    description: campaign.description,
    endsAt: campaign.endsAt,
    manager: campaign.manager,
  }

  const submitForm = jest.fn().mockResolvedValue({ok: true})
  const setIsOpen = jest.fn()
  const {user} = render({
    campaign,
    allowDueDateInPast: true,
    submitForm,
    setIsOpen,
  })

  await user.click(getUpdateButton())

  expect(submitForm).toHaveBeenCalledWith(campaignForm, {
    onSuccess: expect.any(Function),
  })
})

test('Shows an error message when an error message is given', async () => {
  const {user} = render({
    currentUser: getUser(),
    submitForm: jest.fn(),
    formError: new ApiError('Something went wrong', {} as Response),
  })

  await user.type(getCampaignNameInput(), 'My campaign')
  await user.type(getCampaignDescriptionInput(), 'My campaign description')

  await user.click(getCreateButton())

  expect(screen.getByText('Something went wrong')).toBeInTheDocument()
})

function getCreateButton() {
  return screen.getByRole('button', {
    name: 'Create campaign',
  })
}

function getUpdateButton() {
  return screen.getByRole('button', {
    name: 'Save changes',
  })
}

function getCampaignNameInput() {
  return screen.getByPlaceholderText('A short and descriptive name for this security campaign.')
}

function getCampaignDescriptionInput() {
  return screen.getByPlaceholderText(
    "Let everybody know what this security campaign is about and why it's important to remediate these alerts.",
  )
}

function getCampaignDueDateButton() {
  return screen.getByLabelText(/date picker/i)
}

function getCampaignManagerButton() {
  return screen.getByLabelText('Campaign manager', {exact: false})
}
