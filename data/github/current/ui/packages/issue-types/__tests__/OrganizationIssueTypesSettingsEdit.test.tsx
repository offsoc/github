import {Suspense} from 'react'
import {screen} from '@testing-library/react'
import type {PreloadedQuery} from 'react-relay'
import {renderRelay} from '@github-ui/relay-test-utils'
import {OrganizationIssueTypesSettingsEdit} from '../routes/OrganizationIssueTypesSettingsEdit'
import ORGANIZATION_ISSUE_TYPES_SETTINGS_EDIT_QUERY from '../routes/__generated__/OrganizationIssueTypesSettingsEditQuery.graphql'
import type {OrganizationIssueTypesSettingsEditQuery} from '../routes/__generated__/OrganizationIssueTypesSettingsEditQuery.graphql'
import {commitUpdateIssueTypeMutation} from '../mutations/update-issue-type-mutation'

import {commitDeleteIssueTypeMutation} from '../mutations/delete-issue-type-mutation'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {Resources} from '../constants/strings'
import type {OrganizationPayload} from '../test-utils/types'

type OrganizationIssueTypesSettingsEditWrapperProps = {
  organizationIssueTypesSettingsEditQueryRef: PreloadedQuery<OrganizationIssueTypesSettingsEditQuery>
}

const owner = 'owner'
const id = 'IT_123'

const urlParams = {
  organization_id: owner,
  id,
}

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  const navigateFn = jest.fn()
  return {
    ...originalModule,
    useNavigate: () => navigateFn,
    _routerNavigateFn: navigateFn,
    useParams: () => urlParams,
  }
})

jest.mock('../mutations/update-issue-type-mutation')
jest.mock('../mutations/delete-issue-type-mutation')
const mockedUpdateIssueTypeMutation = jest.mocked(commitUpdateIssueTypeMutation)
const mockedDeleteIssueTypeMutation = jest.mocked(commitDeleteIssueTypeMutation)

afterEach(() => {
  jest.clearAllMocks()
})

function renderTestComponent(returnPayload: Partial<OrganizationPayload>) {
  return renderRelay<{
    organizationIssueTypesSettingsEditQuery: OrganizationIssueTypesSettingsEditQuery
  }>(
    ({queryRefs: {organizationIssueTypesSettingsEditQuery}}) => (
      <OrganizationIssueTypesSettingsEditWrapper
        organizationIssueTypesSettingsEditQueryRef={organizationIssueTypesSettingsEditQuery}
      />
    ),
    {
      relay: {
        queries: {
          organizationIssueTypesSettingsEditQuery: {
            type: 'preloaded',
            query: ORGANIZATION_ISSUE_TYPES_SETTINGS_EDIT_QUERY,
            variables: {
              organization_id: 'owner',
              id,
            },
          },
        },

        mockResolvers: {
          Organization() {
            return {
              login: owner,
              ...returnPayload.organization,
            }
          },
          User() {
            return {
              ...(returnPayload.viewer || {isEnterpriseManagedUser: false}),
            }
          },
          IssueType(ctx) {
            const {path} = ctx
            if (path?.includes('organization')) {
              const index = parseInt(path[3] || '0')
              return returnPayload.issueTypes?.edges[index]?.node
            }
            return {
              ...returnPayload.node,
            }
          },
          IssueTypeConnection() {
            return returnPayload.issueTypes
          },
        },
      },
    },
  )
}

const OrganizationIssueTypesSettingsEditWrapper = ({
  organizationIssueTypesSettingsEditQueryRef,
}: OrganizationIssueTypesSettingsEditWrapperProps) => {
  const entryProps = {
    extraProps: {},
    entryPoints: {},
    props: {},
    queries: {
      organizationIssueTypesSettingsEditQuery: organizationIssueTypesSettingsEditQueryRef,
    },
  }
  return (
    <Suspense fallback={'Loading...'}>
      <OrganizationIssueTypesSettingsEdit {...entryProps} />
    </Suspense>
  )
}

test('Renders OrganizationIssueTypesSettingsEdit with issue type being edited', () => {
  const issueTypeData = {
    id,
    name: 'Bug',
    description: 'This is a bug',
    isEnabled: true,
    isPrivate: false,
  }

  renderTestComponent({
    node: issueTypeData,
  })

  expect(screen.getByRole('textbox', {name: Resources.nameLabel})).toHaveValue('Bug')
  expect(screen.getByRole('textbox', {name: Resources.descriptionLabel})).toHaveValue('This is a bug')
  expect(screen.getByRole('radio', {name: 'Gray'})).toBeChecked()
  expect(screen.getByRole('radio', {name: 'Blue'})).toBeInTheDocument()
  expect(screen.getByRole('radio', {name: 'Green'})).toBeInTheDocument()
  expect(screen.getByRole('radio', {name: 'Yellow'})).toBeInTheDocument()
  expect(screen.getByRole('radio', {name: 'Orange'})).toBeInTheDocument()
  expect(screen.getByRole('radio', {name: 'Red'})).toBeInTheDocument()
  expect(screen.getByRole('radio', {name: 'Pink'})).toBeInTheDocument()
  expect(screen.getByRole('radio', {name: 'Purple'})).toBeInTheDocument()
  expect(screen.getAllByRole('radio')).toHaveLength(8)
})

test("Doesn't show the private option for EMU users", async () => {
  const issueTypeData = {
    id,
    name: 'Bug',
    description: 'This is a bug',
    isEnabled: true,
    isPrivate: false,
  }
  renderTestComponent({
    viewer: {
      isEnterpriseManagedUser: true,
    },
    node: issueTypeData,
  })

  const privateOption = screen.queryByTestId('private-issue-type')
  expect(privateOption).toBeNull()
})

test('Does show the private option for non EMU users', async () => {
  const issueTypeData = {
    id,
    name: 'Bug',
    description: 'This is a bug',
    isEnabled: true,
    isPrivate: false,
  }
  renderTestComponent({
    viewer: {
      isEnterpriseManagedUser: false,
    },
    node: issueTypeData,
  })

  expect(screen.getByTestId('private-issue-type')).toBeInTheDocument()
})

test('saving changes updates the issue type (calls mutation', async () => {
  const issueTypeData = {
    name: 'Bug',
    description: 'This is a bug',
    color: 'BLUE',
    isEnabled: true,
    isPrivate: false,
  }

  const {user} = renderTestComponent({
    node: {...issueTypeData, id},
  })

  expect(screen.getByRole('textbox', {name: Resources.nameLabel})).toHaveValue('Bug')
  expect(screen.getByRole('textbox', {name: Resources.descriptionLabel})).toHaveValue('This is a bug')

  const nameInput = await screen.findByTestId('issue-type-name')

  await user.clear(nameInput)
  await user.type(nameInput, 'new name')

  const pinkRadio = screen.getByRole('radio', {name: 'Pink'})
  await user.click(pinkRadio)

  const updateButton = await screen.findByTestId('issue-type-confirm-button')
  await user.click(updateButton)
  expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledTimes(1)
  expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        ...issueTypeData,
        issueTypeId: id,
        name: 'new name',
        color: 'PINK',
      },
    }),
  )
})

test('reverting changes reverts the changed issue type', async () => {
  const issueTypeData = {
    id,
    name: 'Bug',
    description: 'This is a bug',
    color: 'BLUE',
    isEnabled: true,
    isPrivate: false,
  }

  const {user} = renderTestComponent({
    node: issueTypeData,
  })

  const nameInput = await screen.findByTestId('issue-type-name')
  expect(nameInput.getAttribute('value')).toBe('Bug')
  expect(screen.getByRole('textbox', {name: 'Description'})).toHaveValue('This is a bug')

  await user.clear(nameInput)
  await user.type(nameInput, 'new name')
  expect(nameInput.getAttribute('value')).toBe('new name')

  const pinkRadio = screen.getByRole('radio', {name: 'Pink'})
  expect(pinkRadio).not.toBeChecked()
  await user.click(pinkRadio)
  expect(pinkRadio).toBeChecked()

  const revertButton = await screen.findByTestId('issue-type-cancel-button')
  await user.click(revertButton)

  expect(nameInput.getAttribute('value')).toBe('Bug')
  expect(pinkRadio).not.toBeChecked()
  expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledTimes(0)
})

describe('danger zone tests', () => {
  test('enabling an issue type', async () => {
    const issueTypeData = {
      id,
      name: 'Bug',
      description: 'This is a bug',
      isEnabled: false,
      isPrivate: false,
    }

    const {user} = renderTestComponent({
      node: issueTypeData,
    })

    const enableButton = await screen.findByTestId('danger-zone-enable')
    expect(enableButton.textContent).toBe('Enable')

    await user.click(enableButton)
    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledTimes(1)
    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          issueTypeId: id,
          isEnabled: true,
        },
      }),
    )
    expectAnalyticsEvents({
      type: 'org_issue_type.enable',
      target: 'ORG_ISSUE_TYPE_ENABLE_BUTTON',
      data: {
        app_name: 'issue_types',
        category: 'edit',
        owner,
        issueTypeId: id,
      },
    })
  })

  test('disabling an issue type', async () => {
    const issueTypeData = {
      id,
      name: 'Bug',
      description: 'This is a bug',
      isEnabled: true,
      isPrivate: false,
    }

    const {user} = renderTestComponent({
      node: issueTypeData,
    })

    const disableButton = await screen.findByTestId('danger-zone-enable')
    expect(disableButton.textContent).toBe('Disable')

    await user.click(disableButton)
    const disableDialog = await screen.findByRole('dialog', {
      name: Resources.disableConfirmationDialogHeader,
    })
    expect(disableDialog).toBeVisible()

    const buttons = screen.getAllByRole('button', {name: 'Disable'})
    const button = buttons.find(b => b.getAttribute('data-testid') === null)

    if (!button) throw new Error('Could not find disable button in dialog')

    await user.click(button)
    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledTimes(1)
    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          issueTypeId: id,
          isEnabled: false,
        },
      }),
    )
    expectAnalyticsEvents({
      type: 'org_issue_type.disable',
      target: 'ORG_ISSUE_TYPE_DISABLE_BUTTON',
      data: {
        app_name: 'issue_types',
        category: 'edit',
        owner,
        issueTypeId: id,
      },
    })
  })

  test('deleting an issue type', async () => {
    const issueTypeData = {
      id,
      name: 'P1',
      description: 'This is a P1',
      isEnabled: true,
      isPrivate: false,
      issueType: 'CUSTOM', //only custom issue types can be deleted
    }

    const {user} = renderTestComponent({
      node: issueTypeData,
    })

    const deleteButton = await screen.findByTestId('danger-zone-delete')
    await user.click(deleteButton)

    const deleteDialog = await screen.findByRole('dialog')
    expect(deleteDialog).toBeVisible()

    const buttons = screen.getAllByRole('button', {name: 'Delete'})
    const button = buttons.find(b => b.getAttribute('data-testid') === null)

    if (!button) throw new Error('Could not find delete button in dialog')

    expect(button).toBeDisabled()

    const confirmNameInput = await screen.findByTestId('deletion-confirmation-dialog-name')
    await user.type(confirmNameInput, issueTypeData.name)

    expect(button).toBeEnabled()

    await user.click(button)

    expect(mockedDeleteIssueTypeMutation).toHaveBeenCalledTimes(1)
    expect(mockedDeleteIssueTypeMutation).toHaveBeenCalledWith(expect.objectContaining({input: {issueTypeId: id}}))
    expectAnalyticsEvents({
      type: 'org_issue_type.delete',
      target: 'ORG_ISSUE_TYPE_DELETE_BUTTON',
      data: {
        app_name: 'issue_types',
        category: 'edit',
        owner,
        issueTypeId: id,
      },
    })
  })
})

describe('input validation tests', () => {
  test('on duplicated name', async () => {
    const issueTypeData = {
      id,
      name: 'Bug',
      description: 'This is a bug',
      isEnabled: true,
      isPrivate: false,
    }

    const {user} = renderTestComponent({
      node: issueTypeData,
      issueTypes: {
        totalCount: 2,
        edges: [
          {
            node: {
              ...issueTypeData,
            },
          },
          {
            node: {
              id: 'IT_888',
              name: 'Feature',
            },
          },
        ],
      },
    })

    const nameInput = await screen.findByTestId('issue-type-name')
    await user.clear(nameInput)
    await user.type(nameInput, 'feature')

    const updateButton = await screen.findByTestId('issue-type-confirm-button')
    await user.click(updateButton)

    expect(screen.getByText(Resources.nameTakenError)).toBeInTheDocument()
    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledTimes(0)
  })
})
