/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'

import {TextField} from '../TextField'
import type {TextFieldTestQuery} from './__generated__/TextFieldTestQuery.graphql'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {mockUrlCanParse} from '../../../../test-utils/mocks'

mockUrlCanParse()

jest.mock('@github-ui/ssr-utils', () => ({
  ...jest.requireActual('@github-ui/ssr-utils'),
  ssrSafeWindow: {
    ...jest.requireActual('@github-ui/ssr-utils').ssrSafeWindow,
    open: jest.fn(),
  },
}))

describe('TextField', () => {
  it('Renders field name', () => {
    setup({value: 'Hello World!', viewerCanUpdate: true})

    expect(screen.getByText(/Hello World!/)).toBeInTheDocument()
  })

  it('Renders a button when viewer has permission to update', () => {
    setup({value: undefined, viewerCanUpdate: true})

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('Does not renders a button when viewer has no permission to update', () => {
    setup({value: undefined, viewerCanUpdate: false})

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('Can submit value', async () => {
    const {environment, user} = setup({value: 'Hello World!', viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    await user.click(button)

    const input = screen.getByTestId('text-field-input')
    expect(input).toBeInTheDocument()

    await user.click(input)
    await user.clear(input)
    await user.type(input, 'abc')
    await user.type(input, '{enter}')

    const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
    const variables = environment.mock.getMostRecentOperation().fragment.variables.input

    expect(mutationName).toBe('updateProjectItemFieldValueMutation')
    expect(variables).toMatchObject({
      fieldId: 'fieldId',
      itemId: 'itemId',
      projectId: 'projectId',
      value: {text: 'abc'},
    })
  })

  it('can submit when clicking the commit button', async () => {
    const {environment, user} = setup({value: 'Hello World!', viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    await user.click(button)

    const input = screen.getByTestId('text-field-input')
    expect(input).toBeInTheDocument()

    await user.click(input)
    await user.clear(input)
    await user.type(input, 'xyz')

    expect(input).toHaveValue('xyz')

    const commitButton = screen.getByTestId('commit')
    await user.click(commitButton)

    const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
    const variables = environment.mock.getMostRecentOperation().fragment.variables.input

    expect(mutationName).toBe('updateProjectItemFieldValueMutation')
    expect(variables).toMatchObject({
      fieldId: 'fieldId',
      itemId: 'itemId',
      projectId: 'projectId',
      value: {text: 'xyz'},
    })
  })

  it('renders links as anchors', () => {
    setup({value: 'Hello World! www.github.com https://github.com', viewerCanUpdate: true})

    expect(screen.getByRole('link', {name: 'www.github.com'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'https://github.com'})).toBeInTheDocument()
  })

  it('renders an action menu when the text field is clicked', async () => {
    const {user} = setup({value: 'Hello World! www.github.com https://github.com', viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    await user.click(button)

    expect(screen.getByRole('button', {name: 'www.github.com'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'https://github.com'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Edit'})).toBeInTheDocument()
  })

  it('opens links from the action menu', async () => {
    const {user} = setup({value: 'Hello World! www.github.com https://github.com', viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    await user.click(button)

    const firstLinkItem = screen.getByRole('button', {name: 'www.github.com'})
    expect(firstLinkItem).toBeInTheDocument()
    await user.click(firstLinkItem)

    expect(ssrSafeWindow!.open).toHaveBeenCalledWith('https://www.github.com', '_blank', 'noreferrer')

    await user.click(button)

    const secondLinkItem = screen.getByRole('button', {name: 'https://github.com'})
    expect(secondLinkItem).toBeInTheDocument()
    await user.click(secondLinkItem)

    expect(ssrSafeWindow!.open).toHaveBeenCalledWith('https://github.com', '_blank', 'noreferrer')
  })

  it('switches to edit mode from the action menu', async () => {
    const {user} = setup({value: 'Hello World! www.github.com https://github.com', viewerCanUpdate: true})

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    await user.click(button)

    const editItem = screen.getByRole('button', {name: 'Edit'})
    expect(editItem).toBeInTheDocument()
    await user.click(editItem)

    const input = screen.getByTestId('text-field-input')
    expect(input).toBeInTheDocument()

    const commitButton = screen.getByTestId('commit')
    expect(commitButton).toBeInTheDocument()
  })

  it('render links and no button when viewerCanUpdate is false', async () => {
    setup({value: 'Hello World! www.github.com https://github.com', viewerCanUpdate: false})

    expect(screen.queryByRole('button', {name: 'Edit'})).not.toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'www.github.com'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'https://github.com'})).toBeInTheDocument()
  })
})

const setup = ({value, viewerCanUpdate}: {value: string | undefined; viewerCanUpdate: boolean}) => {
  const {relayMockEnvironment, user} = renderRelay<{query: TextFieldTestQuery}>(
    ({queryData}) => (
      <TextField
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
              query TextFieldTestQuery @relay_test_operation {
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
                              ...TextFieldConfigFragment
                            }
                          }
                        }
                      }
                    }
                    fieldValues(first: 50, orderBy: {field: POSITION, direction: ASC}) {
                      edges {
                        ... on ProjectV2ItemFieldValueEdge {
                          node {
                            ... on ProjectV2ItemFieldTextValue {
                              id
                              field {
                                ... on ProjectV2Field {
                                  id
                                }
                              }
                            }
                            ...TextFieldFragment
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
                        name: 'Txt',
                        dataType: 'TEXT',
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
                      text: value,
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
