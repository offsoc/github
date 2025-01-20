import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'

import {WorkflowResources} from '../../../strings'
import {AutomationBlock} from './automation-block'

export const AddItemBlock = ({
  headerDescription = WorkflowResources.addItemBlockLabel,
}: {
  headerDescription?: string
}) => {
  return (
    <AutomationBlock
      icon={PlusIcon}
      iconBg="success.subtle"
      iconColor="success.fg"
      headerDescription={headerDescription}
      {...testIdProps('automation-add-item-block')}
    />
  )
}
