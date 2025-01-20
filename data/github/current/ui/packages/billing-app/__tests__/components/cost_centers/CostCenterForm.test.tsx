import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'
import {RelayEnvironmentProvider} from 'react-relay'

import CostCenterForm from '../../../components/cost_centers/CostCenterForm'
import {BillingTarget} from '../../../enums'
import {CostCenterType, ResourceType} from '../../../enums/cost-centers'
import {GITHUB_INC_CUSTOMER, mockCostCenterOrgQueries} from '../../../test-utils/mock-data'
import {getCostCenterType} from '../../../utils/cost-centers'

import type {CostCenter, Subscription} from '../../../types/cost-centers'
import type {AdminRole} from '../../../types/common'
import {useSearchParams} from 'react-router-dom'

jest.mock('@github-ui/ssr-utils', () => ({
  get IS_BROWSER() {
    // Without this, `useHydratedEffect()` does nothing and toasts won't show.
    return true
  },
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))
jest.setTimeout(4_500)

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
  useSearchParams: jest.fn(() => [new URLSearchParams()]),
}))

jest.mock('@github-ui/safe-storage', () => {
  return () => ({
    getItem: jest.fn().mockImplementation(key => {
      if (key === 'costCenterName') {
        return 'test-cost-center-localStorage'
      } else if (key === 'costCenterResources') {
        return '[{"type":"Org","id":"O_kgDMoA"},{"type":"Repo","id":"R_kgAa"}]'
      } else {
        return null
      }
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })
})

// Submitting the cost center form throws an error without this due to soft navigation
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    mark: jest.fn(),
    clearResourceTimings: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue({pop: jest.fn()}),
    measure: jest.fn(),
  },
})

type TestComponentProps = {
  action: 'new' | 'edit'
  adminRoles?: AdminRole[]
  billingTarget?: BillingTarget
  costCenter?: CostCenter
  environment: ReturnType<typeof createMockEnvironment>
  subscriptions?: Subscription[]
  isCopilotStandalone: boolean
}
function TestComponent({
  action,
  adminRoles = ['owner'],
  billingTarget = BillingTarget.Azure,
  costCenter,
  environment,
  subscriptions = [],
  isCopilotStandalone,
}: TestComponentProps) {
  if (!costCenter) {
    costCenter = {
      costCenterKey: {
        customerId: GITHUB_INC_CUSTOMER.customerId,
        targetType: getCostCenterType(billingTarget),
        targetId: '',
        uuid: '',
      },
      name: '',
      resources: [],
    }
  }

  return (
    <RelayEnvironmentProvider environment={environment}>
      <CostCenterForm
        action={action}
        costCenter={costCenter}
        customer={{...GITHUB_INC_CUSTOMER, billingTarget}}
        encodedAzureSubscriptionUri=""
        subscriptions={subscriptions}
        adminRoles={adminRoles}
        isCopilotStandalone={isCopilotStandalone}
      />
    </RelayEnvironmentProvider>
  )
}

function SetupAndRenderComponent({
  action,
  adminRoles,
  billingTarget,
  costCenter,
  subscriptions,
  isCopilotStandalone,
}: {
  action: 'new' | 'edit'
  adminRoles?: AdminRole[]
  billingTarget?: BillingTarget
  costCenter?: CostCenter
  subscriptions?: Subscription[]
  isCopilotStandalone: boolean
}) {
  const environment = createMockEnvironment()
  mockCostCenterOrgQueries(environment)

  return render(
    <TestComponent
      action={action}
      adminRoles={adminRoles}
      billingTarget={billingTarget}
      costCenter={costCenter}
      environment={environment}
      subscriptions={subscriptions}
      isCopilotStandalone={isCopilotStandalone}
    />,
  )
}

test('Renders correctly for a new cost center', async () => {
  SetupAndRenderComponent({action: 'new', isCopilotStandalone: false})

  await screen.findByRole('heading', {name: /Cost centers.*New cost center/})
  await expect(screen.findByRole('button', {name: 'Create cost center'})).resolves.toBeInTheDocument()
})

test('Renders correctly for editing a cost center', async () => {
  const costCenter = {
    costCenterKey: {
      customerId: '1',
      targetType: CostCenterType.NoCostCenter,
      targetId: '1',
      uuid: 'test-uuid',
    },
    name: '',
    resources: [],
  }
  SetupAndRenderComponent({action: 'edit', costCenter, isCopilotStandalone: false})

  const saveChangesButton = await screen.findByRole('button', {name: 'Save changes'})

  await expect(screen.findByRole('heading', {name: /Cost centers.*Edit cost center/})).resolves.toBeInTheDocument()
  expect(saveChangesButton).toBeInTheDocument()
})

test('Hides the repository picker from enterprise owners', async () => {
  SetupAndRenderComponent({action: 'new', adminRoles: ['owner'], isCopilotStandalone: false})

  const repoPickerWrapper = screen.queryByTestId('repo-picker-wrapper')
  expect(repoPickerWrapper).toBeNull()
})

test('Hides the repository picker from billing managers', async () => {
  SetupAndRenderComponent({action: 'new', adminRoles: ['billing_manager'], isCopilotStandalone: false})

  const repoPickerWrapper = screen.queryByTestId('repo-picker-wrapper')
  expect(repoPickerWrapper).toBeNull()
})

test('Shows the repository picker if the admin is an org owner', async () => {
  SetupAndRenderComponent({
    action: 'new',
    adminRoles: ['billing_manager', 'enterprise_org_owner'],
    isCopilotStandalone: false,
  })

  const repoPickerWrapper = screen.queryByTestId('repo-picker-wrapper')
  expect(repoPickerWrapper).toBeTruthy()
})

test('Shows the repository picker for org owners', async () => {
  SetupAndRenderComponent({action: 'new', adminRoles: ['enterprise_org_owner'], isCopilotStandalone: false})

  const repoPickerWrapper = screen.queryByTestId('repo-picker-wrapper')
  expect(repoPickerWrapper).toBeTruthy()
})

test('Hides the organization picker from org admins', async () => {
  SetupAndRenderComponent({action: 'new', adminRoles: ['enterprise_org_owner'], isCopilotStandalone: false})

  const orgPickerWrapper = screen.queryByTestId('org-picker-wrapper')
  expect(orgPickerWrapper).toBeNull()
})

test('Shows the organization picker for billing managers', async () => {
  SetupAndRenderComponent({action: 'new', adminRoles: ['billing_manager'], isCopilotStandalone: false})

  const orgPickerWrapper = screen.queryByTestId('org-picker-wrapper')
  expect(orgPickerWrapper).toBeTruthy()
})

test('Shows the organization picker for enterprise admins', async () => {
  SetupAndRenderComponent({action: 'new', adminRoles: ['owner'], isCopilotStandalone: false})

  const orgPickerWrapper = screen.queryByTestId('org-picker-wrapper')
  expect(orgPickerWrapper).toBeTruthy()
})

test('Hides the organization and repo picker for nonGHE', async () => {
  SetupAndRenderComponent({action: 'new', adminRoles: ['owner'], isCopilotStandalone: true})

  const orgPickerWrapper = screen.queryByTestId('org-picker-wrapper')
  const repoPickerWrapper = screen.queryByTestId('repo-picker-wrapper')
  expect(orgPickerWrapper).toBeNull()
  expect(repoPickerWrapper).toBeNull()
})

test('Shows the Azure Subscription ID input when the billingTarget is for Azure', async () => {
  SetupAndRenderComponent({
    action: 'new',
    adminRoles: ['owner'],
    billingTarget: BillingTarget.Azure,
    isCopilotStandalone: false,
  })

  expect(screen.getByText('Add Azure Subscription ID')).toBeInTheDocument()
})

test('Does not show the Azure Subscription ID input when the billingTarget is for Zuora', () => {
  SetupAndRenderComponent({
    action: 'new',
    adminRoles: ['owner'],
    billingTarget: BillingTarget.Zuora,
    isCopilotStandalone: false,
  })

  expect(screen.queryByText('Add Azure Subscription ID')).toBeNull()
})

test('Submits the create cost center form', async () => {
  const {user} = SetupAndRenderComponent({action: 'new', adminRoles: ['owner'], isCopilotStandalone: false})
  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/cost_centers`)

  const nameInput = screen.getByRole('textbox', {name: /Cost Center Name Input \*/i})
  await user.type(nameInput, 'test')

  const openOrgDialogButton = screen.getByTestId('open-org-picker-dialog-button')
  expect(openOrgDialogButton).toBeInTheDocument()
  await user.click(openOrgDialogButton)

  const org = await screen.findByRole('option', {name: 'test1'})
  const dialogSubmitButton = screen.getAllByRole('button', {name: 'Select organizations'})[1]
  await user.click(org)
  dialogSubmitButton && (await user.click(dialogSubmitButton))

  const submitButton = screen.getByRole('button', {name: 'Create cost center'})
  await user.click(submitButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Submits the create form and shows a toast alert when no resources are added to the cost center', async () => {
  const {user} = SetupAndRenderComponent({action: 'new', adminRoles: ['owner'], isCopilotStandalone: false})
  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/cost_centers`)

  const nameInput = screen.getByRole('textbox', {name: /Cost Center Name Input \*/i})
  await user.type(nameInput, 'testing123')

  const submitButton = screen.getByRole('button', {name: 'Create cost center'})
  await user.click(submitButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })

  await waitFor(() => {
    expect(screen.getByRole('status')).toHaveTextContent(
      'Successfully created cost center. Please add some resources via the API to start tracking costs.',
    )
  })
})

test('Submits the edit cost center form', async () => {
  const costCenter = {
    costCenterKey: {
      customerId: '1',
      targetType: CostCenterType.GitHubEnterpriseCustomer,
      targetId: '1',
      uuid: 'test-uuid',
    },
    name: 'test-cost-center',
    resources: [{id: 'O_111', type: ResourceType.Org}],
  }
  const {user} = SetupAndRenderComponent({
    action: 'edit',
    adminRoles: ['owner'],
    costCenter,
    subscriptions: [],
    isCopilotStandalone: false,
  })
  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/cost_centers/test-uuid`)

  const openOrgDialogButton = screen.getByTestId('open-org-picker-dialog-button')
  expect(openOrgDialogButton).toBeInTheDocument()
  await user.click(openOrgDialogButton)

  const newOrg = await screen.findByRole('option', {name: 'test2'})
  const dialogSubmitButton = screen.getAllByRole('button', {name: 'Select organizations'})[1]
  await user.click(newOrg)
  dialogSubmitButton && (await user.click(dialogSubmitButton))

  const submitButton = screen.getByRole('button', {name: 'Save changes'})
  await user.click(submitButton)

  const modalButton = screen.getByRole('button', {name: 'Confirm'})
  await user.click(modalButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
})

test('Submits the edit form and shows a toast alert when the cost center has no resources', async () => {
  const costCenter = {
    costCenterKey: {
      customerId: '1',
      targetType: CostCenterType.GitHubEnterpriseCustomer,
      targetId: '1',
      uuid: 'test-uuid',
    },
    name: 'test-cost-center',
    resources: [],
  }
  const {user} = SetupAndRenderComponent({
    action: 'edit',
    adminRoles: ['owner'],
    costCenter,
    subscriptions: [],
    isCopilotStandalone: false,
  })
  const mock = mockFetch.mockRoute(`/enterprises/github-inc/billing/cost_centers/test-uuid`)

  const nameInput = screen.getByRole('textbox', {name: /Cost Center Name Input \*/i})
  await user.type(nameInput, 'newName')

  const submitButton = screen.getByRole('button', {name: 'Save changes'})
  await user.click(submitButton)

  const modalButton = screen.getByRole('button', {name: 'Confirm'})
  await user.click(modalButton)

  await act(async () => {
    expect(mock).toHaveBeenCalled()
  })
  await waitFor(() => {
    expect(screen.getByRole('status')).toHaveTextContent(
      'Successfully updated cost center. Please add some resources via the API to start tracking costs.',
    )
  })
})

test('Renders costCenter prop value for name input when azure subscription id was not added', () => {
  const costCenter = {
    costCenterKey: {
      customerId: '1',
      targetType: CostCenterType.GitHubEnterpriseCustomer,
      targetId: '1',
      uuid: 'test-uuid',
    },
    name: 'test-cost-center',
    resources: [],
  }

  SetupAndRenderComponent({
    action: 'new',
    adminRoles: ['owner'],
    costCenter,
    billingTarget: BillingTarget.Azure,
    isCopilotStandalone: false,
  })
  const nameInput = screen.getByRole('textbox', {name: /Cost Center Name Input \*/i})
  expect(nameInput).toHaveValue('test-cost-center')
})

test('Renders localStorage value for name input when azure subscription id was added', () => {
  ;(useSearchParams as jest.Mock).mockImplementationOnce(() => [new URLSearchParams('dialog=true')])

  const costCenter = {
    costCenterKey: {
      customerId: '1',
      targetType: CostCenterType.GitHubEnterpriseCustomer,
      targetId: '1',
      uuid: 'test-uuid',
    },
    name: 'test-cost-center',
    resources: [],
  }

  SetupAndRenderComponent({
    action: 'new',
    adminRoles: ['owner'],
    costCenter,
    billingTarget: BillingTarget.Azure,
    isCopilotStandalone: false,
  })
  const nameInput = screen.getByRole('textbox', {name: /Cost Center Name Input \*/i})
  expect(nameInput).toHaveValue('test-cost-center-localStorage')
})
