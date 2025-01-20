import {controller, target} from '@github/catalyst'

@controller
class SponsorshipsTabsElement extends HTMLElement {
  @target currentSponsorshipsTab: HTMLElement
  @target pastSponsorshipsTab: HTMLElement

  updateSelectedTab(event: Event) {
    const selectedTab = this.clickedTab(event.target as HTMLElement)
    const unselectedTab = this.oppositeTab(selectedTab)

    this.markUnselected(unselectedTab)
    this.markSelected(selectedTab)
  }

  markUnselected(tab: HTMLElement) {
    tab.removeAttribute('aria-current')
  }

  markSelected(tab: HTMLElement) {
    tab.setAttribute('aria-current', 'page')
  }

  clickedTab(tab: HTMLElement) {
    return tab === this.currentSponsorshipsTab ? this.currentSponsorshipsTab : this.pastSponsorshipsTab
  }

  oppositeTab(tab: HTMLElement) {
    return tab === this.currentSponsorshipsTab ? this.pastSponsorshipsTab : this.currentSponsorshipsTab
  }
}
