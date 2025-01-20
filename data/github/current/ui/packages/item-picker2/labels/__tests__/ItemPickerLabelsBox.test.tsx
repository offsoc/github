import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import {act, screen} from '@testing-library/react'
import {mockLabelsResolvers} from './helper'
import {ItemPickerLabelsBox} from '../ItemPickerLabelsBox'
import type {ItemPickerLabelsBoxQuery} from './__generated__/ItemPickerLabelsBoxQuery.graphql'

const renderItemPickerTestLabelsBox = () => {
  return renderRelay<{rootQuery: ItemPickerLabelsBoxQuery}>(
    ({queryData}) => (
      <ItemPickerLabelsBox
        owner="owner"
        repo="repo"
        title="Sample title"
        selectedLabelsKey={queryData.rootQuery.repository!.issue!.labels!}
      />
    ),
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: graphql`
              query ItemPickerLabelsBoxQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    labels(first: 20) {
                      ...ItemPickerLabelsBox_SelectedLabelsFragment
                    }
                  }
                }
              }
            `,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
        },
        mockResolvers: mockLabelsResolvers(),
      },
    },
  )
}

describe('ItemPickerLabelsBox', () => {
  it('Renders the labels button', () => {
    renderItemPickerTestLabelsBox()
    expect(screen.getByTestId('item-picker-labels-box-edit-labels-button')).toBeInTheDocument()
  })

  it('Renders labels box entry with selected labels', () => {
    renderItemPickerTestLabelsBox()
    const selectedLabel = screen.getByTestId('item-picker-labels-box-labels').textContent
    expect(selectedLabel).toBe('selected label 0')
  })

  it('Renders item picker labels dialog when clicking on labels edit button', () => {
    renderItemPickerTestLabelsBox()
    const editLabelButton = screen.getByTestId('item-picker-labels-box-edit-labels-button')
    act(() => {
      editLabelButton.click()
    })
    const selectPanelDialog = screen.getByText('Sample title')
    expect(selectPanelDialog).toBeVisible()
  })
})
