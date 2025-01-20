import {controller} from '@github/catalyst'
import type {NavListElement} from '@primer/view-components/app/components/primer/beta/nav_list'

@controller
class NavigationListElement extends HTMLElement {
  #selectedLinkObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLMetaElement)) continue
        if (node.name !== 'selected-link') continue

        this.updateSelectedLink(node.getAttribute('value'))
      }
    }
  })

  connectedCallback() {
    this.#selectedLinkObserver.observe(document.head, {childList: true})

    // This is to make sure that the selected tab is updated when using back/forward buttons.
    document.addEventListener('turbo:load', () => {
      const selectedLink = document.head.querySelector<HTMLMetaElement>('meta[name="selected-link"]')

      if (selectedLink) this.updateSelectedLink(selectedLink.getAttribute('value'))
    })
  }

  disconnectedCallback() {
    this.#selectedLinkObserver.disconnect()
  }

  updateSelectedLink(selectedLink: string | null) {
    for (const navList of this.navLists) {
      if (navList.selectItemById(selectedLink) || navList.selectItemByHref(selectedLink)) {
        return
      }
    }

    for (const navList of this.navLists) {
      if (navList.selectItemByCurrentLocation()) {
        return
      }
    }
  }

  get navLists() {
    return this.querySelectorAll<NavListElement>('nav-list')
  }
}
