import {controller, target} from '@github/catalyst'

@controller
class VariableValueElement extends HTMLElement {
  @target valueText: HTMLElement
  @target parentDiv: HTMLElement
  @target toggleButton: HTMLElement

  connectedCallback() {
    this.initialise()
  }

  initialise() {
    const value = this.valueText.innerHTML
    const numberOfLineBreaks = (value.match(/\n/g) || []).length

    // Check if width of text is more than the parent div width.
    // This would mean that we have an overflow and need to handle it.
    const parentDiv_width = this.parentDiv.offsetWidth
    const value_width = this.valueText.offsetWidth
    const overflow = value_width > parentDiv_width

    if (numberOfLineBreaks > 0 || overflow) {
      // In case of an overflow
      // 1. Reduce width of parent div to show the toggle button. Width of toggle button is ~20px so we reduce the width by 40px.
      // 2. Show the toggle button
      const new_width = (parentDiv_width - 40).toString().concat('px')
      this.parentDiv.style.width = new_width
      this.toggleButton.hidden = false
    }
  }

  toggleText() {
    // Upon the click of toggle button we add/remove `nowrap` style
    if (this.valueText.style.whiteSpace === 'nowrap') {
      this.valueText.style.whiteSpace = 'pre-wrap'
    } else {
      this.valueText.style.whiteSpace = 'nowrap'
    }
  }
}
