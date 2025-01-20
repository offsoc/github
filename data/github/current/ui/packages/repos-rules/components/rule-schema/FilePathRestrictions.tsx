import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {RestrictHelper} from './RestrictHelper'

export function FilePathRestrictions({value, onValueChange, readOnly}: RegisteredRuleSchemaComponent) {
  return (
    <RestrictHelper
      value={value as string[]}
      onValueChange={onValueChange}
      readOnly={readOnly}
      boxName="Restricted file paths"
      buttonName="Add file path"
      subtitle="Commits that include changes to files in the specified file path will be rejected."
      label="File path"
      examples="Example: `.github/**/*`"
      blankslate="No file paths"
    />
  )
}
