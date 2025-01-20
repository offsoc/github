import {controller, target} from '@github/catalyst'

@controller
class SplitPageLayoutElement extends HTMLElement {
  @target pane: HTMLElement
  @target content: HTMLElement
  #listening: boolean
  #defaultTop: number
  #observer: IntersectionObserver

  updatePaneHeight = () => {
    const panePos = this.pane.getBoundingClientRect()
    const contentPos = this.content.getBoundingClientRect()
    let offset = `${panePos.top}px`

    if (panePos.top > this.#defaultTop) {
      // The pane hasn't reached the top
      offset = `${panePos.top}px`
    } else if (contentPos.bottom < window.innerHeight) {
      // The pane has reached the bottom
      const bottomOffset = window.innerHeight - contentPos.bottom
      offset = `${this.#defaultTop}px - ${bottomOffset}px`

      // the pane has passed the bottom with Safari's elastic scroll
      const elasticScroll = document.body.scrollHeight - window.scrollY
      if (elasticScroll < window.innerHeight) {
        const bottomElasticOffset = bottomOffset - (window.innerHeight - elasticScroll)
        offset = `${this.#defaultTop}px - ${bottomElasticOffset}px`
      }
    } else {
      // the pane is at the maximum available height
      this.stopScrollListeners()
    }

    this.pane.style.height = `calc(100vh - ${offset})`
  }

  startScrollListeners() {
    if (this.#listening === true) {
      return
    }
    this.#listening = true

    // eslint-disable-next-line github/prefer-observers
    window.addEventListener('scroll', this.updatePaneHeight)
    // eslint-disable-next-line github/prefer-observers
    window.addEventListener('resize', this.updatePaneHeight)

    this.updatePaneHeight()
  }

  stopScrollListeners() {
    if (this.#listening === false) {
      return
    }
    this.#listening = false

    window.removeEventListener('scroll', this.updatePaneHeight)
    window.removeEventListener('resize', this.updatePaneHeight)
  }

  connectedCallback() {
    if (this.#stickyPane) {
      this.setupStickyPane()
    }
  }

  disconnectedCallback() {
    this.#observer.unobserve(this.pane)
    this.stopScrollListeners()
  }

  setupStickyPane() {
    const defaultTop = parseFloat(getComputedStyle(this.pane).top)
    this.#defaultTop = isNaN(defaultTop) ? 0 : defaultTop

    this.#observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        for (const entry of entries) {
          // intersection ratio will be 1 when the pane is at full height and completely in view
          // at top/bottom edges, a full-height pane will be partially out of the observed section, so ratio < 1
          // so ratio < 1 means we need to start watching the scroll again
          if (entry.intersectionRatio < 1) {
            this.startScrollListeners()
          }
        }
      },
      {
        root: document,
        // we need to account for the "top" buffer
        rootMargin: `-${this.#defaultTop}px 0px 0px 0px`,
        threshold: [1],
      },
    )
    this.#observer.observe(this.pane)
    this.startScrollListeners()
  }

  get #stickyPane() {
    return this.pane && this.pane.classList.contains('PageLayout-pane--sticky')
  }
}
