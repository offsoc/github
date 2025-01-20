import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {EditIssueProjectsSection} from '../ProjectsSection'
import {
  type OperationDescriptor,
  RelayEnvironmentProvider,
  useQueryLoader,
  usePreloadedQuery,
  type PreloadedQuery,
  graphql,
} from 'react-relay'
import {useEffect} from 'react'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {ProjectPickerGraphqlQuery} from '@github-ui/item-picker/ProjectPicker'
import type {ProjectsSectionQuery} from './__generated__/ProjectsSectionQuery.graphql'

const mockUseFeatureFlags = jest.fn().mockReturnValue({})
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
}))

beforeEach(() => {
  mockUseFeatureFlags.mockClear()
})

const ProjectsSectionGraphqlQuery = graphql`
  query ProjectsSectionQuery($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issueOrPullRequest(number: $number) {
        ...ProjectsSectionFragment
      }
    }
  }
`

describe('Button conditional rendering for permissions', () => {
  // Mock issue identifier
  const owner = 'owner'
  const repo = 'repo'
  const number = 1

  const TestWrapper = () => {
    const [projectsRef, loadProjects, disposeProjects] =
      useQueryLoader<ProjectsSectionQuery>(ProjectsSectionGraphqlQuery)

    useEffect(() => {
      loadProjects({owner, repo, number})

      return () => {
        disposeProjects()
      }
    }, [disposeProjects, loadProjects])

    if (!projectsRef) return null

    return <TestInnerWrapper projectsRef={projectsRef} />
  }

  const TestInnerWrapper = ({projectsRef}: {projectsRef: PreloadedQuery<ProjectsSectionQuery>}) => {
    const data = usePreloadedQuery<ProjectsSectionQuery>(ProjectsSectionGraphqlQuery, projectsRef)

    if (!data.repository?.issueOrPullRequest) return null

    return (
      <EditIssueProjectsSection
        issueOrPullRequest={data.repository.issueOrPullRequest}
        singleKeyShortcutsEnabled={true}
      />
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockIssue = (environment: RelayMockEnvironment, overrides?: any, repositoryOverrides?: any) => {
    environment.mock.queuePendingOperation(ProjectsSectionGraphqlQuery, {owner, repo, number})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            id: 'repo_1',
            isArchived: false,
            issueOrPullRequest: {
              id: 'issue_1',
              projectItemsNext: {
                edges: [
                  {
                    node: {
                      id: 'project_item1',
                      project: {
                        title: 'Project 1',
                      },
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: 'd',
                },
              },
              projectCards: {
                edges: [
                  {
                    node: {
                      id: 'classic_project_item1',
                      project: {
                        id: 'classic_project1',
                        name: 'Classic Project 1',
                        title: 'Classic Project 1',
                      },
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: 'd',
                },
              },
              viewerCanUpdateNext: true,
              ...overrides,
            },
            ...repositoryOverrides,
          }
        },
      })
    })
  }

  const mockProjects = (environment: RelayMockEnvironment) => {
    environment.mock.queuePendingOperation(ProjectPickerGraphqlQuery, {owner, repo})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('ProjectPickerQuery')
      return MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            id: 'repo_1',
            projectsV2: {
              edges: [],
            },
            recentProjects: {
              edges: [],
            },
            owner: {
              projectsV2: {
                edges: [],
              },
              recentProjects: {
                edges: [],
              },
            },
          }
        },
      })
    })
  }

  test('renders edit button if user has update permissions', async () => {
    const environment = createMockEnvironment()
    mockIssue(environment, {
      viewerCanUpdateNext: true,
    })
    mockProjects(environment)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestWrapper />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText('Edit Projects')).toBeInTheDocument()
  })

  test('doesnt render edit button if user has no update permissions', async () => {
    const environment = createMockEnvironment()
    mockIssue(environment, {
      viewerCanUpdateMetadata: false,
    })
    mockProjects(environment)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestWrapper />
      </RelayEnvironmentProvider>,
    )

    expect(screen.queryByText('Edit Projects')).not.toBeInTheDocument()
  })

  test('render project on a writable issue', async () => {
    const environment = createMockEnvironment()
    mockIssue(environment, {
      viewerCanUpdateNext: true,
    })
    mockProjects(environment)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestWrapper />
      </RelayEnvironmentProvider>,
    )

    const section = screen.getByTestId('sidebar-projects-section')
    expect(section).toBeInTheDocument()
    expect(within(section).getByText('Project 1')).toBeVisible()
  })

  test('render project on a readonly issue', async () => {
    const environment = createMockEnvironment()
    mockIssue(environment, {
      viewerCanUpdateNext: false,
    })
    mockProjects(environment)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestWrapper />
      </RelayEnvironmentProvider>,
    )

    const section = screen.getByTestId('sidebar-projects-section')
    expect(section).toBeInTheDocument()
    expect(within(section).getByText('Project 1')).toBeVisible()
  })

  test('doesnt render edit button if repository is archived', async () => {
    const environment = createMockEnvironment()
    mockIssue(environment, {}, {isArchived: true})
    mockProjects(environment)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestWrapper />
      </RelayEnvironmentProvider>,
    )

    expect(screen.queryByText('Edit Projects')).not.toBeInTheDocument()
  })

  test('renders classic projects', async () => {
    const environment = createMockEnvironment()
    mockIssue(environment, {
      viewerCanUpdateNext: true,
    })
    mockProjects(environment)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestWrapper />
      </RelayEnvironmentProvider>,
    )

    const section = screen.getByTestId('sidebar-projects-section')
    expect(section).toBeInTheDocument()
    expect(within(section).getByText('Classic Project 1')).toBeVisible()
  })

  test('does not render classic projects when sunsetting projects classic', async () => {
    const environment = createMockEnvironment()
    mockIssue(environment, {
      viewerCanUpdateNext: true,
    })
    mockProjects(environment)

    mockUseFeatureFlags.mockReturnValue({projects_classic_sunset_ui: true, projects_classic_sunset_override: false})

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestWrapper />
      </RelayEnvironmentProvider>,
    )

    const section = screen.getByTestId('sidebar-projects-section')
    expect(section).toBeInTheDocument()
    expect(within(section).queryByText('Classic Project 1')).not.toBeInTheDocument()
  })
})
