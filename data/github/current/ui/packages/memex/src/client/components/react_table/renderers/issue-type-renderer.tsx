import {testIdProps} from '@github-ui/test-id-props'
import {colorNames, useNamedColor} from '@github-ui/use-named-color'
import {Box, Token} from '@primer/react'

import type {IssueType} from '../../../api/common-contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {type ColumnValue, hasValue, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {TextPlaceholder} from '../../common/placeholders'
import {BaseCell} from '../cells/base-cell'
import {DropdownCell} from '../cells/dropdown-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<IssueType>
  model: MemexItemModel
  dropdownRef?: React.MutableRefObject<HTMLButtonElement | null>
  isDisabled?: boolean
}>

export const LoadingIssueTypeCell = () => (
  <BaseCell>
    <TextPlaceholder minWidth={50} maxWidth={100} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const IssueTypeRenderer = withCellRenderer<Props>(function IssueTypeRenderer({
  currentValue,
  model,
  dropdownRef,
  isDisabled,
}) {
  useRecordCellRenderer('IssueTypeRenderer', model.id)
  const columnValue = hasValue(currentValue) ? currentValue.value : undefined

  const effectiveColor = colorNames.find(c => c === columnValue?.color)
  const color = useNamedColor(effectiveColor || 'GRAY')

  if (isLoading(currentValue)) {
    return <LoadingIssueTypeCell />
  }

  if (model.contentType === ItemType.DraftIssue) {
    return <DropdownCell ref={dropdownRef} isDisabled={isDisabled} />
  }

  return (
    <DropdownCell ref={dropdownRef} isDisabled={isDisabled}>
      {columnValue && (
        <Box sx={{overflow: 'hidden', display: 'flex'}}>
          <Token
            sx={{
              my: 0,
              bg: color.bg,
              color: color.fg,
              borderColor: color.border,
            }}
            text={columnValue.name}
          />
        </Box>
      )}
    </DropdownCell>
  )
})

IssueTypeRenderer.displayName = 'IssueTypeRenderer'
