// "Autoplay animated images" accessibility setting behavior.
//
// The setting has three values:
//  - enabled: don't touch animated images, let them play at will
//  - disabled: always add a play button to animated images
//  - system: only add the play button if "reduce motion" is enabled on the
//    computer. This is the default setting.
//
// The pipeline code will wrap animated images with markup for an accessible
// player component <animated-image> which this provides the functionality for.
//

import {controller, target} from '@github/catalyst'
import {html, render} from '@github-ui/jtml-shimmed'
import {sendStats} from '@github-ui/stats'
import {sendEvent} from '@github-ui/hydro-analytics'

@controller
class AnimatedImageElement extends HTMLElement {
  @target originalImage: HTMLImageElement
  @target originalLink: HTMLAnchorElement

  @target player: HTMLElement
  @target controls: HTMLElement
  @target replacedImage: HTMLImageElement
  @target replacedLink: HTMLAnchorElement
  @target imageContainer: HTMLElement
  @target imageButton: HTMLElement
  @target playButton: HTMLElement
  @target openButton: HTMLElement

  containerObserver = new ResizeObserver(containers => {
    for (const container of containers) {
      if (
        (container.contentRect.width < 128 || container.contentRect.height < 56) &&
        (container.contentRect.width < 88 || container.contentRect.height < 88)
      ) {
        this.#showControls(false)
      } else {
        this.#showControls(true)
      }
    }
  })

  connectedCallback() {
    if (!this.isConnected) {
      return
    }

    if (!this.replacedImage) {
      this.#renderPlayer()
    }
    if (this.replacedImage.complete && this.replacedImage.naturalHeight !== 0) {
      this.#setupPlayer()
    } else {
      this.replacedImage.addEventListener('load', () => {
        this.#setupPlayer()
      })
    }
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      this.#showHidePlayer()
    })
  }

  #renderPlayer() {
    sendStats({incrementKey: 'ANIMATED_IMAGE_PLAYER_RENDER', requestUrl: window.location.href})
    sendEvent('animated_image_player.render')

    render(
      html`
      <span class="AnimatedImagePlayer" data-target="animated-image.player">
        <a data-target="animated-image.replacedLink" class="AnimatedImagePlayer-images"
          href="${this.originalLink ? this.originalLink.href : this.originalImage.src}" target="_blank">
          <span data-target="animated-image.imageContainer">
            <img data-target="animated-image.replacedImage" alt="${this.originalImage.alt}"
              class="AnimatedImagePlayer-animatedImage" src="${this.originalImage.src}"
              >
          </span>
        </a>
        <button data-target="animated-image.imageButton" class="AnimatedImagePlayer-images" tabindex="-1"></button>
        <span class="AnimatedImagePlayer-controls" data-target="animated-image.controls">
          <button data-target="animated-image.playButton" class="AnimatedImagePlayer-button">
            <svg aria-hidden="true" focusable="false" class="octicon icon-play" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 13.5427V2.45734C4 1.82607 4.69692 1.4435 5.2295 1.78241L13.9394 7.32507C14.4334 7.63943 14.4334 8.36057 13.9394 8.67493L5.2295 14.2176C4.69692 14.5565 4 14.1739 4 13.5427Z">
            </svg>
            <svg aria-hidden="true" focusable="false" class="octicon icon-pause" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="2" width="3" height="12" rx="1" />
              <rect x="9" y="2" width="3" height="12" rx="1" />
            </svg>
          </button>
          <a data-target="animated-image.openButton" aria-label="Open in new window" class="AnimatedImagePlayer-button"
            href="${this.originalLink ? this.originalLink.href : this.originalImage.src}" target="_blank">
            <svg aria-hidden="true" class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path fill-rule="evenodd" d="M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"></path>
            </svg>
          </a>
        </span>
      </span>`,
      this,
    )

    this.originalImage.hidden = true
    if (this.originalLink) {
      this.originalLink.hidden = true
    }

    const imgAlign = this.originalImage.getAttribute('align')

    switch (imgAlign) {
      case 'left':
        this.style.float = 'left'
        break
      case 'right':
        this.style.float = 'right'
        break
      case 'top':
        this.style.verticalAlign = 'top'
        break
      case 'middle':
        this.style.verticalAlign = 'middle'
        break
      case 'bottom':
        this.style.verticalAlign = 'bottom'
        break
    }

    const imgWidth = this.originalImage.getAttribute('width')

    // Check if image has no unit or percentage in width attribute, translate it into an inline style on the container element
    if (imgWidth) {
      if (imgWidth.endsWith('%') || imgWidth.endsWith('px')) {
        this.style.width = imgWidth
      } else if (/^[0-9]+$/.test(imgWidth)) {
        this.style.width = `${imgWidth}px`
      }
      this.originalImage.removeAttribute('width')
    }

    const imgHeight = this.originalImage.getAttribute('height')
    if (imgHeight) {
      this.replacedImage.setAttribute('height', imgHeight)
    }
  }

  #setupPlayer() {
    sendStats({incrementKey: 'ANIMATED_IMAGE_PLAYER_SETUP', requestUrl: window.location.href})
    sendEvent('animated_image_player.setup')

    const img = this.replacedImage
    const el = this.player
    const isLoaded = img.complete && img.naturalHeight !== 0

    if (isLoaded) {
      img.style.display = 'block'
      img.style.opacity = '0' // Make the image invisible for the time the canvas is drawn.
      this.#createStillImage(img)
      img.style.opacity = '1'
    }
    this.containerObserver.observe(el)
    this.#populateLabels()
    this.#showHidePlayer()

    // The entire controls of the Animated Image Player are based on the play state of the container
    // but otherwise handled in CSS only.
    const playButtons = [this.playButton, this.imageButton]
    for (const button of playButtons) {
      button.addEventListener('click', event => {
        if (
          (event.target! instanceof HTMLImageElement || event.target! instanceof HTMLButtonElement) &&
          this.#shouldPreventAutoplay()
        ) {
          event.preventDefault()
        }
        el.classList.toggle('playing')
        sendEvent('animated_image_player.play_pause')
        this.#togglePlayPauseLabels(playButtons)
      })
    }

    const playerControls = [this.playButton, this.openButton]
    for (const control of playerControls) {
      // Handle any of the controls receiving focus to retrigger their visibility and fade away when inactive.
      control.addEventListener('focus', () => {
        el.classList.add('player-focused')
        setTimeout(() => {
          el.classList.remove('player-focused')
        }, 1000)
      })
    }
  }

  #showHidePlayer() {
    this.player.classList.toggle('enabled', this.#shouldPreventAutoplay())
    if (this.player.classList.contains('enabled')) {
      this.player.hidden = false
      this.originalImage.hidden = true
      this.originalImage.style.display = 'none'
      if (this.originalLink) {
        this.originalLink.hidden = true
      }
    } else {
      this.player.hidden = true
      this.originalImage.hidden = false
      this.originalImage.style.display = 'inline-block'
      if (this.originalLink) {
        this.originalLink.hidden = false
      }
    }
  }

  #showControls(controls: boolean) {
    if (controls) {
      this.controls.hidden = false
      this.imageButton.appendChild(this.imageContainer)
      this.replacedLink.hidden = true
      this.imageButton.hidden = false
    } else {
      this.controls.hidden = true
      this.replacedLink.appendChild(this.imageContainer)
      this.replacedLink.hidden = false
      this.imageButton.hidden = true
    }
  }

  #populateLabels() {
    const img = this.replacedImage
    let alt = img.alt
    if (alt === '') {
      const src = this.originalImage.src
      alt = src.split('/').reverse()[0]!
      img.alt = alt
    }
    const buttons = [this.playButton, this.openButton, this.imageButton]
    for (const btn of buttons) {
      if (btn === this.openButton) {
        // eslint-disable-next-line i18n-text/no-en
        btn.setAttribute('aria-label', `Open ${alt} in new window`)
      } else {
        let current = btn.getAttribute('aria-label')
        if (current == null) {
          if (this.player.classList.contains('playing')) {
            current = 'Pause'
          } else {
            current = 'Play'
          }
        }
        btn.setAttribute('aria-label', `${current} ${alt}`)
      }
    }
  }

  #createStillImage(img: HTMLImageElement) {
    const canvasElement = document.createElement('canvas')
    canvasElement.classList.add('AnimatedImagePlayer-stillImage')
    canvasElement.setAttribute('aria-hidden', 'true')
    canvasElement.width = img.offsetWidth
    canvasElement.height = img.offsetHeight
    canvasElement.getContext('2d')!.drawImage(img, 0, 0, img.offsetWidth, img.offsetHeight)
    img.parentNode!.appendChild(canvasElement)
  }

  #togglePlayPauseLabels(playButtons: HTMLElement[]) {
    for (const button of playButtons) {
      const label = button.getAttribute('aria-label')!
      const state = label.match(/^\S*/)!
      const alt = label.match(/[\s].*/)
      if (state[0] === 'Play') {
        button.setAttribute('aria-label', `Pause${alt}`)
      } else if (state[0] === 'Pause') {
        button.setAttribute('aria-label', `Play${alt}`)
      }
    }
  }

  #shouldPreventAutoplay(): boolean {
    const preference =
      document.querySelector('html[data-a11y-animated-images]')?.getAttribute('data-a11y-animated-images') || 'system'

    return (
      preference === 'disabled' ||
      (preference === 'system' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    )
  }
}
