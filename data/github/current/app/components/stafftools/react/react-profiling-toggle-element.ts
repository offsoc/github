import ReactProfilingMode from '@github-ui/react-profiling-mode'
import {controller, target} from '@github/catalyst'

@controller
class ReactProfilingToggleElement extends HTMLElement {
  @target profilingToggleButton: HTMLElement

  connectedCallback() {
    window.addEventListener('load', this.updateIfProfilingModeEnabled)
  }

  disconnectedCallback() {
    window.removeEventListener('load', this.updateIfProfilingModeEnabled)
  }

  updateIfProfilingModeEnabled = () => {
    if (ReactProfilingMode.isEnabled()) {
      this.profilingToggleButton.setAttribute('aria-pressed', 'true')
      this.profilingToggleButton.classList.add('color-text-white')
      this.setTooltipTextToDisabledState()
    }
  }

  setTooltipTextToDisabledState() {
    const tooltip = this.ownerDocument.querySelector(`tool-tip[for="${this.profilingToggleButton.id}"]`)
    if (tooltip) {
      // eslint-disable-next-line i18n-text/no-en
      tooltip.textContent = 'Disable React performance profiling mode'
    }
  }

  toggleReactPerformanceProfilingMode() {
    if (ReactProfilingMode.isEnabled()) {
      ReactProfilingMode.disable()
    } else {
      ReactProfilingMode.enable()
    }
    window.location.reload()
  }
}
