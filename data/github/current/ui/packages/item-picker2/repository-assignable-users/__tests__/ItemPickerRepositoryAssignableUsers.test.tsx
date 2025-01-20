import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {useRef, useState} from 'react'
import {Button} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {graphql} from 'relay-runtime'
import {mockRepositoryAssignableUsersResolvers} from './helper'
import {
  ItemPickerRepositoryAssignableUsers,
  type ItemPickerRepositoryAssignableUsersProps,
} from '../ItemPickerRepositoryAssignableUsers'
import type {ItemPickerRepositoryAssignableUsersQuery} from './__generated__/ItemPickerRepositoryAssignableUsersQuery.graphql'
import type {ItemPickerRepositoryAssignableUsersList_Query} from '../__generated__/ItemPickerRepositoryAssignableUsersList_Query.graphql'

const renderItemPickerTest = (
  props?: {itemsCount?: number; selectedCount?: number} & Omit<
    ItemPickerRepositoryAssignableUsersProps,
    'repo' | 'owner' | 'title' | 'assigneesButtonRef' | 'selectedAssigneesKey' | 'setOpen'
  >,
) => {
  return renderRelay<{
    rootQuery: ItemPickerRepositoryAssignableUsersQuery
    listQuery: ItemPickerRepositoryAssignableUsersList_Query
  }>(
    ({queryData}) => {
      const buttonRef = useRef<HTMLButtonElement>(null)
      const [open, setOpen] = useState<boolean>(false)
      return (
        <>
          <Button
            ref={buttonRef}
            onClick={() => {
              setOpen(!open)
            }}
            {...testIdProps('assignees-button')}
          >
            Assignees
          </Button>
          <ItemPickerRepositoryAssignableUsers
            {...props}
            selectedAssigneesKey={queryData.rootQuery.repository!.assignableUsers}
            owner="owner"
            repo="repo"
            title="Sample title"
            assigneesButtonRef={buttonRef}
            open={open}
            setOpen={setOpen}
            onSubmit={() => {}}
          />
        </>
      )
    },
    {
      wrapper: Wrapper,
      relay: {
        queries: {
          rootQuery: {
            query: graphql`
              query ItemPickerRepositoryAssignableUsersQuery(
                $owner: String!
                $repo: String!
                $assignedUserLogins: String!
              ) @relay_test_operation {
                repository(owner: $owner, name: $repo) {
                  assignableUsers(first: 10, loginNames: $assignedUserLogins) {
                    ...ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment
                  }
                }
              }
            `,
            type: 'fragment',
            variables: {owner: 'owner', repo: 'repo', assignedUserLogins: ''},
          },
          listQuery: {
            type: 'lazy',
          },
        },
        mockResolvers: mockRepositoryAssignableUsersResolvers(props?.itemsCount, props?.selectedCount),
      },
    },
  )
}

describe('ItemPickerRepositoryAssignableUsers', () => {
  it('Renders itempicker assignable users dialog when clicking on assignees edit button', () => {
    renderItemPickerTest()
    const button = screen.getByTestId('assignees-button')
    act(() => {
      button.click()
    })
    const selectPanelDialog = screen.getByText('Sample title')
    expect(selectPanelDialog).toBeVisible()
  })

  it('Does not show duplicate user when preselected', () => {
    renderItemPickerTest({itemsCount: 3, selectedCount: 1})
    const button = screen.getByTestId('assignees-button')
    act(() => {
      button.click()
    })

    expect(screen.getAllByRole('option').length).toBe(3)
  })

  it('Renders warning message when max selectable items is reached', () => {
    renderItemPickerTest({maxSelectableItems: 2})
    const button = screen.getByTestId('assignees-button')

    act(() => {
      button.click()
    })
    expect(screen.getAllByRole('option').length).toBe(4)

    act(() => {
      screen.getByTitle('assignable user 1').click()
    })

    expect(screen.getByText('You can select up to 2 assignee(s).')).toBeInTheDocument()
  })
})
