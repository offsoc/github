import {useRef, useState} from 'react'
import {Button, Heading, NavList, Text} from '@primer/react'
import {GearIcon} from '@primer/octicons-react'
import {graphql, useFragment} from 'react-relay'
import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {SubmittedAssignee} from './types'
import {ItemPickerAssigneesBoxItem} from './ItemPickerAssigneesBoxItem'
import {ItemPickerAssignees} from './ItemPickerAssignees'

import type {ItemPickerAssigneesBox_SelectedAssigneesFragment$key} from './__generated__/ItemPickerAssigneesBox_SelectedAssigneesFragment.graphql'
import type {ItemPickerAssignees_CurrentViewerFragment$key} from './__generated__/ItemPickerAssignees_CurrentViewerFragment.graphql'

export type ItemPickerAssigneesBoxProps = {
  owner: string
  repo: string
  number: number
  selectedAssigneesKey: ItemPickerAssigneesBox_SelectedAssigneesFragment$key
  currentViewerKey: ItemPickerAssignees_CurrentViewerFragment$key
  sx?: BetterSystemStyleObject
  title: string
  onSubmit?: (selectedItems: SubmittedAssignee[]) => void
}

export function ItemPickerAssigneesBox({
  selectedAssigneesKey,
  currentViewerKey,
  ...props
}: ItemPickerAssigneesBoxProps) {
  const assigneesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const selectedAssignees = useFragment(
    graphql`
      fragment ItemPickerAssigneesBox_SelectedAssigneesFragment on Assignable {
        assignees(first: 20) {
          ...ItemPickerAssignees_SelectedAssigneesFragment
          nodes {
            ...ItemPickerAssigneesBoxItem_Fragment
          }
        }
      }
    `,
    selectedAssigneesKey,
  )

  // remove all null nodes in a TypeScript-friendly way
  const queriedSelectedAssignees = (selectedAssignees?.assignees.nodes || []).flatMap(a => (a ? a : []))

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
            <ItemPickerAssigneesBoxItem key={index} assigneeKey={assignee} />
          ))}
        </NavList>
      ) : (
        <div>
          <Text sx={{color: 'fg.muted', px: 2}}>No Assignees</Text>
        </div>
      )}

      <ItemPickerAssignees
        {...props}
        open={open}
        selectedAssigneesKey={selectedAssignees.assignees}
        currentViewerKey={currentViewerKey}
        setOpen={setOpen}
        assigneesButtonRef={assigneesButtonRef}
      />
    </>
  )
}
