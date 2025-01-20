import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import {act, screen, within} from '@testing-library/react'
import {mockAssigneesResolvers} from './helper'
import {ItemPickerAssigneesBox} from '../ItemPickerAssigneesBox'
import type {ItemPickerAssigneesBoxQuery} from './__generated__/ItemPickerAssigneesBoxQuery.graphql'
import type {ItemPickerAssigneesList_Query} from '../__generated__/ItemPickerAssigneesList_Query.graphql'

const renderItemPickerTestAssigneesBox = (props?: {itemsCount?: number; selectedCount?: number}) => {
  return renderRelay<{rootQuery: ItemPickerAssigneesBoxQuery; listQuery: ItemPickerAssigneesList_Query}>(
    ({queryData}) => (
      <ItemPickerAssigneesBox
        owner="owner"
        repo="repo"
        number={1}
        title="Sample title"
        selectedAssigneesKey={queryData.rootQuery.repository!.issue!}
        currentViewerKey={queryData.rootQuery.viewer}
      />
    ),
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: graphql`
              query ItemPickerAssigneesBoxQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
                viewer {
                  # eslint-disable-next-line relay/must-colocate-fragment-spreads
                  ...ItemPickerAssignees_CurrentViewerFragment
                }
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    ...ItemPickerAssigneesBox_SelectedAssigneesFragment
                  }
                }
              }
            `,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
          listQuery: {
            type: 'lazy',
          },
        },
        mockResolvers: mockAssigneesResolvers(props?.itemsCount, props?.selectedCount),
      },
    },
  )
}

describe('ItemPickerAssigneesBox', () => {
  it('Renders the assignees button', () => {
    renderItemPickerTestAssigneesBox()
    expect(screen.getByTestId('item-picker-assignees-box-edit-assignees-button')).toBeInTheDocument()
  })

  it('Renders assignees box entry with selected assignees', () => {
    renderItemPickerTestAssigneesBox()
    const navListEl = screen.getByTestId('item-picker-assignees-box-assignees')
    const selectedAssignee = within(navListEl).getByText('assignee 0')
    expect(selectedAssignee).toBeInTheDocument()
  })

  it('Renders itempicker assignees dialog when clicking on assignees edit button', () => {
    renderItemPickerTestAssigneesBox()
    const editAssigneeButton = screen.getByTestId('item-picker-assignees-box-edit-assignees-button')
    act(() => {
      editAssigneeButton.click()
    })
    const selectPanelDialog = screen.getByText('Sample title')
    expect(selectPanelDialog).toBeVisible()
  })

  it('clears itempicker assignees when clicking on clear button', () => {
    renderItemPickerTestAssigneesBox({itemsCount: 3, selectedCount: 2})
    const editAssigneeButton = screen.getByTestId('item-picker-assignees-box-edit-assignees-button')
    act(() => {
      editAssigneeButton.click()
    })

    const selected = within(screen.getByRole('listbox')).getAllByRole('option', {selected: true})

    expect(selected).toHaveLength(2)

    const clearButton = screen.getByLabelText('Clear selection', {selector: 'button'})
    expect(clearButton).toBeVisible()

    act(() => {
      clearButton.click()
    })

    // Have to validate against the unselected options. Asserting the selected options throws an error
    expect(within(screen.getByRole('listbox')).getAllByRole('option', {selected: false})).toHaveLength(4)
  })

  it('Renders currentviewer if not selected', () => {
    renderItemPickerTestAssigneesBox({itemsCount: 3, selectedCount: 0})

    const editAssigneeButton = screen.getByTestId('item-picker-assignees-box-edit-assignees-button')
    act(() => {
      editAssigneeButton.click()
    })

    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options).toHaveLength(4)
    const viewer = within(screen.getByRole('listbox')).getByRole('option', {name: 'viewer viewer name'})
    expect(viewer).toHaveAttribute('aria-selected', 'false')
  })
})
