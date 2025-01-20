import {act, screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {SecurityCampaignCreation} from '../SecurityCampaignCreation'
import {getSecurityCampaignCreationProps} from '../test-utils/mock-data'
import type {SecurityCampaignCreateButtonProps} from '../components/SecurityCampaignCreateButton'
import type {CreateSecurityCampaignResponse} from '../hooks/use-create-security-campaign-mutation'

beforeAll(() => {
  jest.spyOn(window, 'open').mockImplementation(() => null)
})

test('Renders the create campaign button', () => {
  const props = getSecurityCampaignCreationProps()

  render(<SecurityCampaignCreation {...props} />)

  const creationButton = getCreateCampaignButton()

  expect(creationButton).toBeInTheDocument()
  expect(creationButton).toBeEnabled()
})

test('Renders inactive create campaign button when there are no alerts and shows dialog when clicked', async () => {
  const props = getSecurityCampaignCreationProps({alertsCount: 0})

  const {user} = render(<SecurityCampaignCreation {...props} />)

  const creationButton = getCreateCampaignButton()

  expect(creationButton).toBeInTheDocument()
  expect(creationButton).toHaveAttribute('data-inactive', 'true')

  await user.click(creationButton)

  const dialog = screen.getByRole('dialog')

  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveTextContent('That looks like an empty campaign')

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'security_campaigns',
      action: 'create',
      label: 'location:security_center_alerts_code_scanning;dialog:no_alerts;alerts_count:0;org_campaigns_count:3',
    },
  })
})

test('Shows the campaign limits dialog when the create button is clicked and the org has reached the limit', () => {
  openDialog({orgCampaignsCount: 10})

  const dialog = screen.getByRole('dialog')

  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveTextContent('Campaign limit reached')

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'security_campaigns',
      action: 'create',
      label:
        'location:security_center_alerts_code_scanning;dialog:campaigns_limit;alerts_count:100;org_campaigns_count:10',
    },
  })
})

test('Shows the alerts limit dialog when the create button is clicked and the alerts limit is reached', async () => {
  const {user} = openDialog({alertsCount: 1001})

  const alertsLimitDialog = screen.getByRole('dialog')

  expect(alertsLimitDialog).toBeInTheDocument()
  expect(alertsLimitDialog).toHaveTextContent('This looks like a big campaign')

  const keepFilteringButton = screen.getByRole('button', {
    name: 'Keep filtering',
  })

  await user.click(keepFilteringButton)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'security_campaigns',
      action: 'create',
      label:
        'location:security_center_alerts_code_scanning;dialog:alerts_limit;alerts_count:1001;org_campaigns_count:3',
    },
  })
})

test('Opens create campaign dialog when proceeding from the campaign alerts limit dialog', async () => {
  const {user} = openDialog({alertsCount: 1001})

  const alertsLimitDialog = screen.getByRole('dialog')

  expect(alertsLimitDialog).toHaveTextContent('This looks like a big campaign')
  const proceedAnywayButton = screen.getByRole('button', {
    name: 'I understand, proceed anyway',
  })

  await user.click(proceedAnywayButton)

  const dialog = screen.getByRole('dialog')

  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveTextContent('New campaign')

  expectAnalyticsEvents(
    {
      type: 'analytics.click',
      data: {
        category: 'security_campaigns',
        action: 'create',
        label:
          'location:security_center_alerts_code_scanning;dialog:alerts_limit;alerts_count:1001;org_campaigns_count:3',
      },
    },
    {
      type: 'analytics.click',
      data: {
        category: 'security_campaigns',
        action: 'create',
        label: 'location:security_center_alerts_code_scanning;dialog:creation;alerts_count:1001;org_campaigns_count:3',
      },
    },
  )
})

test('Shows the campaign limits dialog when the create button is clicked and the org has reached the limit and alerts is over the limit', () => {
  openDialog({orgCampaignsCount: 10, alertsCount: 1001})

  const dialog = screen.getByRole('dialog')

  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveTextContent('Campaign limit reached')
})

test('Shows the creation dialog when the create button is clicked', () => {
  openDialog()

  const dialog = screen.getByRole('dialog')

  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveTextContent('New campaign')

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'security_campaigns',
      action: 'create',
      label: 'location:security_center_alerts_code_scanning;dialog:creation;alerts_count:100;org_campaigns_count:3',
    },
  })
})

test('The creation dialog shows the campaign name, description and due date inputs', () => {
  openDialog()

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
  expect(dueDateInput).toHaveValue('')
  expect(dueDateInput).toBeEnabled()
})

test('The creation dialog has a cancel button that closes the dialog', () => {
  openDialog()

  const cancelButton = screen.getByRole('button', {
    name: 'Cancel',
  })

  expect(cancelButton).toBeInTheDocument()
  expect(cancelButton).toBeEnabled()

  act(() => {
    cancelButton.click()
  })

  const dialog = screen.queryByRole('dialog')
  expect(dialog).not.toBeInTheDocument()
})

test('The creation dialog has a create button that is disabled by default', async () => {
  const {dialog} = openDialog()

  const createButton = getConfirmationButton(dialog)

  expect(createButton).toBeInTheDocument()
  expect(createButton).toBeDisabled()
})

test('The creation dialog has a create button that is disabled if the campaign name is missing', async () => {
  const {user, dialog} = openDialog()
  const createButton = getConfirmationButton(dialog)

  // Fill in all inputs except name
  const descriptionInput = getCampaignDescriptionInput()
  await user.type(descriptionInput, 'My campaign description')

  // Check that the create button is disabled
  expect(createButton).toBeDisabled()
})

test('The creation dialog has a create button that is disabled if the campaign description is missing', async () => {
  const {user, dialog} = openDialog()
  const createButton = getConfirmationButton(dialog)

  // Fill in all inputs except description
  const nameInput = getCampaignNameInput()
  await user.type(nameInput, 'My campaign')

  expect(createButton).toBeDisabled()
})

test('The creation dialog has a create button that is enabled if inputs are valid', async () => {
  const {user, dialog} = openDialog()
  const createButton = getConfirmationButton(dialog)

  const nameInput = getCampaignNameInput()
  const descriptionInput = getCampaignDescriptionInput()

  // Fill in the inputs
  await user.type(nameInput, 'My campaign')
  await user.type(descriptionInput, 'My campaign description')

  expect(createButton).toBeEnabled()
})

test('Calls the API to create a campaign when the form is submitted', async () => {
  const props = getSecurityCampaignCreationProps()

  const route = mockFetch.mockRoute(
    props.campaignCreationPath,
    {
      message: 'Campaign created successfully',
      campaignPath: '/orgs/github/security/campaigns/1',
    } satisfies CreateSecurityCampaignResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user, dialog} = openDialog(props)
  const createButton = getConfirmationButton(dialog)

  await user.type(getCampaignNameInput(), 'My campaign')
  await user.type(getCampaignDescriptionInput(), 'My campaign description')

  await user.click(createButton)

  expect(route).toHaveBeenCalledWith(
    props.campaignCreationPath,
    expect.objectContaining({
      method: 'post',
      body: JSON.stringify({
        campaign_name: 'My campaign',
        campaign_description: 'My campaign description',
        campaign_due_date: props.defaultDueDate?.toISOString(),
        campaign_manager: 1,
        query: props.query,
      }),
    }),
  )

  expect(window.open).toHaveBeenCalledWith('/orgs/github/security/campaigns/1', '_self')
})

function getCreateCampaignButton() {
  return screen.getByRole('button', {
    name: 'Create campaign',
  })
}

function getConfirmationButton(dialog: HTMLElement) {
  return within(dialog).getByRole('button', {
    name: 'Create campaign',
  })
}

function openDialog(additionalProps: Partial<SecurityCampaignCreateButtonProps> = {}) {
  const props = {
    ...getSecurityCampaignCreationProps(),
    ...additionalProps,
  }

  const {user} = render(<SecurityCampaignCreation {...props} />)

  const creationButton = getCreateCampaignButton()

  act(() => {
    creationButton.click()
  })

  const dialog = screen.getByRole('dialog')

  return {user, dialog}
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
