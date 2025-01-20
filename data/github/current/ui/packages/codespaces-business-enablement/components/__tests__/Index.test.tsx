import {screen, act} from '@testing-library/react'
import {Index} from '../Index'
import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'

// Forgo debounced update to query parameters when typing in the filter bar, which currently falls outside of the focus
// for this test. Using jest.useFakeTimers and jest.advanceTimersByTime does not work well when rendered inside of the AppContext,
// which involves many timer interactions.
jest.mock('@github/mini-throttle', () => ({
  ...jest.requireActual('@github/mini-throttle'),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    fn.flush = jest.fn()
    return fn
  }),
}))

const organizations = [
  {
    id: 1,
    displayLogin: 'org-1',
    path: '/orgs/org-1',
    avatarUrl: '/orgs/orgs-1/avatar',
    memberCount: 1,
    enablementStatus: 'disabled',
  },
]

const policy_input_list = [
  {
    text: 'Enable for all organizations',
    description: 'All organizations, including any created in the future, may use GitHub Codespaces.',
    replace_text: 'Enable for all organizations',
    confirm_message: 'This will enable codespaces for all organizations.',
    checked: false,
    name: 'enablement',
    value: 'all_entities',
    type: 'submit',
    disabled: false,
  },
  {
    text: 'Enable for specific organizations',
    description: 'Only specifically-selected organizations and public repositories may use GitHub Codespaces.',
    replace_text: 'Enable for specific organizations',
    confirm_message:
      'Any codespaces associated with private or internal repositories in the unselected organizations will be deleted.',
    checked: false,
    name: 'enablement',
    value: 'selected_entities',
    type: 'submit',
    disabled: false,
  },
  {
    text: 'Disabled',
    description: 'Only public repositories within this enterprise may use GitHub Codespaces.',
    replace_text: 'Disabled',
    confirm_message: 'All codespaces from internal and private repositories within your enterprise will be deleted.',
    checked: true,
    name: 'enablement',
    value: 'disabled',
    type: 'submit',
    disabled: false,
  },
]

describe('Index', () => {
  test('renders expected radio elements', () => {
    render(
      <Index
        policy_input_list={policy_input_list}
        initalOrganizations={organizations}
        submit_url={'/fake/submit'}
        search_url={'/fake/search'}
        initialPageCount={1}
        disable_form={false}
      />,
    )
    const orgSelect = screen.getByTestId('codespaces-settings-index')
    expect(orgSelect).toBeInTheDocument()
    expect(orgSelect).toHaveTextContent('Enable for specific organizations')
    expect(orgSelect).not.toHaveTextContent('org-1')
  })
  test('switching to selected orgs shows org list', async () => {
    const {user} = render(
      <Index
        policy_input_list={policy_input_list}
        initalOrganizations={organizations}
        submit_url={'/fake/submit'}
        search_url={'/fake/search'}
        initialPageCount={1}
        disable_form={false}
      />,
    )
    const orgSelect = screen.getByTestId('codespaces-settings-index')

    const radioButton = screen.getByTestId('codespaces-settings-selected_entities')
    await user.click(radioButton)
    expect(orgSelect).toHaveTextContent('org-1')
  })
  test('save button', async () => {
    const {user} = render(
      <Index
        policy_input_list={policy_input_list}
        initalOrganizations={organizations}
        submit_url={'/fake/submit'}
        search_url={'/fake/search'}
        initialPageCount={1}
        disable_form={false}
      />,
    )
    const orgSelect = screen.getByTestId('codespaces-settings-index')

    const radioButton = screen.getByTestId('codespaces-settings-selected_entities')
    await user.click(radioButton)
    const saveButton = await screen.findByText('Save')
    await user.click(saveButton)
    expect(orgSelect).toHaveTextContent(
      'Any codespaces associated with private or internal repositories in the unselected organizations will be deleted.',
    )
    const submitButton = await screen.findByText('Submit')
    await user.click(submitButton)
    await act(() => mockFetch.resolvePendingRequest('/fake/submit', {message: 'Updated successfully'}))

    expect(orgSelect).toHaveTextContent('Updated successfully')
  })
  test('search', async () => {
    const orgsResponse = [
      {
        id: 2,
        displayLogin: 'org-2',
        path: '/orgs/org-2',
        avatarUrl: '/orgs/orgs-2/avatar',
        memberCount: 1,
        enablementStatus: 'disabled',
      },
    ]
    const {user} = render(
      <Index
        policy_input_list={policy_input_list}
        initalOrganizations={organizations}
        submit_url={'/fake/submit'}
        search_url={'/fake/search'}
        initialPageCount={1}
        disable_form={false}
      />,
    )
    const orgSelect = screen.getByTestId('codespaces-settings-index')

    const radioButton = screen.getByTestId('codespaces-settings-selected_entities')
    await user.click(radioButton)
    const searchField = screen.getByTestId('query-text-input')
    await user.type(searchField, 'another-org')
    await act(() =>
      mockFetch.resolvePendingRequest('/fake/search?page=1&query=another-org', {pageCount: 1, orgs: orgsResponse}),
    )
    expect(orgSelect).toHaveTextContent('org-2')
  })
  test('pagination', async () => {
    const orgsResponse = [
      {
        id: 2,
        displayLogin: 'org-2',
        path: '/orgs/org-2',
        avatarUrl: '/orgs/orgs-2/avatar',
        memberCount: 1,
        enablementStatus: 'disabled',
      },
    ]
    const {user} = render(
      <Index
        policy_input_list={policy_input_list}
        initalOrganizations={organizations}
        submit_url={'/fake/submit'}
        search_url={'/fake/search'}
        initialPageCount={2}
        disable_form={false}
      />,
    )
    const orgSelect = screen.getByTestId('codespaces-settings-index')

    const radioButton = screen.getByTestId('codespaces-settings-selected_entities')
    await user.click(radioButton)
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    await act(() => mockFetch.resolvePendingRequest('/fake/search?page=2&query=', {pageCount: 2, orgs: orgsResponse}))
    expect(orgSelect).toHaveTextContent('org-2')
  })
})
