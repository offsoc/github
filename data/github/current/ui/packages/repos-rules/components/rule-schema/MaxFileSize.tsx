import type {RefObject} from 'react'
import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {MaxHelper} from './MaxHelper'

export function MaxFileSize({field, value, onValueChange, readOnly, fieldRef, errors}: RegisteredRuleSchemaComponent) {
  return (
    <MaxHelper
      field={field}
      value={value as number}
      onValueChange={onValueChange}
      label="Maximum file size (MB)"
      description="This limit does not apply to Git Large File Storage (Git LFS)."
      readOnly={readOnly}
      errors={errors}
      fieldRef={fieldRef as RefObject<HTMLInputElement>}
    />
  )
}
