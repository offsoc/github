import {clsx} from 'clsx'
import styles from './checkbox-control.module.css'
import {Checkbox, FormControl} from '@primer/react'
import type {CopilotSeatAssignable, CopilotSeatAssignment, SeatAssignable} from '../../../types'
import {id} from '../../../helpers/id'

type SelectableEntity = CopilotSeatAssignment | CopilotSeatAssignable | SeatAssignable

type Props = {
  checked: boolean
  onChange: () => void
  selectable: SelectableEntity
  isDisabled?: boolean
  className?: string
  testId?: string
  label?: React.ReactNode
}

function isSeatAssignment(entity: SelectableEntity): entity is CopilotSeatAssignment {
  return 'assignable' in entity
}

function getAssignableName(entity: SelectableEntity) {
  if (isSeatAssignment(entity)) {
    return entity.assignable.login ?? entity.assignable.display_name ?? entity.assignable.slug
  }

  if ('login' in entity) {
    return entity.login
  }

  if ('display_login' in entity) {
    return entity.display_login
  }

  if ('slug' in entity) {
    return entity.slug
  }

  return ''
}

function getAssignableId(entity: SelectableEntity) {
  if ('assignable' in entity) {
    return entity.assignable.id
  }

  return id(entity as SeatAssignable)
}

function getAssignableType(entity: SelectableEntity) {
  if ('type' in entity) {
    return entity.type
  }

  if ('assignable_type' in entity) {
    return entity.assignable_type
  }

  return ''
}

export function SeatCheckboxControl(props: Props) {
  const {isDisabled, selectable, onChange, checked} = props
  const ariaAssignableName = getAssignableName(selectable)
  const assignableType = getAssignableType(selectable)
  const testId = props.testId ?? `${assignableType}-${getAssignableId(selectable)}-checkbox`

  return (
    <div className={clsx(styles.checkbox, props.className)}>
      <FormControl disabled={isDisabled}>
        <FormControl.Label visuallyHidden>
          {props.label ?? `Toggle access for ${ariaAssignableName || 'this entity'}`}
        </FormControl.Label>
        <Checkbox
          className={clsx(styles.checkbox, 'mt-0')}
          onChange={() => {
            !isDisabled && onChange()
          }}
          checked={checked}
          data-testid={testId}
          aria-label={`Select ${assignableType} ${ariaAssignableName}`}
        />
      </FormControl>
    </div>
  )
}
