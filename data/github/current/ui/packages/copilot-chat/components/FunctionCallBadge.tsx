import type {CopilotChatManager} from '../utils/copilot-chat-manager'
import type {SkillExecution} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {useFunctionMetadata} from './FunctionLoadingUtils'

export const FunctionCallBadge = ({
  functionCall,
  manager,
  panelWidth,
}: {
  functionCall: SkillExecution
  manager: CopilotChatManager
  panelWidth: number | undefined
}) => {
  const {functionMetadata, functionRenderer, parsedArgs} = useFunctionMetadata(functionCall)
  const {mode} = useChatState()
  const useSelectReference = mode === 'immersive'
  return (
    <>
      {functionCall &&
        functionMetadata &&
        functionRenderer &&
        parsedArgs &&
        functionRenderer(functionCall, functionMetadata, manager, panelWidth, parsedArgs, useSelectReference)}
    </>
  )
}
