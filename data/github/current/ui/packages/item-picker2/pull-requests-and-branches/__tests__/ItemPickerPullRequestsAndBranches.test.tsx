import {useRef, useState} from 'react'
import {act, screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'

import {mockPullRequestsAndBranchesResolvers} from './helper'
import {
  ItemPickerPullRequestsAndBranches,
  type ItemPickerPullRequestsAndBranchesProps,
} from '../ItemPickerPullRequestsAndBranches'
import type {ItemPickerPullRequestsAndBranchesTestQuery as ItemPickerPullRequestsAndBranchesTestQueryType} from './__generated__/ItemPickerPullRequestsAndBranchesTestQuery.graphql'

type ItemPickerPullRequestsAndBranchesExampleComponentProps = Omit<
  ItemPickerPullRequestsAndBranchesProps,
  'selectedPullRequestsKey' | 'selectedBranchesKey' | 'owner' | 'repo' | 'setOpen' | 'buttonRef' | 'title'
>

const ItemPickerPullRequestsAndBranchesExampleComponent = (
  props: Omit<ItemPickerPullRequestsAndBranchesProps, 'repo' | 'owner' | 'title' | 'buttonRef' | 'setOpen'>,
) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(true)

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </button>
      <ItemPickerPullRequestsAndBranches
        {...props}
        title="Select a pull request or branch"
        buttonRef={buttonRef}
        open={open}
        setOpen={setOpen}
        repo="repo"
        owner="owner"
      />
    </>
  )
}

const setup = (props: ItemPickerPullRequestsAndBranchesExampleComponentProps) => {
  renderRelay<{
    rootQuery: ItemPickerPullRequestsAndBranchesTestQueryType
    listQuery: ItemPickerPullRequestsAndBranchesTestQueryType
  }>(
    ({queryData}) => (
      <ItemPickerPullRequestsAndBranchesExampleComponent
        selectedBranchesKey={queryData.rootQuery.repository!.issue!.linkedBranches}
        selectedPullRequestsKey={queryData.rootQuery.repository!.issue!.linkedPullRequests}
        {...props}
      />
    ),
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: graphql`
              query ItemPickerPullRequestsAndBranchesTestQuery($owner: String!, $repo: String!, $number: Int!)
              @relay_test_operation {
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    # eslint-disable-next-line relay/unused-fields
                    linkedBranches(first: 10) {
                      ...ItemPickerPullRequestsAndBranches_SelectedBranchesFragment
                    }
                    # eslint-disable-next-line relay/unused-fields
                    linkedPullRequests: closedByPullRequestsReferences(
                      first: 10
                      includeClosedPrs: false
                      orderByState: true
                    ) {
                      ...ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment
                    }
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
        mockResolvers: mockPullRequestsAndBranchesResolvers(),
      },
    },
  )
}

describe('ItemPickerPullRequestsAndBranches', () => {
  it('renders a title', () => {
    setup({})
    expect(screen.getByText('Select a pull request or branch')).toBeInTheDocument()
  })

  it('displays an error when the max number of items is reached', () => {
    setup({maxSelectableItems: 1})
    act(() => {
      screen.getByRole('option', {name: 'selected branch 0'}).click()
    })
    expect(screen.getByText('You can select up to 1 item(s).')).toBeInTheDocument()
  })
})
