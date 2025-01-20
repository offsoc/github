import {controller} from '@github/catalyst'
import {html, render} from '@github-ui/jtml-shimmed'

@controller
export class FlywheelReturnToTourElement extends HTMLElement {
  connectedCallback(): void {
    this.renderSkipLink()
  }

  handleClick(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    // This event is handled by DemoRepoTour to return focus to the Tour UI
    this.dispatchEvent(new CustomEvent('return-to-flywheel-tour', {bubbles: true, composed: true}))
  }

  // The link is hidden by default. The DemoRepoTour react component will search
  // for this element and make it visible in the DOM when focus changes to the
  // called out element. That way the skip link is only shown if the tour UI is
  // also visible.
  renderSkipLink() {
    render(
      html`
        <a
          href="#flywheel-github-team-tour"
          class="js-flywheel-return-to-tour p-2 color-bg-accent-emphasis color-fg-on-emphasis show-on-focus rounded"
          onclick="${this.handleClick}"
          hidden
        >
          Back to tour
        </a>
      `,
      this,
    )
  }
}
