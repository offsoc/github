import {PointerBox, TextInput} from '@primer/react'
import {type ChangeEvent, type KeyboardEvent, useCallback, useRef, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'
import {getNumberFieldValidationMessage, parseNumber} from '@github-ui/memex-field-validators'

import {LABELS} from '../../../constants/labels'
import {commitUpdateProjectItemFieldValueMutation} from '../../../mutations/update-project-item-field-value'
import type {NumberFieldConfigFragment$key} from './__generated__/NumberFieldConfigFragment.graphql'
import type {NumberFieldFragment$key} from './__generated__/NumberFieldFragment.graphql'
import {FieldWrapper} from './FieldWrapper'
import type {BaseFieldProps} from './Shared'

const NumberFieldFragment = graphql`
  fragment NumberFieldFragment on ProjectV2ItemFieldNumberValue {
    id
    number
    field {
      ...NumberFieldConfigFragment
    }
  }
`

const NumberFieldConfigFragment = graphql`
  fragment NumberFieldConfigFragment on ProjectV2Field {
    id
    name
  }
`

type NumberFieldProps = BaseFieldProps<NumberFieldConfigFragment$key, NumberFieldFragment$key>

export function NumberField({viewerCanUpdate, itemId, projectId, field, value, onIssueUpdate}: NumberFieldProps) {
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const environment = useRelayEnvironment()

  const fieldData = useFragment(NumberFieldConfigFragment, field)
  const valueData = useFragment(NumberFieldFragment, value)

  const fieldId = fieldData.id
  const fieldName = fieldData.name

  const originalValue = valueData?.number ? valueData.number.toString() : ''
  const [currentValue, setCurrentValue] = useState<string>(originalValue)
  const [invalidMessage, setInvalidMessage] = useState<string | undefined>(undefined)

  const commitCurrentValue = useCallback(() => {
    if (invalidMessage) {
      setCurrentValue(originalValue)
      setInvalidMessage(undefined)
    } else {
      const newValue = parseNumber(currentValue) ?? undefined
      commitUpdateProjectItemFieldValueMutation({
        environment,
        input: {
          fieldId,
          itemId,
          projectId,
          value: {number: newValue},
        },
        onCompleted: onIssueUpdate,
      })
    }
  }, [currentValue, environment, fieldId, invalidMessage, itemId, onIssueUpdate, originalValue, projectId])

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInvalidMessage(getNumberFieldValidationMessage(e.target.value))
    setCurrentValue(e.currentTarget.value)
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Enter') {
        commitCurrentValue()
        setShowInput(false)
      }
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (inputRef.current) {
          setCurrentValue(originalValue)
          // eslint-disable-next-line github/no-blur
          inputRef.current.blur()
          setShowInput(false)
        }
      }
    },
    [commitCurrentValue, originalValue],
  )

  if (!viewerCanUpdate)
    return (
      <FieldWrapper
        showInput={showInput}
        setShowInput={setShowInput}
        placeholder={LABELS.emptySections.noValue(fieldName)}
        canUpdate={false}
        value={currentValue}
        name={fieldName}
      />
    )

  return (
    <FieldWrapper
      showInput={showInput}
      setShowInput={setShowInput}
      value={currentValue}
      name={fieldName}
      placeholder={LABELS.emptySections.numberPlaceholder}
      inputRef={inputRef}
      onCommit={commitCurrentValue}
      input={
        <div>
          <TextInput
            data-testid="number-field-input"
            ref={inputRef}
            size="small"
            sx={{fontSize: 0}}
            type="number"
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={currentValue}
          />
          {invalidMessage ? (
            <PointerBox
              sx={{
                position: 'absolute',
                zIndex: 100,
                fontSize: 0,
                mt: '12px',
                py: 1,
                px: 2,
                bg: 'danger.subtle',
                color: 'fg.default',
                borderColor: 'danger.muted',
              }}
              caret="top-left"
            >
              <span>{invalidMessage}</span>
            </PointerBox>
          ) : null}
        </div>
      }
    />
  )
}
