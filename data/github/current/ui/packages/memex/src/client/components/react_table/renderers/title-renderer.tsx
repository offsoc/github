import {testIdProps} from '@github-ui/test-id-props'
import {Box, Text} from '@primer/react'

import type {TitleValueWithContentType} from '../../../api/columns/contracts/storage'
import {isNumber, parseTitleNumber} from '../../../helpers/parsing'
import {useTableSidePanel} from '../../../hooks/use-side-panel'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {MemexItemIcon} from '../../common/memex-item-icon'
import {TextPlaceholder} from '../../common/placeholders'
import {InteractiveItemTitle} from '../../interactive-item-title'
import {BaseCell} from '../cells/base-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<TitleValueWithContentType>
  model: MemexItemModel
  isDisabled?: boolean
}>

export const LoadingTitleCell = () => (
  <BaseCell>
    <TextPlaceholder minWidth={80} maxWidth={200} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const TitleRenderer = withCellRenderer<Props>(
  function TitleRenderer({currentValue, model, isDisabled}) {
    useRecordCellRenderer('TitleRenderer', model.id)
    const titleValue = hasValue(currentValue) ? currentValue.value : undefined
    const number = parseTitleNumber(titleValue)
    const {openPane} = useTableSidePanel()

    return (
      <BaseCell>
        <Box sx={{flexShrink: 0, mr: 2, display: 'flex'}}>
          <MemexItemIcon titleColumn={currentValue} />
        </Box>
        <InteractiveItemTitle model={model} isDisabled={isDisabled} currentValue={currentValue} openPane={openPane} />
        {isNumber(number) && (
          <Box sx={{flexShrink: 0, ml: 2, display: 'flex'}}>
            <Text sx={{color: 'fg.muted'}}> #{number}</Text>
          </Box>
        )}
      </BaseCell>
    )
  },
  {
    nullWhenRedacted: false,
  },
)

TitleRenderer.displayName = 'TitleRenderer'
