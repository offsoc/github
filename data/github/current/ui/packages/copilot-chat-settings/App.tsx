import type React from 'react'
import CopilotChatSettingsService, {CopilotChatSettingsServiceContext} from './utils/copilot-chat-settings-service'
import {useMemo} from 'react'
import type {CopilotChatOrg} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

export interface AppPayload {
  apiUrl: string
  ssoOrganizations: CopilotChatOrg[]
}

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  const payload = useRoutePayload<AppPayload>()
  const service = useMemo(
    () => new CopilotChatSettingsService(payload.apiUrl, payload.ssoOrganizations),
    [payload.apiUrl, payload.ssoOrganizations],
  )

  return (
    <CopilotChatSettingsServiceContext.Provider value={service}>
      {props.children}
    </CopilotChatSettingsServiceContext.Provider>
  )
}
