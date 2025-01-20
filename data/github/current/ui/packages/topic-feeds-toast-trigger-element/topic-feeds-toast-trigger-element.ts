import {controller, attr} from '@github/catalyst'
import {toggleToast} from '@github-ui/toggle-toast'

@controller
export class TopicFeedsToastTriggerElement extends HTMLElement {
  @attr topicDisplayName: string
  @attr topicName: string

  connectedCallback() {
    this.addEventListener('social:success', this.handleSocialSuccess)
  }

  public handleSocialSuccess(e: Event) {
    const detail: Response = (e as CustomEvent).detail

    // only display toast when starring a topic
    if (detail.url.match('/star')) {
      const toastWrapper = document.querySelector('.js-topic-feeds-toast')
      if (!toastWrapper) return

      const boldedTopic = document.createElement('b')
      boldedTopic.textContent = this.topicDisplayName
      const updatedHTML = toastWrapper.innerHTML
        .replace('{topic_display_name}', boldedTopic.outerHTML)
        .replace(encodeURIComponent('{topic_name}'), this.topicName)

      toggleToast(updatedHTML, {closeAfter: 5000})
    }
  }
}
