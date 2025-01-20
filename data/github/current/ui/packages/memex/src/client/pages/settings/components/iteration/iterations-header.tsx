import {testIdProps} from '@github-ui/test-id-props'
import {ArchiveIcon, ClockIcon} from '@primer/octicons-react'
import {Box, Button, Octicon} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {IterationConfiguration} from '../../../../api/columns/contracts/iteration'
import {BaseIterationRowStyle} from './iteration-row-skeleton'
import {NewIterationModalButton, type NewIterationModalButtonProps} from './new-iteration-modal-button'
import type {SelectedTab} from './types'

type IterationHeaderProps = {
  selectedTab: SelectedTab
  setSelectedTab: (tab: SelectedTab) => void
  configuration: IterationConfiguration
  addButtonProps: NewIterationModalButtonProps
  disabled?: boolean
  tabpanelId: string
}

const getButtonStyle = (disabled: boolean, selected: boolean): BetterSystemStyleObject => {
  return {
    bg: 'transparent',
    border: 'none',
    p: 4,
    cursor: disabled && !selected ? 'not-allowed' : 'pointer',
    fontWeight: selected ? 'semibold' : 'inherit',
    color: selected ? 'fg.default' : disabled ? 'fg.subtle' : 'fg.muted',
  }
}

export function IterationsHeader({
  selectedTab,
  setSelectedTab,
  configuration,
  addButtonProps,
  disabled = false,
  tabpanelId,
}: IterationHeaderProps) {
  const activeIterationsCount = configuration.iterations.length
  const completedIterationsCount = configuration.completedIterations.length

  return (
    <div>
      <Box
        sx={{
          ...BaseIterationRowStyle,
          bg: 'canvas.subtle',
          p: 0,
          alignItems: 'center',
        }}
      >
        <div role="tablist" aria-disabled={disabled} style={{display: 'flex'}}>
          <Button
            sx={getButtonStyle(disabled, selectedTab === 'active')}
            key="active"
            role="tab"
            aria-controls={selectedTab === 'active' ? tabpanelId : undefined}
            {...testIdProps('active-iterations')}
            onClick={() => {
              if (!disabled) setSelectedTab('active')
            }}
            aria-label="Active iterations"
            aria-disabled={disabled}
            disabled={disabled}
          >
            <Octicon icon={ClockIcon} sx={{color: 'inherit', mr: 2}} aria-label="Active iterations" />
            <span>{activeIterationsCount} Active</span>
          </Button>

          <Button
            sx={getButtonStyle(disabled, selectedTab === 'completed')}
            key="completed"
            role="tab"
            aria-controls={selectedTab === 'completed' ? tabpanelId : undefined}
            {...testIdProps('completed-iterations')}
            onClick={() => {
              if (!disabled) setSelectedTab('completed')
            }}
            aria-label="Completed iterations"
            aria-disabled={disabled}
            disabled={disabled}
          >
            <Octicon icon={ArchiveIcon} sx={{color: 'inherit', mr: 2}} aria-label="Completed iterations" />
            <span>{completedIterationsCount} Completed</span>
          </Button>
        </div>
        {selectedTab === 'active' && (
          <Box sx={{ml: 'auto', mr: 3}}>
            <NewIterationModalButton {...addButtonProps} />
          </Box>
        )}
      </Box>
    </div>
  )
}
