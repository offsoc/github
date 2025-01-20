import {DatePicker} from '@github-ui/date-picker'
import {useCallback, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {commitClearProjectItemFieldValueMutation} from '../../../mutations/clear-project-item-field-value'
import {commitUpdateProjectItemFieldValueMutation} from '../../../mutations/update-project-item-field-value'
import type {DateFieldConfigFragment$key} from './__generated__/DateFieldConfigFragment.graphql'
import type {DateFieldFragment$key} from './__generated__/DateFieldFragment.graphql'
import {FieldWrapper} from './FieldWrapper'
import type {BaseFieldProps} from './Shared'

const DateFieldFragment = graphql`
  fragment DateFieldFragment on ProjectV2ItemFieldDateValue {
    id
    date
    field {
      ...DateFieldConfigFragment
    }
  }
`

const DateFieldConfigFragment = graphql`
  fragment DateFieldConfigFragment on ProjectV2Field {
    id
    name
  }
`

type DateFieldProps = BaseFieldProps<DateFieldConfigFragment$key, DateFieldFragment$key>

export function DateField({viewerCanUpdate, itemId, projectId, field, value, onIssueUpdate}: DateFieldProps) {
  const environment = useRelayEnvironment()

  const fieldData = useFragment(DateFieldConfigFragment, field)
  const valueData = useFragment(DateFieldFragment, value)

  const fieldId = fieldData.id
  const fieldName = fieldData.name

  const valueDataAsDate = valueData ? new Date(valueData.date) : null
  const currentDisplayValue = valueDataAsDate ? formatDateString(valueDataAsDate) : 'No date'

  const [currentValue, setCurrentValue] = useState<Date | null>(valueDataAsDate)
  const [showInput, setShowInput] = useState(false)

  const onDatePickerChange = useCallback(
    (date: Date | null) => {
      setCurrentValue(date)
      if (!date) {
        commitClearProjectItemFieldValueMutation({
          environment,
          input: {
            fieldId,
            itemId,
            projectId,
          },
          onCompleted: onIssueUpdate,
        })
      } else {
        // convert to iso format, removing the timezone offset
        const isoDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
        commitUpdateProjectItemFieldValueMutation({
          environment,
          input: {
            fieldId,
            itemId,
            projectId,
            value: {date: isoDateTime.slice(0, 10)},
          },
          onCompleted: onIssueUpdate,
        })
      }
    },
    [environment, fieldId, itemId, onIssueUpdate, projectId],
  )

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      return (
        <FieldWrapper
          showInput={showInput}
          setShowInput={setShowInput}
          anchorProps={anchorProps}
          placeholder={LABELS.emptySections.datePlaceholder}
          value={currentDisplayValue || LABELS.emptySections.noValue(fieldName)}
          name={fieldName}
        />
      )
    },
    [currentDisplayValue, fieldName, showInput],
  )

  if (!viewerCanUpdate)
    return (
      <FieldWrapper
        showInput={showInput}
        setShowInput={setShowInput}
        placeholder={LABELS.emptySections.noValue(fieldName)}
        canUpdate={false}
        name={fieldName}
        value={currentDisplayValue}
      />
    )

  return (
    <DatePicker
      variant="single"
      showClearButton
      value={currentValue}
      onChange={onDatePickerChange}
      anchor={renderAnchor}
    />
  )
}

// copied from memex in ui/packages/memex/src/client/helpers/parsing.ts
const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
} as const

export function formatDateString(value: Date, extraFormatOptions = {}): string {
  return value.toLocaleDateString('en-us', {...DATE_FORMAT_OPTIONS, ...extraFormatOptions})
}
