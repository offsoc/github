import {controller, target, targets} from '@github/catalyst'
import {sendData} from '../../assets/modules/github/hydro-tracking'

@controller
class ReadmeTocElement extends HTMLElement {
  @target trigger: HTMLElement | null
  @target content: HTMLElement | null
  @targets entries: HTMLLinkElement[] | null

  private observer?: IntersectionObserver

  connectedCallback() {
    this.trigger?.addEventListener('menu:activate', this.onMenuOpened.bind(this))

    const headings = this.getHeadings()
    this.observer = new IntersectionObserver(() => this.observerCallback(), {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    })

    for (const heading of headings || []) {
      this.observer.observe(heading)
    }
  }

  disconnectedCallback() {
    this.trigger?.removeEventListener('menu:activate', this.onMenuOpened)
    this.observer?.disconnect()
  }

  public override blur() {
    window.setTimeout(() => {
      if (document.activeElement) {
        // eslint-disable-next-line github/no-blur
        ;(document.activeElement as HTMLElement).blur()
      }
    }, 0)
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  private onMenuOpened(event: Event) {
    const el = event.currentTarget as HTMLElement
    const payload = el.getAttribute('data-menu-hydro-click') || ''
    const hmac = el.getAttribute('data-menu-hydro-click-hmac') || ''
    const hydroClientContext = el.getAttribute('data-hydro-client-context') || ''
    sendData(payload, hmac, hydroClientContext)

    this.observerCallback()
  }

  private getHeadings(): NodeListOf<Element> | null {
    if (this.content) {
      return this.content.querySelectorAll('h1,h2,h3,h4,h5,h6')
    }
    return null
  }

  private observerCallback() {
    const headingsArray = Array.prototype.slice.call(this.getHeadings())
    const topVisibleHeading = headingsArray.find(heading => this.isElementInViewPort(heading))

    for (const heading of this.entries || []) {
      heading.removeAttribute('aria-current')
      heading.style.backgroundColor = ''
    }

    if (topVisibleHeading) {
      const matchingMenuItem = this.mapHeadingToListItemUsingAnchor(topVisibleHeading)
      if (matchingMenuItem) {
        matchingMenuItem.setAttribute('aria-current', 'page')
        matchingMenuItem.style.backgroundColor = 'var(--bgColor-accent-emphasis, var(--color-accent-emphasis))'

        const parent = matchingMenuItem.closest<HTMLDivElement>('div')
        if (parent && matchingMenuItem.offsetTop) {
          parent.scrollTop = matchingMenuItem.offsetTop - parseInt(getComputedStyle(parent)['paddingTop'])
        }
      }
    }
  }

  private isElementInViewPort(element: Element): boolean {
    const bounding = element.getBoundingClientRect()
    return bounding.y >= 0
  }

  private mapHeadingToListItemUsingAnchor(heading: HTMLElement): HTMLElement | undefined {
    const anchor = heading.getElementsByTagName<'a'>('a')[0]
    if (anchor && this.entries) {
      return this.entries.find(entry => entry.href.replace('user-content-', '') === anchor.href)
    }
  }
}
