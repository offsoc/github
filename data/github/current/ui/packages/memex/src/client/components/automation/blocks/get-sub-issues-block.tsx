import {testIdProps} from '@github-ui/test-id-props'
import {IssueTracksIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'

import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {WorkflowResources} from '../../../strings'
import {AutomationBlock} from './automation-block'

export const GetSubIssuesBlock = () => {
  const {isEditing} = useAutomationGraph()
  return (
    <AutomationBlock
      icon={IssueTracksIcon}
      iconBg="accent.subtle"
      iconColor="accent.fg"
      headerDescription={WorkflowResources.getSubIssuesBlockLabel}
      {...testIdProps('automation-get-sub-issues-block')}
    >
      {isEditing && (
        <div>
          <Box sx={{mb: 2}}>
            Enabling this workflow will automatically add sub-issues in the following scenarios:
            <Box as="ul" sx={{pt: 2, pl: 6}}>
              <li>When a sub-issue is added to an issue in the project</li>
              <li>When an issue with sub-issues is added to the project</li>
            </Box>
          </Box>
          <div>Note: This workflow will initially add all existing sub-issues of issues in the project.</div>
        </div>
      )}
    </AutomationBlock>
  )
}
