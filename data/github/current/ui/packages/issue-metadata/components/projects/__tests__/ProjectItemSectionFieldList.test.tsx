import {screen, act, fireEvent, render} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {RelayEnvironmentProvider, graphql, useLazyLoadQuery} from 'react-relay'
import {ProjectItemSectionFields} from '../ProjectItemSectionFields'
import type {ProjectItemSectionFieldListTestQuery} from './__generated__/ProjectItemSectionFieldListTestQuery.graphql'
import {ThemeProvider} from '@primer/react'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import {mockUrlCanParse} from '../../../test-utils/mocks'

const testQuery = graphql`
  query ProjectItemSectionFieldListTestQuery @relay_test_operation {
    node(id: 1) {
      ... on ProjectV2Item {
        ...ProjectItemSectionFields
      }
    }
  }
`

mockUrlCanParse()

describe('Optimistic updates are working', () => {
  test('ProjectV2ItemFieldTextValue - optimistic', async () => {
    const field = {
      id: '1',
      dataType: 'TEXT',
      __typename: 'ProjectV2Field',
      name: 'test',
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <div>
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </div>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldTextValue',
                      text: 'myValue',
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const textEditButton = screen.getByText('myValue')

    // perform update
    act(() => {
      textEditButton.click()
    })
    const newTextValue = 'newValue'
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    fireEvent.change(textInput, {target: {value: newTextValue}})
    const confirmBtn = screen.getByRole('button')
    expect(confirmBtn).toBeInTheDocument()
    act(() => {
      confirmBtn.click()
    })

    // verify optimistic update (since we didnt mock the result of the mutation)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText(newTextValue)).toBeInTheDocument()
  })

  test('ProjectV2ItemFieldNumberValue', async () => {
    const field = {
      id: '1',
      dataType: 'NUMBER',
      __typename: 'ProjectV2Field',
      name: 'test',
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <div>
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </div>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldNumberValue',
                      number: 666,
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const textEditButton = screen.getByText('666')

    // perform update
    act(() => {
      textEditButton.click()
    })
    const newTextValue = 733
    const textInput = screen.getByRole('spinbutton')
    expect(textInput).toBeInTheDocument()

    fireEvent.change(textInput, {target: {value: newTextValue}})
    const confirmBtn = screen.getByRole('button')
    expect(confirmBtn).toBeInTheDocument()
    act(() => {
      confirmBtn.click()
    })

    // verify optimistic update (since we didnt mock the result of the mutation)
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.getByText(newTextValue)).toBeInTheDocument()
  })

  test('ProjectV2ItemFieldNumberValue - abandon changes', async () => {
    const field = {
      id: '1',
      dataType: 'NUMBER',
      __typename: 'ProjectV2Field',
      name: 'test',
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <div>
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </div>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldNumberValue',
                      number: 666,
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const textEditButton = screen.getByText('666')

    // perform update
    act(() => {
      textEditButton.click()
    })
    const newTextValue = 733
    const textInput: HTMLInputElement = screen.getByRole('spinbutton')
    expect(textInput).toBeInTheDocument()

    fireEvent.change(textInput, {target: {value: newTextValue}})
    fireEvent.keyDown(textInput, {key: 'Escape'})

    expect(textInput).not.toHaveFocus()
    expect(textInput).not.toBeInTheDocument()
    expect(screen.getByText('666')).toBeInTheDocument()
  })

  test('ProjectV2ItemFieldTextValue', async () => {
    const field = {
      id: '1',
      dataType: 'TEXT',
      __typename: 'ProjectV2Field',
      name: 'test',
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <div>
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </div>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldTextValue',
                      text: 'before',
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const textEditButton = screen.getByText('before')

    // perform update
    act(() => {
      textEditButton.click()
    })
    const newTextValue = 'after'
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    fireEvent.change(textInput, {target: {value: newTextValue}})
    const confirmBtn = screen.getByRole('button')
    expect(confirmBtn).toBeInTheDocument()
    act(() => {
      confirmBtn.click()
    })

    // verify optimistic update (since we didnt mock the result of the mutation)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText(newTextValue)).toBeInTheDocument()
  })

  test('ProjectV2ItemFieldTextValue - abandon changes', async () => {
    const field = {
      id: '1',
      dataType: 'TEXT',
      __typename: 'ProjectV2Field',
      name: 'test',
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <div>
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </div>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldTextValue',
                      text: 'before',
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const textEditButton = screen.getByText('before')

    // perform update
    act(() => {
      textEditButton.click()
    })
    const newTextValue = 'after'
    const textInput: HTMLInputElement = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    fireEvent.change(textInput, {target: {value: newTextValue}})
    fireEvent.keyDown(textInput, {key: 'Escape'})

    expect(textInput).not.toHaveFocus()
    expect(textInput).not.toBeInTheDocument()
    expect(screen.getByText('before')).toBeInTheDocument()
  })

  test('ProjectV2ItemFieldDateValue', async () => {
    const field = {
      id: '1',
      dataType: 'DATE',
      __typename: 'ProjectV2Field',
      name: 'test',
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <ThemeProvider colorMode="day">
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </ThemeProvider>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldDateValue',
                      date: '2023-11-20',
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const textEditButton = screen.getByText('Nov 20, 2023')

    // perform update
    act(() => {
      textEditButton.click()
    })

    // get the button for the 21th
    const dateInput = screen.getByText('21')
    expect(dateInput).toBeInTheDocument()
    act(() => {
      dateInput.click()
    })

    // verify optimistic update (since we didnt mock the result of the mutation)
    expect(screen.queryByText('21')).not.toBeInTheDocument()
    expect(screen.getByText('Nov 21, 2023')).toBeInTheDocument()
  })

  test('ProjectV2ItemFieldSingleSelectValue', async () => {
    const field = {
      id: '1',
      dataType: 'SINGLE_SELECT',
      __typename: 'ProjectV2SingleSelectField',
      name: 'test',
      options: [
        {
          id: '123',
          optionId: '123',
          nameHTML: 'myValue',
          name: 'myValue',
          color: 'BLUE',
        },
        {
          id: '124',
          optionId: '124',
          nameHTML: 'newValue',
          name: 'newValue',
          color: 'RED',
        },
      ],
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <ThemeProvider colorMode="day">
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </ThemeProvider>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldSingleSelectValue',
                      name: 'myValue',
                      nameHTML: 'myValue',
                      color: 'BLUE',
                      optionId: '123',
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const editButton = screen.getByText('myValue')

    // perform update
    act(() => {
      editButton.click()
    })

    // get the button for the 21th
    const newValue = screen.getByText('newValue')
    expect(newValue).toBeInTheDocument()
    act(() => {
      newValue.click()
    })

    // verify optimistic update (since we didnt mock the result of the mutation)
    expect(screen.queryByText('myValue')).not.toBeInTheDocument()
    expect(screen.getByText('newValue')).toBeInTheDocument()
  })

  test('ProjectV2ItemFieldIterationValue', async () => {
    const field = {
      id: '1',
      dataType: 'ITERATION',
      __typename: 'ProjectV2IterationField',
      name: 'test',
      configuration: {
        iterations: [
          {
            id: '123',
            title: 'iter1',
            titleHTML: 'iter1',
            startDate: '2023-11-01',
            duration: 2,
          },
          {
            id: '124',
            title: 'iter2',
            titleHTML: 'iter2',
            startDate: '2023-11-15',
            duration: 2,
          },
        ],
        completedIterations: [],
      },
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <ThemeProvider colorMode="day">
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </ThemeProvider>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldIterationValue',
                      title: 'iter1',
                      titleHTML: 'iter1',
                      iterationId: '123',
                      field,
                    },
                  },
                ],
              },
            }),
          },
        },
      },
    )

    // very current value
    const editButton = screen.getByText('iter1')

    // perform update
    act(() => {
      editButton.click()
    })

    // get the button for the 21th
    const newValue = screen.getByText('iter2')
    expect(newValue).toBeInTheDocument()
    act(() => {
      newValue.click()
    })

    // verify optimistic update (since we didnt mock the result of the mutation)
    expect(screen.queryByText('iter1')).not.toBeInTheDocument()
    expect(screen.getByText('iter2')).toBeInTheDocument()
  })

  test('clears ProjectV2ItemFieldSingleSelectValue', async () => {
    const environment = createMockEnvironment()
    const field = {
      id: '1',
      dataType: 'SINGLE_SELECT',
      __typename: 'ProjectV2SingleSelectField',
      name: 'test',
      options: [
        {
          id: '123',
          optionId: '123',
          nameHTML: 'myValue',
          name: 'myValue',
          color: 'BLUE',
        },
        {
          id: '124',
          optionId: '124',
          nameHTML: 'newValue',
          name: 'newValue',
          color: 'RED',
        },
      ],
    }
    renderRelay<{projectItemSectionFieldListTestQuery: ProjectItemSectionFieldListTestQuery}>(
      ({queryData: {projectItemSectionFieldListTestQuery}}) => (
        <ThemeProvider colorMode="day">
          <ProjectItemSectionFields projectItem={projectItemSectionFieldListTestQuery.node!} />
        </ThemeProvider>
      ),
      {
        relay: {
          queries: {
            projectItemSectionFieldListTestQuery: {type: 'fragment', query: testQuery, variables: {}},
          },
          mockResolvers: {
            ProjectV2Item: () => ({
              id: '37',
              isArchived: false,
              project: {
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: field,
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: '44',
                      __typename: 'ProjectV2ItemFieldSingleSelectValue',
                      name: 'myValue',
                      nameHTML: 'myValue',
                      color: 'BLUE',
                      optionId: '123',
                      field,
                    },
                  },
                ],
              },
            }),
          },
          environment,
        },
      },
    )

    // verify current selected value
    const editButton = screen.getByText('myValue')

    // perform update
    act(() => {
      editButton.click()
    })

    const element = screen.getByRole('option', {selected: true})

    await act(async () => {
      element.click()
    })

    const recentOperation = environment.mock.getMostRecentOperation()

    // verify that correct mutation was called
    expect(recentOperation.fragment.node.name).toBe('clearProjectItemFieldValueMutation')

    // verify optimistic update (since we didnt mock the result of the mutation)
    expect(screen.queryByText('myValue')).not.toBeInTheDocument()
    expect(screen.getByText('Filter options')).toBeInTheDocument()
  })
})

const TestComponent = () => {
  const data = useLazyLoadQuery<ProjectItemSectionFieldListTestQuery>(testQuery, {})
  return <ProjectItemSectionFields projectItem={data.node!} />
}

describe('Render', () => {
  test('Keep fields visible after re-render', async () => {
    const field = {
      id: '1',
      dataType: 'TEXT',
      __typename: 'ProjectV2Field',
      name: 'test',
    }

    const environment = createMockEnvironment()

    const {rerender} = render(
      <RelayEnvironmentProvider environment={environment}>
        <TestComponent />
      </RelayEnvironmentProvider>,
    )

    act(() =>
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          ProjectV2Item: () => ({
            id: '37',
            isArchived: false,
            project: {
              viewerCanUpdate: true,
              fields: {
                edges: [
                  {
                    node: field,
                  },
                ],
              },
            },
            fieldValues: {
              edges: [
                {
                  node: {
                    id: '44',
                    __typename: 'ProjectV2ItemFieldTextValue',
                    text: 'myValue',
                    field,
                  },
                },
              ],
            },
          }),
        }),
      ),
    )

    expect(await screen.findByText('myValue')).toBeVisible()

    rerender(
      <RelayEnvironmentProvider environment={environment}>
        <TestComponent />
      </RelayEnvironmentProvider>,
    )

    expect(await screen.findByText('myValue')).toBeVisible()
  })
})
