import {TriangleDownIcon} from '@primer/octicons-react'
import {Octicon, Text, type TextProps} from '@primer/react'

import {omit} from '../../../../../utils/omit'
import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import {ViewerPrivileges} from '../../../../helpers/viewer-privileges'
import {Resources} from '../../../../strings'
import {SanitizedHtml} from '../../../dom/sanitized-html'

type SidebarTextValueWithFallbackProps = ({text?: string} | {dangerousHtml?: string}) & FallbackTextProps & TextProps

export const TextValueWithFallback = ({columnName, columnType, ...props}: SidebarTextValueWithFallbackProps) => {
  if ('dangerousHtml' in props && props.dangerousHtml) {
    return <SanitizedHtml {...omit(props, ['dangerousHtml'])}>{props.dangerousHtml}</SanitizedHtml>
  }
  if ('text' in props && props.text) {
    return <Text {...omit(props, ['text'])}>{props.text}</Text>
  }
  return <FallbackText columnName={columnName} columnType={columnType} {...props} />
}

type FallbackTextProps = {
  columnName: string
  columnType?: MemexColumnDataType
} & TextProps

const defaultSx = {}
const FallbackText = ({columnName, columnType, sx = defaultSx, ...props}: FallbackTextProps) => {
  const {hasWritePermissions} = ViewerPrivileges()

  if (!hasWritePermissions) {
    return (
      <Text sx={{color: 'fg.subtle', ...sx}} {...props}>
        {Resources.noPermissionEmptyColumnValue(columnName)}
      </Text>
    )
  }
  let emptyTextValue
  switch (columnType) {
    case MemexColumnDataType.Number: {
      emptyTextValue = Resources.emptyColumnNameValue.number
      break
    }
    case MemexColumnDataType.Date: {
      emptyTextValue = Resources.emptyColumnNameValue.date
      break
    }
    case MemexColumnDataType.Text: {
      emptyTextValue = Resources.emptyColumnNameValue.text
      break
    }
    case MemexColumnDataType.SingleSelect: {
      emptyTextValue = Resources.emptyColumnNameValue.singleSelect
      break
    }
    case MemexColumnDataType.Iteration: {
      emptyTextValue = Resources.emptyColumnNameValue.iteration
      break
    }
    default: {
      emptyTextValue = Resources.addColumnNameValue(columnName)
      break
    }
  }
  return (
    <div>
      <Text sx={{color: 'fg.subtle', ...sx}} {...props}>
        {emptyTextValue}
      </Text>
      {(columnType === MemexColumnDataType.Iteration || columnType === MemexColumnDataType.SingleSelect) && (
        <Octicon
          icon={TriangleDownIcon}
          size="small"
          sx={{
            verticalAlign: 'middle',
            color: 'fg.muted',
            opacity: 0.3,
            '.is-focused &': {opacity: 1},
            ml: 2,
          }}
        />
      )}
    </div>
  )
}
