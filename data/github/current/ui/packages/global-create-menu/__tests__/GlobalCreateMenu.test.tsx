import {act, screen, within, waitFor} from '@testing-library/react'
import {GlobalCreateMenu, type GlobalCreateMenuProps} from '../GlobalCreateMenu'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'react-relay'
import {buildMockRepository} from '@github-ui/issue-create/__tests__/helpers'

function getMenuItems() {
  const items = screen.getAllByRole('menuitem')
  return items.map(item => item.textContent)
}

async function renderWithProps(
  props: GlobalCreateMenuProps,
  relay: Parameters<typeof renderRelay>[1]['relay'] = {queries: {}},
) {
  renderRelay(({relayMockEnvironment}) => <GlobalCreateMenu {...props} environment={relayMockEnvironment} />, {
    relay,
    wrapper: Wrapper,
  })
  const anchor = await screen.findByRole('button', {name: 'Create New...'})
  act(() => anchor.click()) // Open the menu
  const items = screen.getAllByRole('menuitem')
  for (const item of items) {
    // prevent navigation since jest doesn't support it
    item.addEventListener('click', event => event.preventDefault())
  }
}

const mockedRepos = [
  buildMockRepository({owner: 'orgA', name: 'repoA1', id: 'repoA1_id'}),
  buildMockRepository({owner: 'orgA', name: 'repoA2', id: 'repoA2_id'}),
  buildMockRepository({owner: 'orgB', name: 'repoB1', id: 'repoB1_id'}),
] as const

const repositoryPickerTopRepositoriesQuery = graphql`
  query GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery @relay_test_operation {
    viewer {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...RepositoryPickerTopRepositories @arguments(topRepositoriesFirst: 5, hasIssuesEnabled: true, owner: null)
    }
  }
`

const repositoryAndTemplatePickerDialogQuery = graphql`
  query GlobalCreateMenuTestRepositoryAndTemplatePickerDialogQuery($id: ID!) @relay_test_operation {
    node(id: $id) {
      ... on Repository {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...RepositoryPickerRepositoryIssueTemplates
      }
    }
  }
`

const repositoryPickerCurrentRepoQuery = graphql`
  query GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery(
    $owner: String!
    $name: String!
    $includeTemplates: Boolean = false
  ) @relay_test_operation {
    repository(owner: $owner, name: $name) {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...RepositoryPickerRepository
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...RepositoryPickerRepositoryIssueTemplates @include(if: $includeTemplates)
    }
  }
`

describe('GlobalCreateMenu', () => {
  beforeAll(async () => {
    // preload CreateIssueDialog to prevent timeout when lazy-loading component within tests
    await import('../CreateIssueDialog')
  })

  test('With minimal options', async () => {
    await renderWithProps({})
    expect(getMenuItems()).toEqual(['New repository'])
  })

  test('With import repo', async () => {
    await renderWithProps({
      importRepo: true,
    })
    expect(getMenuItems()).toEqual(['New repository', 'Import repository'])
  })

  test('With codespaces', async () => {
    await renderWithProps({
      codespaces: true,
    })
    expect(getMenuItems()).toEqual(['New repository', 'New codespace'])
  })

  test('With gist', async () => {
    await renderWithProps({
      gist: true,
    })
    expect(getMenuItems()).toEqual(['New repository', 'New gist'])
  })

  test('With ability to create an org', async () => {
    await renderWithProps({
      createOrg: true,
    })
    expect(getMenuItems()).toEqual(['New repository', 'New organization'])
  })

  test('With ability to create a legacy project', async () => {
    await renderWithProps({
      createLegacyProject: true,
    })
    expect(getMenuItems()).toEqual(['New repository', 'New project'])
  })

  test('With ability to create an issue', async () => {
    await renderWithProps(
      {
        createIssue: true,
        createRepo: false,
      },
      {
        queries: {
          repositoryPickerTopRepositoriesQuery: {
            query: repositoryPickerTopRepositoriesQuery,
            type: 'fragment',
            variables: {},
          },
          repositoryAndTemplatePickerDialogQuery: {
            query: repositoryAndTemplatePickerDialogQuery,
            type: 'fragment',
            variables: {id: 'mocked-repo-id'},
          },
        },
        mockResolvers: {
          RepositoryConnection() {
            return {
              edges: [{node: mockedRepos[0]}],
            }
          },
          Query() {
            return {node: mockedRepos[0]}
          },
        },
      },
    )
    expect(getMenuItems()).toEqual(['New issue'])

    act(() => screen.getByRole('menuitem', {name: 'New issue'}).click())

    const dialog = await screen.findByRole('dialog', {name: 'Create new issue'})
    expect(dialog).toBeVisible()
    await waitFor(() =>
      expect(within(dialog).getByRole('button', {name: 'Select repository'})).toHaveTextContent(
        mockedRepos[0].nameWithOwner,
      ),
    )
  })

  test('With ability to create an issue on a specific repo', async () => {
    const [owner, repo] = mockedRepos[2].nameWithOwner.split('/')

    await renderWithProps(
      {
        createIssue: true,
        owner,
        repo,
      },
      {
        queries: {
          repositoryPickerTopRepositoriesQuery: {
            query: repositoryPickerTopRepositoriesQuery,
            type: 'fragment',
            variables: {},
          },
          repositoryAndTemplatePickerDialogQuery: {
            query: repositoryAndTemplatePickerDialogQuery,
            type: 'fragment',
            variables: {id: 'mocked-repo-id'},
          },
          repositoryPickerCurrentRepoQuery: {
            query: repositoryPickerCurrentRepoQuery,
            type: 'fragment',
            variables: {owner, name: repo, includeTemplates: true},
          },
        },
        mockResolvers: {
          RepositoryConnection() {
            return {
              edges: [{node: mockedRepos[0]}, {node: mockedRepos[1]}, {node: mockedRepos[2]}],
            }
          },
          Query() {
            return {node: mockedRepos[0]}
          },
          Repository(ctx) {
            if (ctx.name === 'repository') {
              return mockedRepos[2]
            }
          },
        },
      },
    )
    expect(getMenuItems()).toEqual(['New issue', 'New repository'])

    act(() => screen.getByRole('menuitem', {name: 'New issue'}).click())

    const dialog = await screen.findByRole('dialog', {name: 'Create new issue'})
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole('button', {name: 'Select repository'})).toHaveTextContent(
      mockedRepos[2].nameWithOwner,
    )
  })

  test('With ability to create a project', async () => {
    const createProjectUrl = '/monalisa?tab=projects'
    await renderWithProps({
      createProject: true,
      createProjectUrl,
    })
    expect(getMenuItems()).toEqual(['New repository', 'New project'])
    expect(screen.getByRole('menuitem', {name: 'New project'})).toHaveAttribute('href', createProjectUrl)
  })

  test('As an org admin', async () => {
    await renderWithProps({
      org: {
        login: 'my-org',
        addWord: 'Invite',
      },
    })
    expect(getMenuItems()).toEqual([
      'New repository',
      'Invite someone to my-org',
      'New team in my-org',
      'New repository in my-org',
    ])
  })

  test('As an org non-admin', async () => {
    await renderWithProps({
      org: null,
    })
    expect(getMenuItems()).toEqual(['New repository'])
  })

  test('With all options', async () => {
    await renderWithProps({
      createIssue: true,
      importRepo: true,
      codespaces: true,
      gist: true,
      createOrg: true,
      createLegacyProject: true,
      org: {
        login: 'some-org',
        addWord: 'Add',
      },
    })
    expect(getMenuItems()).toEqual([
      'New issue',
      'New repository',
      'Import repository',
      'New codespace',
      'New gist',
      'New organization',
      'New project',
      'Add someone to some-org',
      'New team in some-org',
      'New repository in some-org',
    ])
  })

  test('sends analytics events on click', async () => {
    await renderWithProps({
      createIssue: false,
      importRepo: true,
      codespaces: true,
      gist: true,
      createOrg: true,
      createProject: true,
      createProjectUrl: '/monalisa?tab=projects',
      org: {
        login: 'some-org',
        addWord: 'Add',
      },
    })

    const targets = [
      {text: 'New repository', label: 'new repository'},
      {text: 'Import repository', label: 'import repository'},
      {text: 'New codespace', label: 'new codespace'},
      {text: 'New gist', label: 'new gist'},
      {text: 'New organization', label: 'new organization'},
      {text: 'New project', label: 'new project'},
      {text: 'Add someone to some-org', label: 'invite someone'},
      {text: 'New team in some-org', label: 'new team'},
      {text: 'New repository in some-org', label: 'organization - new repository'},
    ]

    for (const target of targets) {
      const item = screen.getByText(target.text)
      await act(() => item.click())
    }

    expectAnalyticsEvents(
      ...targets.map(target => ({
        type: 'analytics.click',
        data: {category: 'SiteHeaderComponent', action: 'add_dropdown', label: target.label},
      })),
    )
  })

  test('sends analytics events on click for issue creation', async () => {
    await renderWithProps({
      createIssue: true,
    })
    const item = screen.getByText('New issue')
    // prevent navigation since jest doesn't support it
    item.addEventListener('click', event => event.preventDefault())
    await act(() => item.click())

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {category: 'SiteHeaderComponent', action: 'add_dropdown', label: 'new issue'},
    })
  })

  test('sends analytics events on click for legacy projects', async () => {
    await renderWithProps({
      createLegacyProject: true,
    })
    const item = screen.getByText('New project')
    // prevent navigation since jest doesn't support it
    item.addEventListener('click', event => event.preventDefault())
    await act(() => item.click())

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {category: 'SiteHeaderComponent', action: 'add_dropdown', label: 'new legacy project'},
    })
  })
})
