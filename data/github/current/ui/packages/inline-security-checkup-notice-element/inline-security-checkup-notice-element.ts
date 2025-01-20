import {controller, target} from '@github/catalyst'

@controller
export class InlineSecurityCheckupNoticeElement extends HTMLElement {
  @target inlineSecurityBanner: HTMLElement | undefined

  connectedCallback() {
    // We shouldn't do this on the connectedCallback, but we need to hide the global banner if its related to emails
    // as soon as possible, so we aren't showing the same global and inline banner information at the same time.
    // If Javascript is disabled, we will still show the global banner and hide the inline banner, but that's a tradeoff we are willing to make.
    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    const verifiedEmailGlobalBanner = document.querySelector('#global-notice-verified-emails') as HTMLElement
    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    if (verifiedEmailGlobalBanner && this.inlineSecurityBanner?.classList.contains('inline-emails-banner')) {
      verifiedEmailGlobalBanner.hidden = true
    }

    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    const oneVerifiedEmailGlobalBanner = document.querySelector('#global-notice-one-verified-email') as HTMLElement
    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    if (oneVerifiedEmailGlobalBanner && this.inlineSecurityBanner?.classList.contains('inline-emails-banner')) {
      oneVerifiedEmailGlobalBanner.hidden = true
    }

    if (this.inlineSecurityBanner?.hidden) {
      this.inlineSecurityBanner.hidden = false
    }
  }

  disconnectedCallback() {
    const verifiedEmailGlobalBanner = document.querySelector('#global-notice-verified-emails') as HTMLElement
    if (verifiedEmailGlobalBanner?.hidden) {
      verifiedEmailGlobalBanner.hidden = false
    }

    const oneVerifiedEmailGlobalBanner = document.querySelector('#global-notice-one-verified-email') as HTMLElement
    if (oneVerifiedEmailGlobalBanner?.hidden) {
      oneVerifiedEmailGlobalBanner.hidden = false
    }
  }
}
