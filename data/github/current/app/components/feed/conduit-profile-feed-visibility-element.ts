import {controller, target} from '@github/catalyst'
import {showGlobalError} from '../../assets/modules/github/behaviors/ajax-error'

@controller
class ConduitProfileFeedVisibilityElement extends HTMLElement {
  @target token: HTMLInputElement
  @target everyone: HTMLElement
  @target onlyMe: HTMLElement
  @target dropdown: HTMLDetailsElement
  @target url: HTMLInputElement

  setToPublic() {
    this.#submitVisibility('true')
    this.#toggleToEveryone()
  }

  setToPrivate() {
    this.#submitVisibility('false')
    this.#toggleToOnlyMe()
  }

  async #submitVisibility(visible: string) {
    const url = this.url.value
    const formData = new FormData()
    formData.append('profile_feed_visible', visible)
    let response
    try {
      response = await fetch(url, {
        method: 'PUT',
        body: formData,
        headers: {
          Accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'Scoped-CSRF-Token': this.token.value,
        },
      })
    } catch {
      showGlobalError()
    }

    if (response && !response.ok) {
      showGlobalError()
    } else {
      this.dropdown.removeAttribute('open')
    }
  }

  #toggleToOnlyMe() {
    this.everyone.hidden = true
    this.onlyMe.hidden = false
  }

  #toggleToEveryone() {
    this.onlyMe.hidden = true
    this.everyone.hidden = false
  }
}
