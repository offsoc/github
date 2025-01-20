import {controller, target} from '@github/catalyst'

@controller
class CreateButtonElement extends HTMLElement {
  @target createButton: HTMLButtonElement
  @target dropdownButton: HTMLButtonElement
  @target selectionDetails: HTMLDetailsElement
  @target basicOptionsCheck: SVGElement
  @target advancedOptionsCheck: SVGElement
  @target configureAndCreateLink: HTMLAnchorElement
  @target loadingVscode: HTMLElement | undefined
  @target vscodePoller: HTMLElement | undefined

  useBasicCreation(): void {
    this.createButton.hidden = false
    this.configureAndCreateLink.hidden = true
    this.basicOptionsCheck.classList.remove('v-hidden')
    this.advancedOptionsCheck.classList.add('v-hidden')
    this.selectionDetails.open = false
  }

  useAdvancedCreation(): void {
    this.createButton.hidden = true
    this.configureAndCreateLink.hidden = false
    this.basicOptionsCheck.classList.add('v-hidden')
    this.advancedOptionsCheck.classList.remove('v-hidden')
    this.selectionDetails.open = false
  }

  toggleLoadingVscode() {
    if (this.loadingVscode) {
      const isHidden = this.loadingVscode.hidden
      const children = this.children
      for (let i = 0; i < children.length; i++) {
        ;(children[i] as HTMLElement).hidden = isHidden
      }
      this.loadingVscode.hidden = !isHidden
    }
  }

  pollForVscode(event: CustomEvent) {
    if (this.vscodePoller) {
      this.toggleLoadingVscode()
      const pollingUrl = (event.currentTarget as HTMLElement).getAttribute('data-src')
      if (pollingUrl) this.vscodePoller.setAttribute('src', pollingUrl)
    }
  }
}
