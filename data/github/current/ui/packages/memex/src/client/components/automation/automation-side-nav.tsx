import {testIdProps} from '@github-ui/test-id-props'
import {DotFillIcon, DotIcon, StopIcon} from '@primer/octicons-react'
import {ActionList, Box, NavList, Octicon, Text} from '@primer/react'
import {memo, useCallback} from 'react'

import type {ClientMemexWorkflow} from '../../api/workflows/contracts'
import {
  isArchiveWorkflow,
  isLastWorkflowOfType,
  isWorkflowPersisted,
  workflowTypeAsIdentity,
} from '../../helpers/workflow-utilities'
import {validateWorkflow} from '../../helpers/workflow-validation'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_WORKFLOW_CLIENT_ID_ROUTE} from '../../routes'
import {useArchiveStatus} from '../../state-providers/workflows/use-archive-status'
import {useWorkflows} from '../../state-providers/workflows/use-workflows'
import {NavLinkActionListItem} from '../react-router/action-list-nav-link-item'
import {WorkflowMenu} from './workflow-menu'

type AutomationSideNavProps = {
  activeWorkflow: ClientMemexWorkflow
}

export const AutomationSideNav = memo(({activeWorkflow}: AutomationSideNavProps) => {
  const {
    workflows,
    workflowWithTriggerTypeIsEnableable,
    setWorkflowMenuState,
    resetWorkflowMenuStates,
    isWorkflowMenuOpen,
    getWorkflowMenuItemsMap,
  } = useWorkflows()
  const {isArchiveFull} = useArchiveStatus()

  const onNavItemClickHandler = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent, workflowClientId: ClientMemexWorkflow['clientId']) => {
      // Pretty janky but there's no other way to add options to NavItems
      // This will prevent the href redirect, and open the menu if you click on the
      // SVG or the button.
      if (['button', 'svg', 'path'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        e.preventDefault()
        setWorkflowMenuState(workflowClientId)
      } else {
        resetWorkflowMenuStates()
      }
    },
    [resetWorkflowMenuStates, setWorkflowMenuState],
  )

  const routeParams = useProjectRouteParams()

  return (
    <NavList {...testIdProps('settings-side-nav')}>
      <NavList.Group>
        {/* Override default h3 heading
            see: https://github.com/primer/react/blob/f1c18250b807e247d03b8ea8a6b4954b819d18e3/src/ActionList/Group.tsx#L58
        */}
        <ActionList.GroupHeading as="h2">Default workflows</ActionList.GroupHeading>
        {workflows.map(workflow => {
          const enableable = workflowWithTriggerTypeIsEnableable(workflow.triggerType)
          const isActive = workflow.clientId === activeWorkflow.clientId
          const isNonPersistedUserWorkflow = workflow.isUserWorkflow && !isWorkflowPersisted(workflow)
          return (
            <NavLinkActionListItem
              to={{
                pathname: PROJECT_WORKFLOW_CLIENT_ID_ROUTE.generatePath({
                  ...routeParams,
                  workflowClientId: workflow.clientId,
                }),
              }}
              onClick={e => onNavItemClickHandler(e, workflow.clientId)}
              tabIndex={enableable ? 0 : -1}
              isActive={isActive}
              key={workflow.clientId}
              sx={{
                pointerEvents: enableable ? 'auto' : 'none',
                opacity: enableable ? undefined : 0.5,
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
              {...testIdProps(`workflow-nav-item-${workflowTypeAsIdentity(workflow)}`)}
            >
              <Box sx={{display: 'flex', flex: 'auto', alignItems: 'center', justifyContent: 'space-between'}}>
                <Box sx={{display: 'flex', alignItems: 'center', wordBreak: 'break-word'}}>
                  <ProjectWorkflowIcon
                    workflow={workflow}
                    isActive={isActive}
                    isArchiveFull={isArchiveFull}
                    isNonPersistedUserWorkflow={isNonPersistedUserWorkflow}
                  />
                  <WorkflowName name={workflow.name} isNonPersistedUserWorkflow={isNonPersistedUserWorkflow} />
                </Box>
                <Box sx={{flexShrink: '0', display: 'flex', alignItems: 'center'}}>
                  {isWorkflowPersisted(workflow) && (
                    <WorkflowMenu
                      key={`workflow-nav-list-item-${workflow.clientId}`}
                      ref={(node: HTMLButtonElement) => {
                        const map = getWorkflowMenuItemsMap()
                        if (node) {
                          map.set(workflow.clientId, node)
                        } else {
                          map.delete(workflow.clientId)
                        }
                      }}
                      workflow={workflow}
                      showDelete={!isLastWorkflowOfType(workflows, workflow)}
                      isOpen={isWorkflowMenuOpen(workflow.clientId)}
                    />
                  )}
                </Box>
              </Box>
            </NavLinkActionListItem>
          )
        })}
      </NavList.Group>
    </NavList>
  )
})

AutomationSideNav.displayName = 'AutomationSideNav'

type ProjectWorkflowIconProps = {
  workflow: ClientMemexWorkflow
  isActive: boolean
  isArchiveFull: boolean
  isNonPersistedUserWorkflow: boolean
}

const ProjectWorkflowIcon: React.FC<ProjectWorkflowIconProps> = ({
  workflow,
  isActive,
  isArchiveFull,
  isNonPersistedUserWorkflow,
}) => {
  if (isNonPersistedUserWorkflow) {
    return <Octicon icon={DotFillIcon} size={20} sx={{mr: 1, color: 'attention.emphasis'}} />
  }
  if (isArchiveFull && isArchiveWorkflow(workflow)) {
    return <Octicon icon={DotFillIcon} size={20} sx={{mr: 1, color: 'danger.fg'}} />
  }
  if (workflow.enabled) {
    return <Octicon icon={DotFillIcon} size={20} sx={{mr: 1, color: 'success.emphasis'}} />
  } else if (validateWorkflow(workflow).isValid) {
    return <Octicon icon={DotIcon} size={20} sx={{mr: 1, color: isActive ? 'fg.default' : 'fg.muted'}} />
  } else {
    return <Octicon icon={StopIcon} size={14} sx={{ml: '3px', mr: '7px', color: 'danger.fg'}} />
  }
}

type WorkflowNameProps = {
  name: string
  isNonPersistedUserWorkflow: boolean
}

const WorkflowName: React.FC<WorkflowNameProps> = ({name, isNonPersistedUserWorkflow}) => {
  if (isNonPersistedUserWorkflow) {
    return <Text sx={{fontStyle: 'italic'}}>{name}</Text>
  }
  return <span>{name}</span>
}
