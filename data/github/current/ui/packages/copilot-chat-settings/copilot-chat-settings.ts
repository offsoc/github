import {App} from './App'
import {ChatSettings} from './routes/ChatSettings'
import {NewKnowledgeBase} from './routes/NewKnowledgeBase'
import {EditKnowledgeBase} from './routes/EditKnowledgeBase'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('copilot-chat-settings', () => ({
  App,
  routes: [
    jsonRoute({path: '/organizations/:organization_id/settings/copilot/chat_settings', Component: ChatSettings}),
    jsonRoute({
      path: '/organizations/:organization_id/settings/copilot/chat_settings/new',
      Component: NewKnowledgeBase,
    }),
    jsonRoute({
      path: '/organizations/:organization_id/settings/copilot/chat_settings/:id/edit',
      Component: EditKnowledgeBase,
    }),
  ],
}))
