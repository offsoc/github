import {Box} from '@primer/react'

import type {MemexWorkflow} from '../../api/workflows/contracts'
import {useAutomationGraph} from '../../state-providers/workflows/use-automation-graph'

interface ConnectorEndProps {
  endpointPosition: 'top' | 'bottom'
  workflow: MemexWorkflow
}

const ConnectorEndpoint = ({endpointPosition, workflow}: ConnectorEndProps) => {
  const gradientDirection = endpointPosition === 'top' ? 'to bottom' : 'to top'

  return (
    <Box
      sx={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        marginTop: endpointPosition === 'top' ? '-8px' : '0px',
        marginBottom: endpointPosition === 'bottom' ? '-8px' : '0px',
        position: 'relative',
        zIndex: 1,
        backgroundImage: theme =>
          `linear-gradient(${gradientDirection}, ${theme.colors.canvas.default} 50%, ${theme.colors.border.default} 50%, ${theme.colors.border.default})`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '1px',
          left: '1px',
          width: '12px',
          height: '12px',
          backgroundColor: 'canvas.default',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '4px',
          left: '4px',
          width: '6px',
          height: '6px',
          backgroundColor: workflow.enabled ? 'accent.emphasis' : 'border.default',
          borderRadius: '50%',
          transition: 'background-color 0.3s ease-out',
        },
      }}
    />
  )
}

export const Connector = () => {
  const {workflow} = useAutomationGraph()
  return (
    <>
      <ConnectorEndpoint workflow={workflow} endpointPosition="top" />
      <Box
        sx={{
          height: '30px',
          width: '0',
          borderColor: workflow.enabled ? 'accent.muted' : 'border.muted',
          borderLeftWidth: '2px',
          borderStyle: 'solid',
          borderRight: 'none',
          transition: 'border-color 0.3s ease-out',
        }}
      />
      <ConnectorEndpoint workflow={workflow} endpointPosition="bottom" />
    </>
  )
}
