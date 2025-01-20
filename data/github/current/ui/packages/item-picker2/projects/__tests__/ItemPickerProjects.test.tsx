import {act, screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {RelayEnvironmentProvider} from 'react-relay'
import {Button} from '@primer/react'
import {SelectPanel} from '@primer/react/drafts'
import {useRef, useState} from 'react'
import {Wrapper, render} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'

import {mockProjectsResolvers, resetHelperId} from './helper'
import {ItemPickerProjects, type ItemPickerProjectsProps} from '../ItemPickerProjects'

import type {ItemPickerProjectsTestQuery as ItemPickerProjectsTestQueryType} from './__generated__/ItemPickerProjectsTestQuery.graphql'
import type {ItemPickerProjectsList_Query} from '../__generated__/ItemPickerProjectsList_Query.graphql'

type ItemPickerProjectsExampleComponentProps = Partial<
  Pick<
    ItemPickerProjectsProps,
    | 'owner'
    | 'repo'
    | 'onSubmit'
    | 'open'
    | 'secondaryActions'
    | 'hasError'
    | 'shortcutEnabled'
    | 'selectedProjectsV2Key'
    | 'selectedClassicProjectsKey'
    | 'selectedClassicProjectCardsKey'
    | 'maxSelectableItems'
  >
>

function ItemPickerProjectsExampleComponent({
  owner = 'owner',
  repo = 'repo',
  ...args
}: ItemPickerProjectsExampleComponentProps) {
  const projectsButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(args.open || false)
  return (
    <>
      <Button
        ref={projectsButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        open
      </Button>

      <ItemPickerProjects
        title="title"
        owner={owner}
        repo={repo}
        {...args}
        projectsButtonRef={projectsButtonRef}
        open={open}
        setOpen={setOpen}
        includeClassicProjects={true}
      />
    </>
  )
}

const ItemPickerProjectsTestQuery = graphql`
  query ItemPickerProjectsTestQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        projectsV2(first: 10) {
          ...ItemPickerProjects_SelectedProjectsV2Fragment
        }
        projectCards(first: 10) {
          ...ItemPickerProjects_SelectedClassicProjectCardsFragment
        }
      }
    }
  }
`

const setup = (
  args?: {
    repositoryProjectsV2Count?: number
    repositoryClassicProjectsCount?: number
    organizationProjectsV2Count?: number
    organizationClassicProjectsCount?: number
    selectedProjectsV2Count?: number
    selectedClassicProjectsCount?: number
    totalRepositoryProjectsV2Count?: number
    totalOrganizationProjectsV2Count?: number
  } & ItemPickerProjectsExampleComponentProps,
) => {
  const mockOnSubmit = jest.fn()
  const {
    repositoryProjectsV2Count,
    repositoryClassicProjectsCount,
    organizationProjectsV2Count,
    organizationClassicProjectsCount,
    selectedProjectsV2Count,
    selectedClassicProjectsCount,
    totalRepositoryProjectsV2Count,
    totalOrganizationProjectsV2Count,
    ...props
  } = args || {}

  const {relayMockEnvironment, user} = renderRelay<{
    rootQuery: ItemPickerProjectsTestQueryType
    listQuery: ItemPickerProjectsList_Query
  }>(
    ({queryData}) => (
      <ItemPickerProjectsExampleComponent
        selectedProjectsV2Key={queryData.rootQuery.repository?.issue?.projectsV2}
        selectedClassicProjectCardsKey={queryData.rootQuery.repository?.issue?.projectCards}
        open
        onSubmit={mockOnSubmit}
        {...props}
      />
    ),
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: ItemPickerProjectsTestQuery,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
          listQuery: {
            type: 'lazy',
          },
        },
        mockResolvers: mockProjectsResolvers(
          repositoryProjectsV2Count,
          repositoryClassicProjectsCount,
          organizationProjectsV2Count,
          organizationClassicProjectsCount,
          selectedProjectsV2Count,
          selectedClassicProjectsCount,
          totalRepositoryProjectsV2Count,
          totalOrganizationProjectsV2Count,
        ),
      },
    },
  )

  return {environment: relayMockEnvironment, mockOnSubmit, user}
}

describe('ItemPickerProjects', () => {
  jest.useFakeTimers()

  beforeEach(() => {
    resetHelperId()
  })

  it('Renders three projects', () => {
    setup({
      selectedProjectsV2Count: 0,
      selectedClassicProjectsCount: 0,
      repositoryProjectsV2Count: 3,
      repositoryClassicProjectsCount: 3,
      organizationProjectsV2Count: 3,
      organizationClassicProjectsCount: 3,
    })
    expect(screen.getByText('repository classic project 0')).toBeInTheDocument()
    expect(screen.getByText('repository classic project 1')).toBeInTheDocument()
    expect(screen.getByText('repository classic project 2')).toBeInTheDocument()
    expect(screen.getByText('repository project v2 0')).toBeInTheDocument()
    expect(screen.getByText('repository project v2 1')).toBeInTheDocument()
    // "repository project v2 1" does not show because we're slicing by 5 so we only show the top 5 repo projects
    expect(screen.getByText('org classic project 0')).toBeInTheDocument()
    expect(screen.getByText('org classic project 1')).toBeInTheDocument()
    expect(screen.getByText('org classic project 2')).toBeInTheDocument()
    expect(screen.getByText('org project v2 0')).toBeInTheDocument()
    expect(screen.getByText('org project v2 1')).toBeInTheDocument()
    // "org project v2 2" does not show because we're slicing by 5 so we only show the top 5 org projects
  })

  it('Renders loading state', () => {
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerProjectsExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    const loadingState = screen.getAllByTestId('loading-skeleton')
    expect(loadingState[0]).toBeVisible()
  })

  it('Renders secondary action when consumer passes it to the item picker project component', () => {
    const {environment} = createRelayMockEnvironment()

    const secondaryActionButton = (
      <SelectPanel.SecondaryAction variant="button" data-testid="secondary-action-button">
        Edit projects
      </SelectPanel.SecondaryAction>
    )

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerProjectsExampleComponent open secondaryActions={secondaryActionButton} />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByTestId('secondary-action-button')).toBeInTheDocument()
  })

  it('Sends the data with project type on submit', async () => {
    const {mockOnSubmit, user} = setup({
      repositoryProjectsV2Count: 1,
      repositoryClassicProjectsCount: 1,
      organizationProjectsV2Count: 0,
      organizationClassicProjectsCount: 0,
      selectedProjectsV2Count: 0,
      selectedClassicProjectsCount: 0,
      totalRepositoryProjectsV2Count: 0,
      totalOrganizationProjectsV2Count: 0,
    })

    // select another project from the list
    await user.type(screen.getByRole('option', {name: 'repository project v2 0'}), '{Space}')
    await user.type(screen.getByRole('option', {name: 'repository classic project 0'}), '{Space}')

    const saveButton = screen.getByRole('button', {name: 'Save'})
    await user.click(saveButton)

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    expect(mockOnSubmit).toHaveBeenCalledWith([
      {id: '5', additionalInfo: {__typename: 'ProjectV2', closed: false, title: 'repository project v2 0'}},
      {
        id: '3',
        additionalInfo: {
          __typename: 'Project',
          closed: false,
          title: 'repository classic project 0',
        },
      },
    ])
  })

  it('Does not render the same project more than once', () => {
    const mockOnSubmit = jest.fn()

    renderRelay<{
      rootQuery: ItemPickerProjectsTestQueryType
      listQuery: ItemPickerProjectsList_Query
    }>(
      ({queryData}) => (
        <ItemPickerProjectsExampleComponent
          selectedProjectsV2Key={queryData.rootQuery.repository?.issue?.projectsV2}
          selectedClassicProjectCardsKey={queryData.rootQuery.repository?.issue?.projectCards}
          open
          onSubmit={mockOnSubmit}
        />
      ),
      {
        wrapper: Wrapper,
        relay: {
          queries: {
            rootQuery: {
              query: ItemPickerProjectsTestQuery,
              type: 'fragment',
              variables: {owner: 'owner', repo: 'repo', number: 1},
            },
            listQuery: {
              type: 'lazy',
            },
          },
          mockResolvers: {
            Issue() {
              return {
                projectItemsNext: {
                  nodes: [],
                },
                projectCards: {
                  nodes: [],
                },
              }
            },
            Repository() {
              return {
                projects: {
                  nodes: [],
                },
                projectsV2: {
                  nodes: [
                    // repository project that was also recently interacted with
                    {
                      id: '1',
                      title: 'repository project v2 1',
                      closed: false,
                    },
                    {
                      id: '2',
                      title: 'repository project v2 2',
                      closed: false,
                    },
                  ],
                },
                owner: {
                  projects: {
                    nodes: [],
                  },
                  // duplicate project from repository project
                  projectsV2: {
                    nodes: [
                      {
                        id: '1',
                        title: 'repository project v2 1',
                        closed: false,
                      },
                    ],
                  },
                },
              }
            },
          },
        },
      },
    )
    expect(screen.getAllByRole('option', {name: 'repository project v2 1'})).toHaveLength(1)
    expect(screen.getAllByRole('option', {name: 'repository project v2 2'})).toHaveLength(1)
  })

  it('Enable v2 projects that have less than max number of items', () => {
    setup({repositoryProjectsV2Count: 3, totalRepositoryProjectsV2Count: 600})
    expect(screen.getByRole('option', {name: 'repository project v2 0'})).toBeEnabled()
  })

  it('Disables v2 projects that have more than max number of items', () => {
    setup({repositoryProjectsV2Count: 3, totalRepositoryProjectsV2Count: 1200})
    expect(screen.getByRole('option', {name: 'repository project v2 0'})).toHaveAttribute('aria-disabled', 'true')
  })

  it('Shows the correct group headers', () => {
    setup({repositoryProjectsV2Count: 1, organizationProjectsV2Count: 1})

    expect(screen.getByRole('group', {name: 'Repository'})).toBeInTheDocument()
    expect(screen.getByRole('group', {name: 'Organization'})).toBeInTheDocument()
  })

  it('displays an error message when the max number of items is reached', () => {
    setup({repositoryProjectsV2Count: 3, selectedProjectsV2Count: 0, maxSelectableItems: 1})

    act(() => screen.getByRole('option', {name: 'repository project v2 0', selected: false}).click())

    expect(screen.getByText('You can select up to 1 project(s).')).toBeInTheDocument()
  })
})

describe('ItemPickerProjects Keyboard interaction tests', () => {
  jest.useFakeTimers()

  it('user can tab between elements when the list is open', async () => {
    const {user} = setup({selectedProjectsV2Count: 0, selectedClassicProjectsCount: 0})

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveFocus() // search input should be the first focused element when dialog is opened

    // type something in the search input box to render clear input button
    await user.type(searchInput, 'recent')
    act(() => jest.runAllTimers())

    const clearInputButton = screen.getByRole('button', {name: 'Clear'})
    const cancelButton = screen.getByRole('button', {name: 'Cancel'})
    const saveButton = screen.getByRole('button', {name: 'Save'})
    const closeButton = screen.getByRole('button', {name: 'Close'})
    const project0Button = screen.getByRole('option', {name: 'repository classic project 0'})

    await user.tab({shift: true})
    expect(closeButton).toHaveFocus()
    await user.tab()
    expect(searchInput).toHaveFocus()
    await user.tab()
    expect(clearInputButton).toHaveFocus()
    await user.tab()
    expect(project0Button).toHaveFocus()
    await user.tab()
    expect(cancelButton).toHaveFocus()
    await user.tab()
    expect(saveButton).toHaveFocus()
  })

  it('arrow up/down key to navigate between items in the action list', async () => {
    const {user} = setup({
      selectedProjectsV2Count: 0,
      selectedClassicProjectsCount: 0,
      repositoryProjectsV2Count: 1,
      repositoryClassicProjectsCount: 1,
      organizationProjectsV2Count: 1,
      organizationClassicProjectsCount: 1,
    })
    act(() => screen.getByRole('option', {name: 'repository classic project 0'}).focus())
    expect(screen.getByRole('option', {name: 'repository classic project 0'})).toHaveFocus()

    // ArrowUp when focused on first element in list should't do anything
    await user.keyboard('[ArrowUp]')
    expect(screen.getByRole('option', {name: 'repository classic project 0'})).toHaveFocus()

    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'repository project v2 0'})).toHaveFocus()
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'org classic project 0'})).toHaveFocus()
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'org project v2 0'})).toHaveFocus()

    // ArrowDown after last element in list should't do anything
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('option', {name: 'org project v2 0'})).toHaveFocus()
  })

  it('Space selects the item inside the list box', async () => {
    const {user} = setup({
      selectedProjectsV2Count: 0,
      selectedClassicProjectsCount: 0,
      repositoryProjectsV2Count: 1,
      repositoryClassicProjectsCount: 1,
    })
    expect(screen.getByRole('textbox')).toHaveFocus()
    await user.keyboard('[ArrowDown]')

    const firstItem = screen.getByRole('option', {name: 'repository classic project 0'})
    const secondItem = screen.getByRole('option', {name: 'repository project v2 0'})

    expect(firstItem).toHaveFocus()
    expect(firstItem).toHaveAttribute('aria-selected', 'false') // not selected at first

    await user.type(firstItem, '{Space}')
    expect(firstItem).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('[ArrowDown]')
    expect(secondItem).toHaveFocus()

    expect(secondItem).toHaveAttribute('aria-selected', 'false')
    await user.type(secondItem, '{Space}')
    expect(secondItem).toHaveAttribute('aria-selected', 'true')
  })
})

describe('ItemPickerProjects Search', () => {
  it('Searches server side when user types a query', async () => {
    const {environment, user} = setup({selectedProjectsV2Count: 0, selectedClassicProjectsCount: 0})

    const searchInput = screen.getByTestId('item-picker-search-input')

    await user.type(searchInput, 'test')

    act(() => jest.runAllTimers())

    const searchSpinner = screen.getByTestId('item-picker-search-loading')
    expect(searchSpinner).toBeVisible()

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.node.name).toEqual('ItemPickerProjectsList_Query')
        return MockPayloadGenerator.generate(operation)
      })
    })

    expect(searchSpinner).not.toBeVisible()
  })

  it('correctly filters projects when searching', async () => {
    const {environment, user} = setup({})
    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(screen.getByRole('option', {name: 'repository classic project 0', selected: false})).toBeInTheDocument()
    expect(screen.getByRole('option', {name: 'repository project v2 0', selected: false})).toBeInTheDocument()
    expect(screen.getByRole('option', {name: 'org classic project 0', selected: false})).toBeInTheDocument()
    expect(screen.getByRole('option', {name: 'org project v2 0', selected: false})).toBeInTheDocument()

    await user.type(searchInput, 'classic')
    act(() => jest.runAllTimers())
    const searchSpinner = screen.getByTestId('item-picker-search-loading')
    expect(searchSpinner).toBeVisible()

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, mockProjectsResolvers())
      })
    })

    expect(screen.getByRole('option', {name: 'repository classic project 0', selected: false})).toBeInTheDocument()
    expect(screen.getByRole('option', {name: 'org classic project 0', selected: false})).toBeInTheDocument()
    expect(screen.queryByRole('option', {name: 'recent project v2 0', selected: false})).not.toBeInTheDocument()
    expect(screen.queryByRole('option', {name: 'repository project v2 0', selected: false})).not.toBeInTheDocument()
    expect(screen.queryByRole('option', {name: 'org project v2 0', selected: false})).not.toBeInTheDocument()
  })

  it('sorts the search by most recently updated', async () => {
    const {environment, user} = setup({selectedProjectsV2Count: 0, selectedClassicProjectsCount: 0})
    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(screen.getByRole('option', {name: 'repository classic project 0', selected: false})).toBeInTheDocument()
    expect(screen.getByRole('option', {name: 'repository project v2 0', selected: false})).toBeInTheDocument()
    expect(screen.getByRole('option', {name: 'org classic project 0', selected: false})).toBeInTheDocument()
    expect(screen.getByRole('option', {name: 'org project v2 0', selected: false})).toBeInTheDocument()

    await user.type(searchInput, 'project')
    act(() => jest.runAllTimers())
    const searchSpinner = screen.getByTestId('item-picker-search-loading')
    expect(searchSpinner).toBeVisible()

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          Repository() {
            return {
              projects: {
                nodes: [
                  {
                    updatedAt: '2024-01-01T00:00:00Z', // oldest
                    id: '1',
                    title: `repository classic project 0`,
                    closed: false,
                    columns: {
                      edges: [
                        {
                          node: {
                            id: '100',
                          },
                        },
                      ],
                    },
                  },
                ],
              },
              projectsV2: {
                nodes: [
                  {
                    updatedAt: '2024-01-02T00:00:00Z',
                    id: '2',
                    title: `repository project v2 0`,
                    closed: false,
                    items: {totalCount: 1},
                  },
                ],
              },

              owner: {
                projects: {
                  nodes: [
                    {
                      updatedAt: '2024-01-03T00:00:00Z',
                      id: '3',
                      title: `org classic project 0`,
                      closed: false,
                      columns: {
                        edges: [
                          {
                            node: {
                              id: '300',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
                projectsV2: {
                  edges: [
                    {
                      node: {
                        updatedAt: '2024-01-04T00:00:00Z', // most recent
                        id: '4',
                        title: `org project v2 0`,
                        closed: false,
                        items: {totalCount: 1},
                      },
                    },
                  ],
                },
              },
            }
          },
        })
      })
    })

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(options[0]).toHaveAccessibleName('org project v2 0')
    expect(options[1]).toHaveAccessibleName('org classic project 0')
    expect(options[2]).toHaveAccessibleName('repository project v2 0')
    expect(options[3]).toHaveAccessibleName('repository classic project 0')
  })
})

describe('ItemPickerProjects Error handling', () => {
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    // eslint-disable-next-line no-console
    originalConsoleError = console.error
    // eslint-disable-next-line no-console
    console.error = jest.fn()
  })

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = originalConsoleError
    jest.restoreAllMocks()
  })

  it('should show an error message when the hasError prop is set to true', async () => {
    const {environment} = createRelayMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerProjectsExampleComponent open hasError />
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText(/One or more projects do not exist/i)).toBeInTheDocument()
  })

  it('should show load error panel when the fetch for the repo projects fails', async () => {
    const {environment} = createRelayMockEnvironment()
    const MockError = new Error('An error occurred')

    // Mock the list fetch
    environment.mock.queueOperationResolver(() => MockError)

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ItemPickerProjectsExampleComponent open />
      </RelayEnvironmentProvider>,
    )

    // Error message in panel is broken up into two elements
    expect(screen.getByText(/We couldn't load the projects/i).textContent).toBe("We couldn't load the projects.")
    expect(screen.getByText(/Try again/i)).toBeInTheDocument()

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(() => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })

  it('should show an error banner when the fetch for the repo projects fails with a user search query', async () => {
    const {environment, user} = setup({selectedProjectsV2Count: 0, selectedClassicProjectsCount: 0})
    expect(screen.getByRole('option', {name: 'repository classic project 0'})).toBeVisible()

    const searchInput = screen.getByTestId('item-picker-search-input')
    await user.type(searchInput, 'project 0')
    act(() => jest.runAllTimers())
    const MockError = new Error('An error occurred')

    await act(async () => {
      environment.mock.rejectMostRecentOperation(() => MockError)
    })

    // Error message in banner is one element
    expect(screen.getByText(/We couldn't load the projects/i).textContent).toBe(
      "We couldn't load the projects. Try again or if the problem persists, contact support",
    )

    // we re-throw errors out of band in order to report them to Sentry
    try {
      await act(() => jest.runAllTimers())
      throw new Error('An error should have been thrown')
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBe(MockError)
    }
  })
})

describe('ItemPickerProjects Shortcut', () => {
  it('should open panel and focus on the search input when the "p" key is pressed', async () => {
    const {user} = setup({selectedProjectsV2Count: 0, selectedClassicProjectsCount: 0, open: false})

    await user.keyboard('p')

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveFocus()
  })
  it('should reopen panel and focus on the search input when the "p" key is pressed after closing panel', async () => {
    const {user} = setup({selectedProjectsV2Count: 0, selectedClassicProjectsCount: 0, open: false})

    await user.keyboard('p')
    await user.keyboard('{Escape}')
    await user.keyboard('p')

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveFocus()
  })

  it('should not open panel when the "p" key is pressed and shortcuts are disabled', async () => {
    const {user} = setup({
      selectedProjectsV2Count: 0,
      selectedClassicProjectsCount: 0,
      open: false,
      shortcutEnabled: false,
    })

    await user.keyboard('p')

    expect(screen.queryByTestId('item-picker-search-input')).not.toBeInTheDocument()
  })

  it('should not open panel when other shortcut keys are pressed', async () => {
    const {user} = setup({
      selectedProjectsV2Count: 0,
      selectedClassicProjectsCount: 0,
      open: false,
      shortcutEnabled: false,
    })

    await user.keyboard('l m a d')

    expect(screen.queryByTestId('item-picker-search-input')).not.toBeInTheDocument()
  })

  it('should not trigger shortcut when panel is already open and the "p" key is pressed', async () => {
    const {user} = setup({selectedProjectsV2Count: 0, selectedClassicProjectsCount: 0, open: false})

    await user.keyboard('p')

    await user.keyboard('platypus')

    const searchInput = screen.getByTestId('item-picker-search-input')
    expect(searchInput).toHaveValue('platypus')
  })
})
