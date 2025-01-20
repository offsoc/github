import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import {act, screen} from '@testing-library/react'
import {ItemPickerProjectsBox} from '../ItemPickerProjectsBox'
import {mockProjectsResolvers} from './helper'
import type {ItemPickerProjectsBoxQuery} from './__generated__/ItemPickerProjectsBoxQuery.graphql'

const renderItemPickerTestProjectsBox = (args?: {
  selectedProjectsV2Count?: number
  selectedClassicProjectsCount?: number
  repositoryProjectsV2Count?: number
  repositoryClassicProjectsCount?: number
  organizationProjectsV2Count?: number
  organizationClassicProjectsCount?: number
  totalRepositoryProjectsV2Count?: number
  totalOrganizationProjectsV2Count?: number
}) => {
  const {
    selectedProjectsV2Count,
    selectedClassicProjectsCount,
    repositoryProjectsV2Count,
    repositoryClassicProjectsCount,
    organizationProjectsV2Count,
    organizationClassicProjectsCount,
    totalRepositoryProjectsV2Count,
    totalOrganizationProjectsV2Count,
  } = args || {}
  return renderRelay<{rootQuery: ItemPickerProjectsBoxQuery}>(
    ({queryData}) => (
      <ItemPickerProjectsBox
        owner="owner"
        repo="repo"
        title="Sample title"
        selectedProjectsV2Key={queryData.rootQuery.repository!.issue!.projectsV2}
        selectedClassicProjectCardsKey={queryData.rootQuery.repository!.issue!.projectCards}
      />
    ),
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: graphql`
              query ItemPickerProjectsBoxQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    projectsV2(first: 10) {
                      ...ItemPickerProjectsBox_SelectedProjectsV2Fragment
                    }
                    projectCards(first: 10) {
                      ...ItemPickerProjectsBox_SelectedClassicProjectCardsFragment
                    }
                  }
                }
              }
            `,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
        },
        mockResolvers: mockProjectsResolvers(
          selectedProjectsV2Count,
          selectedClassicProjectsCount,
          repositoryProjectsV2Count,
          repositoryClassicProjectsCount,
          organizationProjectsV2Count,
          organizationClassicProjectsCount,
          totalRepositoryProjectsV2Count,
          totalOrganizationProjectsV2Count,
        ),
      },
    },
  )
}

describe('ItemPickerProjectsBox', () => {
  it('Renders the projects button', () => {
    renderItemPickerTestProjectsBox()
    expect(screen.getByTestId('item-picker-projects-box-edit-projects-button')).toBeInTheDocument()
  })

  it('Renders projects box entry with selected projects', () => {
    renderItemPickerTestProjectsBox({selectedProjectsV2Count: 1, selectedClassicProjectsCount: 0})
    const selectedProject = screen.getByTestId('item-picker-projects-box-projects')
    expect(selectedProject).toHaveTextContent('selected v2 project 0')
  })

  it('Renders item picker projects dialog when clicking on projects edit button', () => {
    renderItemPickerTestProjectsBox()
    const editProjectButton = screen.getByTestId('item-picker-projects-box-edit-projects-button')
    act(() => {
      editProjectButton.click()
    })
    const selectPanelDialog = screen.getByText('Sample title')
    expect(selectPanelDialog).toBeVisible()
  })
})
