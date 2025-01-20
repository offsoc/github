import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'
import {mockMilestonesResolvers} from './helper'
import {ItemPickerMilestonesBox} from '../ItemPickerMilestonesBox'
import type {ItemPickerMilestonesBoxTestQuery} from './__generated__/ItemPickerMilestonesBoxTestQuery.graphql'

const renderItemPickerTestMilestonesBox = (args?: {itemsCount?: number; hasSelectedMilestone?: boolean}) => {
  const {itemsCount, hasSelectedMilestone} = args || {}
  return renderRelay<{rootQuery: ItemPickerMilestonesBoxTestQuery}>(
    ({queryData}) => (
      <ItemPickerMilestonesBox
        owner="owner"
        repo="repo"
        title="Sample title"
        selectedMilestonesKey={queryData.rootQuery.repository!.issue!.milestone!}
      />
    ),
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: graphql`
              query ItemPickerMilestonesBoxTestQuery($owner: String!, $repo: String!, $number: Int!)
              @relay_test_operation {
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    milestone {
                      ...ItemPickerMilestonesBox_SelectedMilestonesFragment
                    }
                  }
                  # ...ItemPickerMilestonesList_Fragment
                }
              }
            `,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
        },
        mockResolvers: mockMilestonesResolvers(itemsCount, hasSelectedMilestone),
      },
    },
  )
}

describe('ItemPickerMilestonesBox', () => {
  it('Renders the milestones button', () => {
    renderItemPickerTestMilestonesBox()
    expect(screen.getByTestId('item-picker-milestones-box-edit-milestones-button')).toBeInTheDocument()
  })

  it('Renders milestones box entry with selected milestones', () => {
    renderItemPickerTestMilestonesBox({itemsCount: 3, hasSelectedMilestone: true})
    const selectedProject = screen.getByTestId('item-picker-milestones-box-milestones')
    expect(selectedProject).toHaveTextContent('milestone 0')
  })

  it('Renders item picker milestones dialog when clicking on milestones edit button', () => {
    renderItemPickerTestMilestonesBox()
    const editMilestoneButton = screen.getByTestId('item-picker-milestones-box-edit-milestones-button')
    act(() => {
      editMilestoneButton.click()
    })
    const selectPanelDialog = screen.getByText('Sample title')
    expect(selectPanelDialog).toBeVisible()
  })
})
