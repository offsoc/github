import {useContext} from 'react'

import {AutomationGraphContext} from './automation-graph-state-provider'

export const useAutomationGraph = () => {
  const context = useContext(AutomationGraphContext)

  if (!context) {
    throw new Error('useAutomationGraph must be used within an AutomationGraphStateProvider')
  }
  return context
}
