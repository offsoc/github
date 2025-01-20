import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {RestrictHelper} from './RestrictHelper'

export function FileExtensionRestrictions({value, onValueChange, readOnly}: RegisteredRuleSchemaComponent) {
  return (
    <RestrictHelper
      value={value as string[]}
      onValueChange={onValueChange}
      readOnly={readOnly}
      boxName="Restricted file extensions"
      buttonName="Add file extension"
      subtitle="Commits that include files with the specified file extension will be rejected."
      label="File extension"
      examples="Examples: `bin`, `exe`"
      blankslate="No file extensions"
      validationError={(extension: string) => {
        if (extension.includes('\\') || extension.includes('/') || extension.includes('*')) {
          return 'File extension cannot contain \\, /, or *'
        }
        return ''
      }}
      prefix="*."
    />
  )
}
