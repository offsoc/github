import {testIdProps} from '@github-ui/test-id-props'
import {XIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton, Overlay, useFocusTrap} from '@primer/react'

import {useMemexRootHeight} from '../../../../hooks/use-memex-root-height'
import type {ChartState} from '../../../../state-providers/charts/use-charts'
import {useInsightsConfigurationPane} from '../../hooks/use-insights-configuration-pane'
import {ActionButtons} from './action-buttons'
import {LayoutSelector} from './layout-selector'
import {XAxisSelector} from './x-axis-selector'
import {YAxisSelector} from './y-axis-selector'

const InsightsConfigurationPaneForm = ({
  chart,
  showUpsellDialog,
}: {
  chart: ChartState
  showUpsellDialog: () => void
}) => {
  return (
    <div>
      <Box sx={{px: 4}}>
        <LayoutSelector chart={chart} />
        <XAxisSelector chart={chart} />
        <YAxisSelector chart={chart} />
      </Box>
      <Box sx={{p: 4, borderTop: '1px solid', borderColor: 'border.default'}}>
        <ActionButtons chart={chart} showUpsellDialog={showUpsellDialog} />
      </Box>
    </div>
  )
}

export const InsightsConfigurationPane = ({
  chart,
  showUpsellDialog,
  returnFocusRef,
}: {
  chart: ChartState
  showUpsellDialog: () => void
  returnFocusRef: React.RefObject<HTMLButtonElement>
}) => {
  const {closePane, isOpen} = useInsightsConfigurationPane()
  const appHeight = useMemexRootHeight()
  const {containerRef} = useFocusTrap()

  if (!isOpen) return null

  return (
    <Overlay returnFocusRef={returnFocusRef} onEscape={closePane} onClickOutside={closePane}>
      <Box
        ref={containerRef as React.RefObject<HTMLDivElement>}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'fixed',
          bottom: '0',
          right: '0',
          width: 400,
          height: appHeight.clientHeight,
          backgroundColor: 'canvas.default',
          boxShadow: 'shadow.large',
          borderLeft: '1px solid',
          borderColor: 'border.default',
          ':focus': {outline: 'none'},
        }}
        {...testIdProps('insights-configuration-pane')}
      >
        <Box sx={{px: 4, py: 3, display: 'flex', justifyContent: 'space-between'}}>
          <Heading as="h2" sx={{fontSize: 2}}>
            Configure chart
          </Heading>
          <IconButton
            aria-label="Close configuration pane"
            variant="invisible"
            icon={XIcon}
            sx={{px: 2}}
            onClick={closePane}
            {...testIdProps('side-panel-button-close')}
          />
        </Box>
        <InsightsConfigurationPaneForm chart={chart} showUpsellDialog={showUpsellDialog} />
      </Box>
    </Overlay>
  )
}
