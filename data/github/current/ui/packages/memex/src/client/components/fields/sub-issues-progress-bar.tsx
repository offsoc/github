import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../models/column-model'
import type {SubIssuesProgressColumnModel} from '../../models/column-model/system/sub-issues-progress'
import {useColumnsStableContext} from '../../state-providers/columns/use-columns-stable-context'
import {ProgressBar} from './progress-bar'
import type {ProgressBarCustomProps} from './progress-bar/types'

type SubIssuesProgressBarProps = Omit<ProgressBarCustomProps, 'color' | 'variant' | 'hideNumerals'>

export function SubIssuesProgressBar(props: SubIssuesProgressBarProps) {
  const {variant, color, hideNumerals} = useSubIssuesProgressColumn()?.settings.progressConfiguration || {}

  return <ProgressBar variant={variant} color={color} hideNumerals={hideNumerals} {...props} />
}

function isSubIssuesProgressColumnModel(column: ColumnModel): column is SubIssuesProgressColumnModel {
  return column.dataType === MemexColumnDataType.SubIssuesProgress
}

function useSubIssuesProgressColumn() {
  const {allColumnsRef} = useColumnsStableContext()
  return allColumnsRef.current.find(isSubIssuesProgressColumnModel)
}
