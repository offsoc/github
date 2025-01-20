import {memo, useCallback, useMemo} from 'react'

import type {Milestone} from '../../../api/common-contracts'
import type {SuggestedMilestone} from '../../../api/memex-items/contracts'
import {filterSuggestedMilestones} from '../../../helpers/milestone-suggester'
import {convertOptionToItem, getTitle, useMilestoneEditor} from '../../../hooks/editors/use-milestone-editor'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import {useRecordCellEditor} from '../performance-measurements'
import {MilestoneRenderer} from '../renderers'
import {SelectPanelEditor, type TSelectPanelEditorProps} from './select-panel-editor'

type AdditionalProps = {
  currentValue: ColumnValue<Milestone>
}

const MilestoneEditorFunc: React.FC<TSelectPanelEditorProps & AdditionalProps> = ({currentValue, model, ...props}) => {
  useRecordCellEditor('MilestoneEditor', model.id)

  const {fetchOptions, saveSelected} = useMilestoneEditor({model})

  const selected = useMemo(() => {
    const milestone = hasValue(currentValue) ? [currentValue.value] : []
    return milestone as Array<SuggestedMilestone>
  }, [currentValue])

  const renderButton = useCallback(() => {
    return <MilestoneRenderer currentValue={currentValue} model={model} />
  }, [currentValue, model])

  return (
    <SelectPanelEditor<SuggestedMilestone>
      model={model}
      placeholderText="Search milestones"
      blankslateText="No milestones to show."
      selected={selected}
      fetchOptions={fetchOptions}
      filterOptions={filterSuggestedMilestones}
      getSortAttribute={getTitle}
      convertOptionToItem={convertOptionToItem}
      groupMetadata={[
        {groupId: 'open', header: {title: 'Open', variant: 'filled'}},
        {groupId: 'closed', header: {title: 'Closed', variant: 'filled'}},
      ]}
      saveSelected={saveSelected}
      renderButton={renderButton}
      {...props}
      singleSelect
      height="auto"
      maxHeight="large"
    />
  )
}

export const MilestoneEditor = memo(MilestoneEditorFunc)
