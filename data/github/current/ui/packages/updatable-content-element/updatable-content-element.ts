import {controller} from '@github/catalyst'
import {makeSocketMessageHandler} from '@github-ui/alive-socket-channel'

const handleSocketMessage = makeSocketMessageHandler()

@controller
export class UpdatableContentElement extends HTMLElement {
  connectedCallback() {
    this.addEventListener('socket:message', handleSocketMessage)
  }

  disconnectedCallback() {
    this.removeEventListener('socket:message', handleSocketMessage)
  }
}
