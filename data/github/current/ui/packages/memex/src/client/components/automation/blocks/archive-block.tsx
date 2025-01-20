import {testIdProps} from '@github-ui/test-id-props'
import {ArchiveIcon} from '@primer/octicons-react'

import {WorkflowResources} from '../../../strings'
import {AutomationBlock} from './automation-block'

export const ArchiveBlock = () => {
  return (
    <AutomationBlock
      icon={ArchiveIcon}
      iconBg="attention.subtle"
      iconColor="attention.fg"
      headerDescription={WorkflowResources.archiveItemLabel}
      {...testIdProps('automation-archive-block')}
    />
  )
}
