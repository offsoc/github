import type {Icon} from '@primer/octicons-react'

import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {useWorkflows} from '../../../state-providers/workflows/use-workflows'
import {ContentTypePicker} from '../content-type-picker'
import {AutomationBlock} from './automation-block'

type WhenBlockProps = {
  description?: string
  icon?: Icon
  iconColor?: string
  iconBg?: string
}

export const WhenBlock = ({description, icon, iconColor, iconBg}: WhenBlockProps) => {
  const {isEditing, workflow, localContentTypes, setLocalContentTypes} = useAutomationGraph()
  const {getValidContentTypesForTriggerType} = useWorkflows()
  const validContentTypes = getValidContentTypesForTriggerType(workflow.triggerType)

  return (
    <AutomationBlock icon={icon} iconBg={iconBg} iconColor={iconColor} headerDescription={description}>
      {validContentTypes.length > 1 && (
        <ContentTypePicker
          contentTypes={validContentTypes}
          onContentTypesSelected={setLocalContentTypes}
          selectedContentTypes={localContentTypes}
          isEditing={isEditing}
          testId="workflows-when-content-types"
        />
      )}
    </AutomationBlock>
  )
}
