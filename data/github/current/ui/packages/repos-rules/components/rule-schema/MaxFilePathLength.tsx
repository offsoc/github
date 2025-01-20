import type {RefObject} from 'react'
import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {MaxHelper} from './MaxHelper'

export function MaxFilePathLength({
  field,
  value,
  onValueChange,
  readOnly,
  fieldRef,
  errors,
}: RegisteredRuleSchemaComponent) {
  return (
    <MaxHelper
      field={field}
      value={value as number}
      onValueChange={onValueChange}
      label="Maximum file path length"
      readOnly={readOnly}
      errors={errors}
      fieldRef={fieldRef as RefObject<HTMLInputElement>}
    />
  )
}
