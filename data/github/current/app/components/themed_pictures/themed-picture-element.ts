import type {ColorModeWithAuto} from '../../assets/modules/github/color-modes'
import {controller} from '@github/catalyst'

@controller
class ThemedPictureElement extends HTMLElement {
  #mutationObserver: MutationObserver

  connectedCallback() {
    // if the first child (the picture element) is already loaded we can apply theming now.
    // we also attach a MutationObserver to wait for the picture to load or any updates to the child nodes.
    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    if (this.firstElementChild !== null) {
      this.applyTheming()
    }

    this.#mutationObserver = new MutationObserver(() => {
      this.applyTheming()
    })

    this.#mutationObserver.observe(this, {childList: true, subtree: true, attributes: false})
  }

  disconnectedCallback() {
    this.#mutationObserver.disconnect()
  }

  applyTheming() {
    let mode = this.ownerDocument
      .querySelector('html[data-color-mode]')
      ?.getAttribute('data-color-mode') as ColorModeWithAuto
    const img = this.querySelector('img')

    // if theming mode is auto show the preferred image
    if (mode === 'auto') {
      img?.setAttribute('style', 'visibility:visible;max-width:100%;')
      return
    }

    // if we're on a page such as marketplace where theming isn't enabled default to the light image
    if (mode === undefined || mode === null) {
      mode = 'light'
    }

    this.applyColorModeToPicture(this.firstElementChild as HTMLPictureElement, mode)

    // when applying theming make sure the image is hidden until loaded so that we reduce jitter around the theme change
    img?.addEventListener('load', () => {
      img.setAttribute('style', 'visibility:visible;max-width:100%;')
    })
  }

  private applyColorModeToPicture(picture: HTMLPictureElement, mode: ColorModeWithAuto) {
    const sources = picture.querySelectorAll('source')
    const sourcesLight: HTMLSourceElement[] = []
    const sourcesDark: HTMLSourceElement[] = []

    this.saveSourceThemes(sources, sourcesLight, sourcesDark)
    this.updatePictureTheme(mode, sourcesLight, sourcesDark)
  }

  private saveSourceThemes(
    sources: NodeListOf<HTMLSourceElement>,
    sourcesLight: HTMLSourceElement[],
    sourcesDark: HTMLSourceElement[],
  ) {
    for (const source of sources ?? []) {
      const media = source.getAttribute('media') ?? ''
      const theme = this.getSourceTheme(media)

      // invalid media theme or 'all'
      if (theme === null) continue

      // store the original source theme for when we need to update theming without page load
      if (!source.classList.contains('source-light' || 'source-dark')) {
        source.classList.add(`source-${theme}`)
      }

      if (source.classList.contains('source-light')) {
        sourcesLight.push(source)
      } else if (source.classList.contains('source-dark')) {
        sourcesDark.push(source)
      }
    }
  }

  // Based on mode set media to '(prefers-color-scheme: light),(prefers-color-scheme: dark)'
  // for all sources with matching theme, otherwise set to 'not all'
  private updatePictureTheme(
    mode: ColorModeWithAuto,
    sourcesLight: HTMLSourceElement[],
    sourcesDark: HTMLSourceElement[],
  ) {
    if (mode === 'light') {
      this.toggleSources({off: sourcesDark, on: sourcesLight})
    } else if (mode === 'dark') {
      this.toggleSources({off: sourcesLight, on: sourcesDark})
    }
  }

  private toggleSources({off, on}: {off: HTMLSourceElement[]; on: HTMLSourceElement[]}) {
    for (const source of on) {
      source.setAttribute('media', '(prefers-color-scheme: light),(prefers-color-scheme: dark)')
    }

    for (const source of off) {
      source.setAttribute('media', 'not all')
    }
  }

  private getSourceTheme(mediaQuery: string | null) {
    if (mediaQuery?.match('(prefers-color-scheme: light)')) {
      return 'light'
    } else if (mediaQuery?.match('(prefers-color-scheme: dark)')) {
      return 'dark'
    }
    return null
  }
}
