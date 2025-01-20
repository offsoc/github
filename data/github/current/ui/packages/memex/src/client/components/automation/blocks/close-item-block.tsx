import {testIdProps} from '@github-ui/test-id-props'
import {SkipIcon} from '@primer/octicons-react'

import {WorkflowResources} from '../../../strings'
import {AutomationBlock} from './automation-block'

export const CloseItemBlock = () => {
  return (
    <AutomationBlock
      icon={SkipIcon}
      iconBg="done.subtle"
      iconColor="done.fg"
      headerDescription={WorkflowResources.closeItemBlockLabel}
      {...testIdProps('automation-close-block')}
    />
  )
}
