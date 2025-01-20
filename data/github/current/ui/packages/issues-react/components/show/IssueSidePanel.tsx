import {Box} from '@primer/react'

import {SidePanel} from '@github-ui/side-panel'
import {testIdProps} from '@github-ui/test-id-props'
import {useRef} from 'react'

type IssueSidePanelProps = {
  onClose: () => void
  children: React.ReactNode
}

export const IssueSidePanel = ({onClose, children}: IssueSidePanelProps) => {
  const sidePanelReturnFocusRef = useRef(null)
  const sidePanelInitialFocusRef = useRef<HTMLDivElement>(null)

  return (
    <SidePanel
      open
      defaultCloseElement="overlay"
      onClose={onClose}
      initialFocusRef={sidePanelInitialFocusRef}
      returnFocusRef={sidePanelReturnFocusRef}
      aria-labelledby="issue-side-panel"
      width="min(90%, 1280px)"
    >
      <Box sx={{display: 'contents'}} id="issue-viewer-side-panel">
        <span tabIndex={-1} ref={sidePanelInitialFocusRef} {...testIdProps('side-panel-focus-target')} />
        {children}
      </Box>
    </SidePanel>
  )
}
