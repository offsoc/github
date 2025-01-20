import {screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import {ComponentWithLazyLoadQuery} from '@github-ui/relay-test-utils/RelayComponents'
import {type OperationDescriptor, RelayEnvironmentProvider} from 'react-relay'
import {OrganizationIssueTypesList} from '../OrganizationIssueTypesList'
import type {OrganizationIssueTypesList$key} from '../__generated__/OrganizationIssueTypesList.graphql'
import React from 'react'
import {organizationIssueTypes} from '../../routes/OrganizationIssueTypesSettings'
import {Resources} from '../../constants/strings'
import {commitDeleteIssueTypeMutation} from '../../mutations/delete-issue-type-mutation'
import {commitUpdateIssueTypeMutation} from '../../mutations/update-issue-type-mutation'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {noop} from '@github-ui/noop'

const organizationId = 'org'
const urlParams = {
  organizationId,
}

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
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

jest.mock('../../mutations/update-issue-type-mutation')
jest.mock('../../mutations/delete-issue-type-mutation')
const mockedUpdateIssueTypeMutation = jest.mocked(commitUpdateIssueTypeMutation)
const mockedDeleteIssueTypeMutation = jest.mocked(commitDeleteIssueTypeMutation)

// Mock the following properties to avoid focus errors for ListView
beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {get: () => 42},
    offsetWidth: {get: () => 42},
    getClientRects: {get: () => () => [42]},
    offsetParent: {get: () => true},
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

function TestComponent({environment}: TestComponentProps) {
  const createComponent = (data: unknown) => (
    <OrganizationIssueTypesList
      node={(data as {organization: OrganizationIssueTypesList$key}).organization}
      setIsIssueTypesLimitReached={noop}
    />
  )

  return (
    <RelayEnvironmentProvider environment={environment}>
      <AnalyticsProvider appName="issue_types" category="organization_list" metadata={{owner: organizationId}}>
        <React.Suspense fallback="...Loading">
          <ComponentWithLazyLoadQuery
            dataToComponent={createComponent}
            query={organizationIssueTypes}
            queryVariables={{login: urlParams.organizationId}}
          />
        </React.Suspense>
      </AnalyticsProvider>
    </RelayEnvironmentProvider>
  )
}

type IssueTypeNodeProps = {
  id: string
  isEnabled: boolean
  name: string
  description: string
}

function setupEnvironment(output: IssueTypeNodeProps[] = []) {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(organizationIssueTypes, {organizationId: urlParams.organizationId, first: 10})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    const payload = MockPayloadGenerator.generate(operation, {
      Organization() {
        return {
          login: 'org',
          issueTypes: {
            totalCount: output.length,
            edges: output.map(node => ({node})),
            pageInfo: {
              hasNextPage: false,
            },
          },
        }
      },
    })
    if (output.length === 0) {
      if (
        payload &&
        payload.data &&
        payload.data.organization &&
        payload.data.organization.issueTypes &&
        payload.data.organization.issueTypes.edges
      ) {
        payload.data.organization.issueTypes.edges = []
      }
    }
    return payload
  })

  return environment
}

test('Renders the issue types from the organization', async () => {
  const environment = setupEnvironment([{id: 'IT_1', isEnabled: true, name: 'bug', description: 'a bug'}])
  render(<TestComponent environment={environment} />)

  const items = screen.getAllByRole('listitem')
  expect(items.length).toBe(1)
  expect(screen.getByText('bug')).toBeInTheDocument()
})

test('Renders a blankslate when there are no issue types', async () => {
  const environment = setupEnvironment([])
  render(<TestComponent environment={environment} />)

  expect(screen.getByText(Resources.blankslateHeadingOrg)).toBeInTheDocument()
})

test('can open the menu when clicking on the horizontal kebab menu', async () => {
  const output = [{id: 'IT_1', isEnabled: true, name: 'p1', description: 'a p1'}]

  const environment = setupEnvironment(output)
  const {user} = render(<TestComponent environment={environment} />)

  const kebabMenu = screen.getByTestId('overflow-menu-anchor')

  // Clicking on the menu of the first item
  await user.click(kebabMenu)

  // Menu is opened
  expect(screen.getByRole('menu')).toBeInTheDocument()
  expect(screen.getByText('Edit')).toBeInTheDocument()
  expect(screen.getByText('Delete')).toBeInTheDocument()
})

test('shows flash message when limit is reached', async () => {
  const environment = setupEnvironment(generateIssueTypes(10))
  render(<TestComponent environment={environment} />)

  const flashMessage = screen.getByText('Reached max of 10 types')
  expect(flashMessage).toBeInTheDocument()
})

test('does not show flash message when within limit', async () => {
  const environment = setupEnvironment(generateIssueTypes(8))
  render(<TestComponent environment={environment} />)

  await waitFor(() => {
    expect(screen.queryByText('Reached max of 10 types')).not.toBeInTheDocument()
  })
})

describe('issue type menu options', () => {
  test('enable an issue type', async () => {
    const issueType = {id: 'IT_1', isEnabled: false, name: 'bug', description: 'a bug'}

    const environment = setupEnvironment([issueType])
    const {user} = render(<TestComponent environment={environment} />)

    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(1)

    const kebabMenu = screen.getByTestId('overflow-menu-anchor')
    await user.click(kebabMenu)

    const enableMenuOption = await screen.findByTestId(`menu-enable-option-${issueType.id}`)
    await user.click(enableMenuOption)

    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledTimes(1)
    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledWith(
      expect.objectContaining({input: {issueTypeId: issueType.id, isEnabled: true}}),
    )
    expectAnalyticsEvents({
      type: 'org_issue_type.enable',
      target: 'ORG_ISSUE_TYPE_LIST_ITEM_MENU_OPTION',
      data: {
        app_name: 'issue_types',
        category: 'organization_list',
        owner: organizationId,
        issueTypeId: issueType.id,
      },
    })
  })

  test('disable an issue type', async () => {
    const issueType = {id: 'IT_1', isEnabled: true, name: 'bug', description: 'a bug'}

    const environment = setupEnvironment([issueType])
    const {user} = render(<TestComponent environment={environment} />)

    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(1)

    const kebabMenu = screen.getByTestId('overflow-menu-anchor')
    await user.click(kebabMenu)

    const enableMenuOption = await screen.findByTestId(`menu-enable-option-${issueType.id}`)
    await user.click(enableMenuOption)

    const disableDialog = await screen.findByRole('dialog', {name: 'Disable issue type'})
    expect(disableDialog).toBeVisible()

    const disableConfirmButton = await screen.findByRole('button', {name: 'Disable'})
    await user.click(disableConfirmButton)

    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledTimes(1)
    expect(mockedUpdateIssueTypeMutation).toHaveBeenCalledWith(
      expect.objectContaining({input: {issueTypeId: issueType.id, isEnabled: false}}),
    )
    expectAnalyticsEvents({
      type: 'org_issue_type.disable',
      target: 'ORG_ISSUE_TYPE_DISABLE_BUTTON',
      data: {
        app_name: 'issue_types',
        category: 'organization_list',
        owner: organizationId,
        issueTypeId: issueType.id,
      },
    })
  })

  test('delete an issue type', async () => {
    const issueType = {
      id: 'IT_1',
      isEnabled: true,
      name: 'p1',
      description: 'a p1',
    }

    const environment = setupEnvironment([issueType])
    const {user} = render(<TestComponent environment={environment} />)

    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(1)

    const kebabMenu = screen.getByTestId('overflow-menu-anchor')
    await user.click(kebabMenu)

    const deleteMenuOption = await screen.findByTestId(`menu-delete-option-${issueType.id}`)
    await user.click(deleteMenuOption)

    const deleteDialog = await screen.findByRole('dialog')
    expect(deleteDialog).toBeVisible()
    expect(await screen.findByRole('button', {name: 'Delete'})).toBeDisabled()

    const confirmNameInput = await screen.findByTestId('deletion-confirmation-dialog-name')
    await user.type(confirmNameInput, issueType.name)

    const deleteConfirmButton = await screen.findByText('Delete')

    expect(deleteConfirmButton).toBeEnabled()

    await user.click(deleteConfirmButton)

    expect(mockedDeleteIssueTypeMutation).toHaveBeenCalledTimes(1)
    expect(mockedDeleteIssueTypeMutation).toHaveBeenCalledWith(
      expect.objectContaining({input: {issueTypeId: issueType.id}}),
    )
    expectAnalyticsEvents({
      type: 'org_issue_type.delete',
      target: 'ORG_ISSUE_TYPE_DELETE_BUTTON',
      data: {
        app_name: 'issue_types',
        category: 'organization_list',
        owner: organizationId,
        issueTypeId: issueType.id,
      },
    })
  })
})

const generateIssueTypes = (numIssueTypes: number) => {
  const issueTypes = []

  for (let i = 0; i < numIssueTypes; i++) {
    issueTypes.push({
      id: `IT_${i + 1}`,
      isEnabled: true,
      name: `Issue Type ${i + 1}`,
      description: 'random issue type',
    })
  }

  return issueTypes
}
