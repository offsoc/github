import {useRef, useState} from 'react'
import {Button, Heading, NavList, Text} from '@primer/react'
import {GearIcon} from '@primer/octicons-react'
import {graphql, useFragment} from 'react-relay'
import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {SubmittedAssignee} from './types'
import {ItemPickerRepositoryAssignableUsers} from './ItemPickerRepositoryAssignableUsers'
import {ItemPickerRepositoryAssignableUsersBoxItem} from './ItemPickerRepositoryAssignableUsersBoxItem'

// GraphQL Type imports
import type {ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment$key} from './__generated__/ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment.graphql'

export type ItemPickerRepositoryAssignableUsersBoxProps = {
  selectedAssigneesKey: ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment$key | null
  owner: string
  repo: string
  sx?: BetterSystemStyleObject
  title: string
  onSubmit?: (selectedItems: SubmittedAssignee[]) => void
}

export function ItemPickerRepositoryAssignableUsersBox(props: ItemPickerRepositoryAssignableUsersBoxProps) {
  const result = useFragment(
    graphql`
      fragment ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment on UserConnection {
        ...ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment
        nodes {
          ...ItemPickerRepositoryAssignableUsersBoxItem_Fragment
        }
      }
    `,
    props.selectedAssigneesKey,
  )

  const assigneesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  // remove all null nodes in a TypeScript-friendly way
  const queriedSelectedAssignees = (result?.nodes || []).flatMap(a => (a ? a : []))

  return (
    <>
      <Button
        ref={assigneesButtonRef}
        variant="invisible"
        size="small"
        trailingAction={GearIcon}
        block
        sx={{
          '[data-component=buttonContent]': {flex: '1 1 auto', justifyContent: 'left'},
        }}
        onClick={() => {
          setOpen(!open)
        }}
        {...testIdProps('item-picker-assignees-box-edit-assignees-button')}
      >
        <Heading as="h3" sx={{color: 'fg.muted', fontSize: 0}}>
          Assignees
        </Heading>
        <span className="sr-only">Edit Assignees</span>
      </Button>

      {queriedSelectedAssignees.length > 0 ? (
        <NavList {...testIdProps('item-picker-assignees-box-assignees')} sx={{li: {mx: 0, width: '100%'}}}>
          {queriedSelectedAssignees.map((assignee, index) => (
            <ItemPickerRepositoryAssignableUsersBoxItem key={index} assigneeKey={assignee} />
          ))}
        </NavList>
      ) : (
        <div>
          <Text sx={{color: 'fg.muted', px: 2}}>No Assignees</Text>
        </div>
      )}

      <ItemPickerRepositoryAssignableUsers
        {...props}
        open={open}
        setOpen={setOpen}
        assigneesButtonRef={assigneesButtonRef}
        selectedAssigneesKey={result ?? null}
      />
    </>
  )
}
