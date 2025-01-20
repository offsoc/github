import {controller, target, attr} from '@github/catalyst'

@controller
export class SidebarPinnedTopicsElement extends HTMLElement {
  PINNED_TOPICS_URL = '/dashboard/pinned_topics'

  @target showMoreBtn: HTMLElement
  @target showLessBtn: HTMLElement

  @attr expanded = false
  @attr activeLabel = 'for-you'

  get overflowTopics(): HTMLElement[] {
    return Array.from(this.querySelectorAll('.js-topic-feeds-item-overflow'))
  }

  public async reload() {
    const url = new URL(this.PINNED_TOPICS_URL, window.origin)
    url.searchParams.append('active', this.activeLabel)
    if (this.expanded) {
      url.searchParams.append('expanded', 'true')
    }

    const response = await fetch(url)
    const content = await response.text()
    this.outerHTML = content
  }

  public updateActiveLabel(e: Event) {
    const item = e.currentTarget as HTMLElement
    const name = item?.getAttribute('data-name')
    this.activeLabel = name || ''
  }

  public showMoreTopics() {
    for (const topic of this.overflowTopics) {
      topic.toggleAttribute('hidden', false)
    }

    this.showMoreBtn.toggleAttribute('hidden', true)
    this.showLessBtn.toggleAttribute('hidden', false)
    this.expanded = true
  }

  public showLessTopics() {
    for (const topic of this.overflowTopics) {
      topic.toggleAttribute('hidden', true)
    }

    this.showMoreBtn.toggleAttribute('hidden', false)
    this.showLessBtn.toggleAttribute('hidden', true)
    this.expanded = false
  }
}
