import {screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {graphql} from 'relay-runtime'
import type {ClassicProjectItemTestQuery} from './__generated__/ClassicProjectItemTestQuery.graphql'
import {ClassicProjectItem} from '../ClassicProjectItem'

const query = graphql`
  query ClassicProjectItemTestQuery @relay_test_operation {
    node(id: "classic_project_item1") {
      ...ClassicProjectItem
    }
  }
`

it('render project - with a title', () => {
  renderRelay<{
    projectItemQuery: ClassicProjectItemTestQuery
  }>(
    ({queryData: {projectItemQuery}}) => (
      <ClassicProjectItem projectItem={projectItemQuery.node!} issueId={'issue_id'} />
    ),
    {
      relay: {
        queries: {
          projectItemQuery: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          ProjectCard() {
            return {
              id: 'classic_project_item1',
              project: {
                name: 'Classic Project 1',
              },
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('Classic Project 1')).toBeInTheDocument()
})

it('render project - without a column', () => {
  renderRelay<{
    projectItemQuery: ClassicProjectItemTestQuery
  }>(
    ({queryData: {projectItemQuery}}) => (
      <ClassicProjectItem projectItem={projectItemQuery.node!} issueId={'issue_id'} />
    ),
    {
      relay: {
        queries: {
          projectItemQuery: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          ProjectCard() {
            return {
              id: 'classic_project_item1',
              project: {
                name: 'Classic Project 1',
                columns: [],
              },
              column: null,
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('Classic Project 1')).toBeInTheDocument()
  expect(screen.getByText('Status')).toBeInTheDocument()
  expect(screen.getByText('Awaiting triage')).toBeInTheDocument()
})

it('render project - with a column', () => {
  renderRelay<{
    projectItemQuery: ClassicProjectItemTestQuery
  }>(
    ({queryData: {projectItemQuery}}) => (
      <ClassicProjectItem projectItem={projectItemQuery.node!} issueId={'issue_id'} />
    ),
    {
      relay: {
        queries: {
          projectItemQuery: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          ProjectCard() {
            return {
              id: 'classic_project_item1',
              project: {
                name: 'Classic Project 1',
                columns: [],
              },
              column: {
                id: 'column_id',
                name: 'To-do',
              },
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('Classic Project 1')).toBeInTheDocument()
  expect(screen.getByText('Status')).toBeInTheDocument()
  expect(screen.getByText('To-do')).toBeInTheDocument()
})
