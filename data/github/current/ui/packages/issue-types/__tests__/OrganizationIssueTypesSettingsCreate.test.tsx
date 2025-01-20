import {Suspense} from 'react'
import {screen} from '@testing-library/react'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import type {PreloadedQuery} from 'react-relay'
import {OrganizationIssueTypesSettingsCreate} from '../routes/OrganizationIssueTypesSettingsCreate'
import ORGANIZATION_ISSUE_TYPES_SETTINGS_CREATE_QUERY from '../routes/__generated__/OrganizationIssueTypesSettingsCreateQuery.graphql'
import type {OrganizationIssueTypesSettingsCreateQuery} from '../routes/__generated__/OrganizationIssueTypesSettingsCreateQuery.graphql'
import {commitCreateIssueTypeMutation} from '../mutations/create-issue-type-mutation'

import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {RESERVED_NAMES} from '../constants/constants'
import {Resources} from '../constants/strings'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {OrganizationPayload} from '../test-utils/types'

type OrganizationIssueTypesSettingsCreateWrapperProps = {
  organizationIssueTypesSettingsCreateQueryRef: PreloadedQuery<OrganizationIssueTypesSettingsCreateQuery>
}

const owner = 'owner'

const urlParams = {
  organization_id: owner,
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

const navigateMock = jest.fn()
jest.mock('@github-ui/use-navigate', () => ({
  useNavigate: (params: unknown) => navigateMock(params),
}))
jest.mock('@github-ui/ssr-utils', () => ({
  ...jest.requireActual('@github-ui/ssr-utils'),
  ssrSafeWindow: {
    ...jest.requireActual('@github-ui/ssr-utils').ssrSafeWindow,
    location: {
      href: 'base-url',
    },
  },
}))

jest.mock('../mutations/create-issue-type-mutation')
const mockedCreateIssueTypeMutation = jest.mocked(commitCreateIssueTypeMutation)

afterEach(() => {
  jest.clearAllMocks()
})

function renderTestComponent(returnPayload?: Partial<OrganizationPayload>) {
  return renderRelay<{
    organizationIssueTypesSettingsCreateQuery: OrganizationIssueTypesSettingsCreateQuery
  }>(
    ({queryRefs: {organizationIssueTypesSettingsCreateQuery}}) => (
      <OrganizationIssueTypesSettingsCreateWrapper
        organizationIssueTypesSettingsCreateQueryRef={organizationIssueTypesSettingsCreateQuery}
      />
    ),
    {
      relay: {
        queries: {
          organizationIssueTypesSettingsCreateQuery: {
            type: 'preloaded',
            query: ORGANIZATION_ISSUE_TYPES_SETTINGS_CREATE_QUERY,
            variables: {
              organization_id: owner,
            },
          },
        },

        mockResolvers: {
          Organization() {
            return {
              id: 'O_123',
              login: owner,
              ...returnPayload?.organization,
            }
          },
          User() {
            return {
              isEnterpriseManagedUser: false,
            }
          },
          IssueTypeConnection() {
            return {
              ...returnPayload?.issueTypes,
            }
          },
        },
      },
    },
  )
}

const OrganizationIssueTypesSettingsCreateWrapper = ({
  organizationIssueTypesSettingsCreateQueryRef,
}: OrganizationIssueTypesSettingsCreateWrapperProps) => {
  const entryProps = {
    extraProps: {},
    entryPoints: {},
    props: {},
    queries: {
      organizationIssueTypesSettingsCreateQuery: organizationIssueTypesSettingsCreateQueryRef,
    },
  }
  return (
    <Suspense fallback={'Loading...'}>
      <OrganizationIssueTypesSettingsCreate {...entryProps} />
    </Suspense>
  )
}

test('Renders OrganizationIssueTypesSettingsCreate with issue type being created', () => {
  renderTestComponent()

  expect(screen.getByRole('textbox', {name: 'Type name'})).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: 'Description'})).toBeInTheDocument()
  expect(screen.getByRole('checkbox', {name: 'Private repositories only'})).not.toBeChecked()
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

test('Hides the form when the limit of 10 issue types is reached', () => {
  renderTestComponent({
    issueTypes: {
      totalCount: 10,
      edges: [],
    },
  })

  expect(screen.queryByRole('textbox', {name: 'Type name'})).not.toBeInTheDocument()
  expect(screen.queryByRole('textbox', {name: 'Description'})).not.toBeInTheDocument()
})

test('Submitting the form creates the issue type (calls mutation)', async () => {
  const {user} = renderTestComponent()

  expect(screen.getByRole('textbox', {name: 'Type name'})).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: 'Description'})).toBeInTheDocument()

  const nameInput = await screen.findByTestId('issue-type-name')
  await user.type(nameInput, 'top secret type')

  const pinkRadio = screen.getByRole('radio', {name: 'Pink'})
  await user.click(pinkRadio)

  const createButton = await screen.findByTestId('issue-type-confirm-button')
  await user.click(createButton)

  expect(mockedCreateIssueTypeMutation).toHaveBeenCalledTimes(1)
  expect(mockedCreateIssueTypeMutation).toHaveBeenCalledWith(
    expect.objectContaining({
      input: expect.objectContaining({
        name: 'top secret type',
        color: 'PINK',
      }),
    }),
  )
  expectAnalyticsEvents({
    type: 'org_issue_type.create',
    target: 'ORG_ISSUE_TYPE_CREATE_BUTTON',
    data: {
      app_name: 'issue_types',
      category: 'create',
      owner,
    },
  })
})

test('Cancelling the form does not create the issue type (does not call mutation)', async () => {
  const {user} = renderTestComponent()

  expect(screen.getByRole('textbox', {name: 'Type name'})).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: 'Description'})).toBeInTheDocument()

  const nameInput = await screen.findByTestId('issue-type-name')
  await user.type(nameInput, 'top secret type')

  const cancelButton = await screen.findByTestId('issue-type-cancel-button')
  await user.click(cancelButton)
  expect(mockedCreateIssueTypeMutation).toHaveBeenCalledTimes(0)
  expect(ssrSafeWindow!.location.href).toBe(`/organizations/${owner}/settings/issue-types`)
})

describe('error handling', () => {
  test('on reserved name', async () => {
    const {user} = renderTestComponent()

    const nameInput = await screen.findByTestId('issue-type-name')
    await user.type(nameInput, RESERVED_NAMES[0] as string)

    const createButton = await screen.findByTestId('issue-type-confirm-button')
    await user.click(createButton)

    expect(screen.getByText(Resources.nameNotAllowed)).toBeInTheDocument()
    expect(mockedCreateIssueTypeMutation).toHaveBeenCalledTimes(0)
  })

  test('when name empty', async () => {
    const {user} = renderTestComponent()

    const createButton = await screen.findByTestId('issue-type-confirm-button')
    await user.click(createButton)

    expect(screen.getByText(Resources.nameEmptyErrorMessage)).toBeInTheDocument()
    expect(mockedCreateIssueTypeMutation).toHaveBeenCalledTimes(0)
  })

  test('on duplicated name', async () => {
    const {user} = renderTestComponent({
      issueTypes: {
        totalCount: 1,
        edges: [
          {
            node: {
              id: 'IT_123',
              name: 'bug',
            },
          },
        ],
      },
    })

    const nameInput = await screen.findByTestId('issue-type-name')
    await user.type(nameInput, 'bug')

    const createButton = await screen.findByTestId('issue-type-confirm-button')
    await user.click(createButton)

    expect(screen.getByText(Resources.nameTakenError)).toBeInTheDocument()
    expect(mockedCreateIssueTypeMutation).toHaveBeenCalledTimes(0)
  })
})
