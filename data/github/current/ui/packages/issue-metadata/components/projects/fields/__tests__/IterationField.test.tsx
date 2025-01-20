/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen, within} from '@testing-library/react'
import {graphql} from 'relay-runtime'
import {IterationField} from '../IterationField'
import type {IterationFieldTestQuery} from './__generated__/IterationFieldTestQuery.graphql'

type Iteration = {
  id: string
  titleHTML: string
  duration: number
  startDate: string
}

const iterations: Iteration[] = [
  {
    id: 'it1',
    titleHTML: 'Sprint 1',
    duration: 7,
    startDate: '2021-01-08T15:00:00',
  },
  {
    id: 'it2',
    titleHTML: 'Sprint 2',
    duration: 7,
    startDate: '2021-01-15T15:00:00',
  },
  {
    id: 'it3',
    titleHTML: 'Sprint 3',
    duration: 7,
    startDate: '2021-01-23T15:00:00',
  },
]

const completedIterations: Iteration[] = [
  {
    id: 'it0',
    titleHTML: 'Sprint 0',
    duration: 7,
    startDate: '2021-01-01T15:00:00',
  },
]

describe('IterationField', () => {
  it('Renders field name', () => {
    setup(iterations[0]!)

    expect(screen.getByText(/Iteration/)).toBeInTheDocument()
  })

  it('Renders field value', () => {
    setup(iterations[0]!)

    expect(screen.getByText(/Sprint 1/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 8 - Jan 14/)).toBeInTheDocument()
  })

  it('Renders field iterations', async () => {
    setup(iterations[0]!)

    const button = screen.getByRole('button')
    act(() => button.click())

    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByText(/Sprint 1/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Sprint 2/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Sprint 3/)).toBeInTheDocument()
  })

  it('Renders field select non-completed iteration', async () => {
    setup(iterations[0]!)

    const button = screen.getByRole('button')
    act(() => button.click())

    const dialog = screen.getByRole('dialog')

    const options = within(dialog).getAllByRole('option')
    expect(options).toHaveLength(4)

    const selectedOption = options.find(o => o.getAttribute('aria-selected') === 'true')
    if (!selectedOption) throw new Error('Unable to find selected option')

    expect(within(selectedOption).getByText(/Sprint 1/)).toBeInTheDocument()
  })

  it('Renders field select completed iteration', async () => {
    setup(completedIterations[0]!)

    const button = screen.getByRole('button')
    act(() => button.click())

    const dialog = screen.getByRole('dialog')

    const options = within(dialog).getAllByRole('option')
    expect(options).toHaveLength(4)

    const selectedOption = options.find(o => o.getAttribute('aria-selected') === 'true')
    if (!selectedOption) throw new Error('Unable to find selected option')

    expect(within(selectedOption).getByText(/Sprint 0/)).toBeInTheDocument()
  })
})

const setup = (value: Iteration) => {
  renderRelay<{query: IterationFieldTestQuery}>(
    ({queryData}) => (
      <IterationField
        viewerCanUpdate={true}
        itemId="item-id"
        projectId="project-id"
        field={queryData.query.node!.project!.fields.edges![0]!.node!}
        value={queryData.query.node!.fieldValues!.edges![0]!.node!}
      />
    ),
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query IterationFieldTestQuery @relay_test_operation {
                node(id: "abc") {
                  ... on ProjectV2Item {
                    project {
                      viewerCanUpdate
                      url
                      id
                      fields(first: 50, orderBy: {field: POSITION, direction: ASC}) {
                        edges {
                          node {
                            ... on ProjectV2IterationField {
                              id
                              name
                              dataType
                              ...IterationFieldConfigFragment
                            }
                          }
                        }
                      }
                    }
                    fieldValues(first: 50, orderBy: {field: POSITION, direction: ASC}) {
                      edges {
                        ... on ProjectV2ItemFieldValueEdge {
                          node {
                            ... on ProjectV2ItemFieldIterationValue {
                              id
                              field {
                                ... on ProjectV2IterationField {
                                  id
                                }
                              }
                            }
                            ...IterationFieldFragment
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Node() {
            return {
              project: {
                id: 'id',
                fields: {
                  edges: [
                    {
                      node: {
                        id: 'abc',
                        name: 'Iteration',
                        dataType: 'ITERATION',
                        configuration: {
                          iterations: [
                            {
                              id: 'it1',
                              titleHTML: 'Sprint 1',
                              duration: 7,
                              startDate: '2021-01-08T15:00:00',
                            },
                            {
                              id: 'it2',
                              titleHTML: 'Sprint 2',
                              duration: 7,
                              startDate: '2021-01-15T15:00:00',
                            },
                            {
                              id: 'it3',
                              titleHTML: 'Sprint 3',
                              duration: 7,
                              startDate: '2021-01-23T15:00:00',
                            },
                          ],
                          completedIterations: [
                            {
                              id: 'it0',
                              titleHTML: 'Sprint 0',
                              duration: 7,
                              startDate: '2021-01-01T15:00:00',
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      ...value,
                      id: 'itv1',
                      iterationId: value.id,
                    },
                  },
                ],
              },
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}
