import {Box} from '@primer/react'
import {Fragment, useMemo} from 'react'

import {sortActionsByPriority} from '../../helpers/workflow-utilities'
import {useAutomationGraph} from '../../state-providers/workflows/use-automation-graph'
import {ActionBlock} from './blocks/action-block'
import {Connector} from './connector'

interface AutomationGraphProps {
  onNoSuggestedRepositories?: () => void
}

export const AutomationGraph = ({onNoSuggestedRepositories}: AutomationGraphProps) => {
  const {workflow} = useAutomationGraph()
  const sortedActions = useMemo(() => {
    return workflow.actions.sort(sortActionsByPriority)
  }, [workflow.actions])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '80%',
        px: 3,
      }}
    >
      {sortedActions.map((action, index) => {
        return (
          <Fragment key={action.id ?? action.actionType}>
            <ActionBlock
              action={action}
              sortedActions={sortedActions}
              onNoSuggestedRepositories={onNoSuggestedRepositories}
            />
            {index < sortedActions.length - 1 && <Connector />}
          </Fragment>
        )
      })}
    </Box>
  )
}
