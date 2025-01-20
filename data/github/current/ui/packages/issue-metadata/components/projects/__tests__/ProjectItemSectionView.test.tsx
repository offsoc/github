import {screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {graphql} from 'relay-runtime'
import {ProjectItemSectionView} from '../ProjectItemSectionView'
import {noop} from '@github-ui/noop'
import type {ProjectItemSectionViewTestQuery} from './__generated__/ProjectItemSectionViewTestQuery.graphql'

const query = graphql`
  query ProjectItemSectionViewTestQuery @relay_test_operation {
    node(id: "project_item1") {
      ...ProjectItemSectionView
    }
  }
`

it('render project - without a status', () => {
  renderRelay<{
    projectItemQuery: ProjectItemSectionViewTestQuery
  }>(
    ({queryData: {projectItemQuery}}) => (
      <ProjectItemSectionView open={false} setOpen={noop} projectItem={projectItemQuery.node!} isProjectOpen={false} />
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
          ProjectV2Item() {
            return {
              id: 'project_item1',
              project: {
                title: 'Project 1',
                field: {
                  name: 'Status',
                },
              },
              fieldValueByName: null,
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('Project 1')).toBeInTheDocument()
  expect(screen.getByText('Status')).toBeInTheDocument()
  expect(screen.getByText('No status')).toBeInTheDocument()
})

it('render project - with a status', () => {
  renderRelay<{
    projectItemQuery: ProjectItemSectionViewTestQuery
  }>(
    ({queryData: {projectItemQuery}}) => (
      <ProjectItemSectionView open={false} setOpen={noop} projectItem={projectItemQuery.node!} isProjectOpen={false} />
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
          ProjectV2Item() {
            return {
              id: 'project_item1',
              project: {
                title: 'Project 1',
                field: {
                  name: 'Status',
                },
              },
              fieldValueByName: {
                name: 'In Progress',
              },
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('Project 1')).toBeInTheDocument()
  expect(screen.getByText('Status')).toBeInTheDocument()
  expect(screen.getByText('In Progress')).toBeInTheDocument()
})

it('render project title', () => {
  renderRelay<{
    projectItemQuery: ProjectItemSectionViewTestQuery
  }>(
    ({queryData: {projectItemQuery}}) => (
      <ProjectItemSectionView open={false} setOpen={noop} projectItem={projectItemQuery.node!} isProjectOpen={false} />
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
          ProjectV2Item() {
            return {
              id: 'project_item1',
              project: {
                title: 'Project title',
                field: {
                  name: 'Status',
                },
              },
              fieldValueByName: {
                name: 'In Progress',
              },
            }
          },
        },
      },
    },
  )

  const textOverflowElement = screen.getByTestId('project-title')

  expect(screen.getByText('Project title')).toBeInTheDocument()
  expect(textOverflowElement).toHaveStyle('text-overflow: ellipsis')
  expect(textOverflowElement).toHaveStyle('overflow: hidden')
  expect(textOverflowElement).toHaveStyle('white-space: nowrap')
})
