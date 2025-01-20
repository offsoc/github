import {controller} from '@github/catalyst'

@controller
export class SecurityAnalysisGhasElement extends HTMLElement {
  checkDisabledCheckbox(event: Event) {
    return event.preventDefault()
  }
}
