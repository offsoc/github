import type {GenerateCopilotSummaryPayload} from './types'

export class GenerateCopilotSummaryEvent extends Event {
  declare payload: GenerateCopilotSummaryPayload

  constructor(payload: GenerateCopilotSummaryPayload) {
    super('generate-copilot-summary', {bubbles: false, cancelable: true})
    this.payload = payload
  }
}

declare global {
  interface WindowEventMap {
    'generate-copilot-summary': GenerateCopilotSummaryEvent
  }
}
