import {XIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton, SplitPageLayout} from '@primer/react'
import {memo} from 'react'

import {isGenerativeTask} from '../utilities/task-helpers'
import type {ChatContainerProps} from './ChatContainer'
import {ChatContainer} from './ChatContainer'
import {GenerateFixPanel, type GeneratePanelFixProps} from './generate-fix-panel/GenerateFixPanel'
import {OverviewContent} from './OverviewContent'
import type {SuggestionProps} from './Suggestion'
import Suggestion, {SuggestionHeader} from './Suggestion'

export const enum RightPanelType {
  Chat = 'Chat',
  Suggestions = 'Suggestions',
  Overview = 'Overview',
  GenerateFix = 'GenerateFix',
  None = '',
}

interface BaseRightSidePanelProps {
  panelType: string
  onClose: () => void
}

type RightSidePanelProps = BaseRightSidePanelProps &
  ChatContainerProps &
  SuggestionProps &
  Omit<GeneratePanelFixProps, 'focusedGenerativeTask'>

const ContentComponent = (props: RightSidePanelProps) => {
  switch (props.panelType) {
    case RightPanelType.Chat:
      return <ChatContainer />
    case RightPanelType.Suggestions:
      return (
        <Suggestion
          allSuggestions={props.allSuggestions}
          currentTask={props.currentTask}
          setCurrentTask={props.setCurrentTask}
          notifyEdited={props.notifyEdited}
        />
      )
    case RightPanelType.Overview:
      return <OverviewContent />
    default:
      return null
  }
}

const TitleComponent = (props: RightSidePanelProps) => {
  const {panelType} = props
  switch (panelType) {
    case RightPanelType.Chat:
      return (
        <Heading as="h1" className="f5 text-semi-bold">
          Copilot
        </Heading>
      )
    case RightPanelType.Overview:
      return (
        <Heading as="h1" className="f5 text-semi-bold">
          Overview
        </Heading>
      )
    case RightPanelType.Suggestions:
      return (
        <div>
          <SuggestionHeader suggestion={props.currentTask} setCurrentTask={props.setCurrentTask} />
        </div>
      )
  }
}

const CancelButtonComponent = (props: RightSidePanelProps) => {
  const {onClose, panelType} = props
  return <IconButton aria-label={`Close ${panelType} panel`} icon={XIcon} variant="invisible" onClick={onClose} />
}

export const RightSidePanel = memo(function RightSidePanel(props: RightSidePanelProps) {
  if (props.panelType === RightPanelType.None) return null

  // GenerateFix renders its own panel so it can have a custom header and padding
  if (props.panelType === RightPanelType.GenerateFix && isGenerativeTask(props.currentTask)) {
    return <GenerateFixPanel focusedGenerativeTask={props.currentTask} onClose={props.onClose} />
  }

  return (
    <SplitPageLayout.Pane
      position="end"
      resizable={true}
      padding="none"
      sx={{
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        bg: 'canvas.default',
      }}
    >
      <div className="height-full d-flex flex-column">
        <Box
          sx={{
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderColor: 'border.default',
            p: 2,
            pl: 3,
          }}
          className="d-flex flex-row flex-justify-between flex-items-center"
        >
          <TitleComponent {...props} />
          <CancelButtonComponent {...props} />
        </Box>
        <Box sx={{p: 3}}>
          <ContentComponent {...props} />
        </Box>
      </div>
    </SplitPageLayout.Pane>
  )
})
