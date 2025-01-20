/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'
import {NumberField} from '../NumberField'
import type {NumberFieldTestQuery} from './__generated__/NumberFieldTestQuery.graphql'

describe('NumberField', () => {
  it('Renders field name', () => {
    setup({value: 123, viewerCanUpdate: true})

    expect(screen.getByText(/Number/)).toBeInTheDocument()
  })

  it('Renders field positive value', () => {
    setup({value: 123, viewerCanUpdate: true})

    expect(screen.getByText(/123/)).toBeInTheDocument()
  })

  it('Renders field negative value', () => {
    setup({value: -123, viewerCanUpdate: true})

    expect(screen.getByText(/-123/)).toBeInTheDocument()
  })

  it('Renders field floating point value', () => {
    setup({value: 1.23, viewerCanUpdate: true})

    expect(screen.getByText(/1.23/)).toBeInTheDocument()
  })

  it('Renders a button when viewer has permission to update', () => {
    setup({value: undefined, viewerCanUpdate: true})

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('Does not renders a button when viewer has no permission to update', () => {
    setup({value: undefined, viewerCanUpdate: false})

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('Can submit positive value', async () => {
    const {environment, user} = setup({value: 0, viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    act(() => {
      button.click()
    })

    const input = screen.getByTestId('number-field-input')
    expect(input).toBeInTheDocument()

    await user.click(input)
    await user.type(input, '123')
    await user.type(input, '{enter}')

    const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
    const variables = environment.mock.getMostRecentOperation().fragment.variables.input

    expect(mutationName).toBe('updateProjectItemFieldValueMutation')
    expect(variables).toMatchObject({
      fieldId: 'fieldId',
      itemId: 'itemId',
      projectId: 'projectId',
      value: {number: 123},
    })
  })

  it('can submit when clicking the commit button', async () => {
    const {environment, user} = setup({value: 0, viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    act(() => {
      button.click()
    })

    const input = screen.getByTestId('number-field-input')
    expect(input).toBeInTheDocument()

    await user.click(input)
    await user.type(input, '123')

    const commitButton = screen.getByTestId('commit')
    act(() => {
      commitButton.click()
    })

    const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
    const variables = environment.mock.getMostRecentOperation().fragment.variables.input

    expect(mutationName).toBe('updateProjectItemFieldValueMutation')
    expect(variables).toMatchObject({
      fieldId: 'fieldId',
      itemId: 'itemId',
      projectId: 'projectId',
      value: {number: 123},
    })
  })

  it('Can submit negative value', async () => {
    const {environment, user} = setup({value: 0, viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    act(() => {
      button.click()
    })

    const input = screen.getByTestId('number-field-input')
    expect(input).toBeInTheDocument()

    await user.click(input)
    await user.type(input, '-123')
    await user.type(input, '{enter}')

    const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
    const variables = environment.mock.getMostRecentOperation().fragment.variables.input

    expect(mutationName).toBe('updateProjectItemFieldValueMutation')
    expect(variables).toMatchObject({
      fieldId: 'fieldId',
      itemId: 'itemId',
      projectId: 'projectId',
      value: {number: -123},
    })
  })

  it('Can submit floating point value', async () => {
    const {environment, user} = setup({value: 0, viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    act(() => {
      button.click()
    })

    const input = screen.getByTestId('number-field-input')
    expect(input).toBeInTheDocument()

    await user.click(input)
    await user.type(input, '1.23')
    await user.type(input, '{enter}')

    const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
    const variables = environment.mock.getMostRecentOperation().fragment.variables.input

    expect(mutationName).toBe('updateProjectItemFieldValueMutation')
    expect(variables).toMatchObject({
      fieldId: 'fieldId',
      itemId: 'itemId',
      projectId: 'projectId',
      value: {number: 1.23},
    })
  })

  it('Does not submit an invalid value', async () => {
    const {environment, user} = setup({value: 12345, viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    act(() => {
      button.click()
    })

    const input = screen.getByTestId('number-field-input')
    expect(input).toBeInTheDocument()

    await user.click(input)
    await user.type(input, '88888888888888888888')
    await user.type(input, '{enter}')

    const lastOperationName = environment.mock.getMostRecentOperation().fragment.node.name

    expect(lastOperationName).toBe('NumberFieldTestQuery')
  })
})

const setup = ({value, viewerCanUpdate}: {value: number | undefined; viewerCanUpdate: boolean}) => {
  const {relayMockEnvironment, user} = renderRelay<{query: NumberFieldTestQuery}>(
    ({queryData}) => (
      <NumberField
        viewerCanUpdate={viewerCanUpdate}
        itemId="itemId"
        projectId="projectId"
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
              query NumberFieldTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ... on ProjectV2Item {
                    project {
                      viewerCanUpdate
                      url
                      id
                      fields(first: 50, orderBy: {field: POSITION, direction: ASC}) {
                        edges {
                          node {
                            ... on ProjectV2Field {
                              id
                              name
                              dataType
                              ...NumberFieldConfigFragment
                            }
                          }
                        }
                      }
                    }
                    fieldValues(first: 50, orderBy: {field: POSITION, direction: ASC}) {
                      edges {
                        ... on ProjectV2ItemFieldValueEdge {
                          node {
                            ... on ProjectV2ItemFieldNumberValue {
                              id
                              field {
                                ... on ProjectV2Field {
                                  id
                                }
                              }
                            }
                            ...NumberFieldFragment
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
                viewerCanUpdate: true,
                fields: {
                  edges: [
                    {
                      node: {
                        id: 'fieldId',
                        name: 'Number',
                        dataType: 'NUMBER',
                      },
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [
                  {
                    node: {
                      id: 'itv1',
                      number: value,
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

  return {environment: relayMockEnvironment, user}
}
