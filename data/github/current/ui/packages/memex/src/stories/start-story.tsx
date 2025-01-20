import {setupWorker} from 'msw/browser'
import type {Root} from 'react-dom/client'

import {mockUsers} from '../mocks/data/users'
import type {ServerUrlData} from '../mocks/server/mock-server'
import {mockEmitMessageOnChannel} from '../mocks/socket-message'
import {initMockServer} from './helpers/init-mock-server'
import {startMemexStory} from './start-memex'
import type {StoryDefinition} from './story-definitions'

export async function startStory({
  storyDefinition,
  root,
  element,
  urlData,
}: {
  storyDefinition: StoryDefinition
  element: HTMLElement
  root: Root
  urlData: ServerUrlData
}) {
  const mockServer = initMockServer(storyDefinition, urlData)
  /**
   * Initialize mock-service-worker handlers
   */
  const worker = setupWorker(...mockServer.handlers)
  /**
   * Error on unhandled requests to avoid accidentally
   * attempting to call un-mocked apis
   */
  await worker.start({onUnhandledRequest: 'error', quiet: true})

  const params = new URLSearchParams(location.search)
  const forceErrorModeByParam = params.get('_force_error_mode') === '1'

  if (storyDefinition.enableErrorMode || forceErrorModeByParam) {
    worker.use(...mockServer.errorHandlers)
  }

  // Allow emoji characters to render in "unsupported browers" (e.g. Playwright) so that we can test components that render them
  if (window.GEmojiElement) {
    window.GEmojiElement.emojiSupportFunction = () => true
  }

  startMemexStory({storyDefinition, element, root})

  handleAfterMemexStarted(storyDefinition)
}

function handleAfterMemexStarted({showDefaultPresence, loggedInUser, afterPageLoad}: StoryDefinition) {
  /**
   * Once we start rendering, wait for the presence element, and then
   * emit a message if we should, once it is listening
   */
  if (showDefaultPresence !== false) {
    mockEmitMessageOnChannel('presence', {
      data: mockUsers.map(user => ({
        userId: user.id,
        isOwnUser: user.id === loggedInUser?.id,
        isIdle: Math.random() >= 0.5,
      })),
    })
  }

  afterPageLoad?.(window)
}
