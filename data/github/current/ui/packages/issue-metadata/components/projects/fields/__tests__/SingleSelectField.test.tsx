/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'
import {SingleSelectField} from '../SingleSelectField'
import type {SingleSelectFieldTestQuery} from './__generated__/SingleSelectFieldTestQuery.graphql'

describe('NumberField', () => {
  it('Renders field name', () => {
    setup({viewerCanUpdate: true})

    expect(screen.getByText(/Single-Select/)).toBeInTheDocument()
  })

  it('Renders field options names', () => {
    setup({viewerCanUpdate: true})

    const button = screen.getByRole('button')
    act(() => button.click())

    expect(screen.getByText(/Option1/)).toBeInTheDocument()
    expect(screen.getByText(/Option2/)).toBeInTheDocument()
    expect(screen.getByText(/Option3/)).toBeInTheDocument()
  })

  it('Renders field options descriptions', () => {
    setup({viewerCanUpdate: true})

    const button = screen.getByRole('button')
    act(() => button.click())

    expect(screen.getByText(/Description1/)).toBeInTheDocument()
    expect(screen.getByText(/Description2/)).toBeInTheDocument()
    expect(screen.getByText(/Description3/)).toBeInTheDocument()
  })
})

const setup = ({viewerCanUpdate}: {viewerCanUpdate: boolean}) => {
  const {relayMockEnvironment} = renderRelay<{query: SingleSelectFieldTestQuery}>(
    ({queryData}) => (
      <SingleSelectField
        viewerCanUpdate={viewerCanUpdate}
        itemId="itemId"
        projectId="projectId"
        field={queryData.query.node!.project!.fields.edges![0]!.node!}
        value={null}
      />
    ),
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query SingleSelectFieldTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ... on ProjectV2Item {
                    project {
                      viewerCanUpdate
                      url
                      id
                      fields(first: 50, orderBy: {field: POSITION, direction: ASC}) {
                        edges {
                          node {
                            ... on ProjectV2SingleSelectField {
                              id
                              name
                              dataType
                              ...SingleSelectFieldConfigFragment
                            }
                          }
                        }
                      }
                    }
                    fieldValues(first: 50, orderBy: {field: POSITION, direction: ASC}) {
                      edges {
                        ... on ProjectV2ItemFieldValueEdge {
                          node {
                            ... on ProjectV2ItemFieldSingleSelectValue {
                              id
                              field {
                                ... on ProjectV2Field {
                                  id
                                }
                              }
                            }
                            ...SingleSelectFieldFragment
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
                        name: 'Single-Select',
                        dataType: 'SINGLE_SELECT',
                        options: [
                          {id: 'opt1', optionId: 'optId1', nameHTML: 'Option1', descriptionHTML: 'Description1'},
                          {id: 'opt2', optionId: 'optId2', nameHTML: 'Option2', descriptionHTML: 'Description2'},
                          {id: 'opt3', optionId: 'optId3', nameHTML: 'Option3', descriptionHTML: 'Description3'},
                        ],
                      },
                    },
                  ],
                },
              },
              fieldValues: {
                edges: [],
              },
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  return {environment: relayMockEnvironment}
}
