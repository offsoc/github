// A wrapper around the HTML Element used to show a suggestion to the user.
export interface Ghost {
  // Clear any suggestion that's currently being shown
  reset(): void
  // Return the suggestion, if one is present
  getValue(): string
  // Set the suggestion to be shown to the user
  setSuggestion(prefix: string, completion: string, suffix: string): void
  // Reset the scroll position of the ghost to where the target textarea is
  // scrolled. This is important to keep the suggestion aligned with the user's
  // text.
  forceScroll(scrollTop: number): void
  // Return whether the ghost has a scrollbar or not. This is primarily used in
  // the calculations of how many lines are used to show the existing text with
  // a suggestion.
  hasScrollbar(): boolean
  // Align the height and position of the ghost to the target textarea
  matchStyles(localSource: HTMLTextAreaElement): void
}

export class GhostTextArea implements Ghost {
  source: HTMLTextAreaElement

  constructor(source: HTMLTextAreaElement) {
    this.source = source
  }

  reset() {
    this.source.value = ''
  }

  setSuggestion(prefix: string, completion: string, suffix: string): void {
    this.source.value = [prefix, completion, suffix].join('')
  }

  getValue() {
    return this.source.value
  }

  forceScroll(scrollTop: number) {
    this.source.scrollTop = scrollTop
  }

  // We measure whether there's a scrollbar that impacts our line wrapping based
  // on comparing client and offset widths.
  //
  // You CANNOT use comparison of height to scrollHeight to do this accurately,
  // because some OSes (like macOS) have settings which allow scrollbars to
  // appear without influencing padding or the opposite!
  //
  // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
  hasScrollbar(): boolean {
    // TODO: Account for borders which influence offset vs client too
    return this.source.offsetWidth !== this.source.clientWidth
  }

  matchStyles(localSource: HTMLTextAreaElement) {
    // We need to manage the heights carefully as any difference in
    // heights (and our margin-based positioning) can result in subpixel
    // differences which show up as "bolding".
    //
    // In particular, the main textarea on PRs have JS wired in that
    // sometimes resizes it to content with fractional pixels (via
    // max-height). If that's been done we need to track along with it.
    if (localSource.style.height && localSource.style.height.length > 0) {
      this.source.style.height = localSource.style.height
    } else {
      this.source.style.height = `${localSource.offsetHeight}px`
    }

    // Grab max-height if we have it
    let maxHeight = null
    if (localSource.style.maxHeight && localSource.style.maxHeight.length > 0) {
      this.source.style.maxHeight = localSource.style.maxHeight
      maxHeight = Number.parseFloat(localSource.style.maxHeight.replace('px', ''))
    }

    if (maxHeight && maxHeight < localSource.offsetHeight) {
      this.source.style.marginTop = `-${localSource.style.maxHeight}`
    } else if (localSource.offsetHeight === 0) {
      // If the form is loaded in the background, this may be called before the
      // element has a height and setting the margin-top to 0 will cause a bit
      // of the ghost element to be visible. The padding is 8px around the
      // input, so we can use -16px to hide the ghost element until we get more
      // accurate information about the input height.
      this.source.style.marginTop = `-16px`
    } else {
      this.source.style.marginTop = `-${localSource.offsetHeight}px`
    }
  }
}

export class GhostPre implements Ghost {
  source: HTMLPreElement
  value: string = ''

  constructor(source: HTMLPreElement) {
    this.source = source
    this.value = this.source.textContent || ''
  }

  reset() {
    this.source.textContent = ''
    this.value = ''
  }

  // Setting the prefix is important to set up the suggestion with the proper
  // spacing, and setting the suffix is important for the calculations of how
  // many lines are used to show the existing text with a suggestion.
  //
  // The target textarea appears to add a phantom newline when the scrollbar is
  // visible, perhaps to give the user an easy place to click, so we include a
  // newline in the pre to keep it aligned.
  setSuggestion(prefix: string, completion: string, suffix: string): void {
    this.value = [prefix, completion, suffix].join('')
    this.source.insertAdjacentElement('beforeend', this.styleTransparent(prefix))
    this.source.insertAdjacentElement('beforeend', this.styleSuggesting(completion))
    this.source.insertAdjacentElement('beforeend', this.styleTransparent(suffix))
    this.source.insertAdjacentText('beforeend', '\n')
  }

  getValue() {
    return this.value
  }

  forceScroll(scrollTop: number) {
    this.source.scrollTop = scrollTop
  }

  // We measure whether there's a scrollbar that impacts our line wrapping based
  // on comparing client and offset widths.
  //
  // You CANNOT use comparison of height to scrollHeight to do this accurately,
  // because some OSes (like macOS) have settings which allow scrollbars to
  // appear without influencing padding or the opposite!
  //
  // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
  hasScrollbar(): boolean {
    // TODO: Account for borders which influence offset vs client too
    return this.source.offsetWidth !== this.source.clientWidth
  }

  matchStyles(localSource: HTMLTextAreaElement) {
    // We need to manage the heights carefully as any difference in
    // heights (and our margin-based positioning) can result in subpixel
    // differences which show up as "bolding".
    //
    // In particular, the main textarea on PRs have JS wired in that
    // sometimes resizes it to content with fractional pixels (via
    // max-height). If that's been done we need to track along with it.
    if (localSource.style.height && localSource.style.height.length > 0) {
      this.source.style.height = localSource.style.height
    } else {
      this.source.style.height = `${localSource.offsetHeight}px`
    }

    // Grab max-height if we have it
    let maxHeight = null
    if (localSource.style.maxHeight && localSource.style.maxHeight.length > 0) {
      this.source.style.maxHeight = localSource.style.maxHeight
      maxHeight = Number.parseFloat(localSource.style.maxHeight.replace('px', ''))
    }

    if (maxHeight && maxHeight < localSource.offsetHeight) {
      this.source.style.marginTop = `-${localSource.style.maxHeight}`
    } else if (localSource.offsetHeight === 0) {
      // If the form is loaded in the background, this may be called before the
      // element has a height and setting the margin-top to 0 will cause a bit
      // of the ghost element to be visible. The padding is 8px around the
      // input, so we can use -16px to hide the ghost element until we get more
      // accurate information about the input height.
      this.source.style.marginTop = `-16px`
    } else {
      this.source.style.marginTop = `-${localSource.offsetHeight}px`
    }
  }

  private styleTransparent(value: string): HTMLSpanElement {
    const span = document.createElement('span')
    span.style.color = 'transparent'
    span.textContent = value
    return span
  }

  private styleSuggesting(value: string): HTMLSpanElement {
    const span = document.createElement('span')
    span.classList.add('fgColor-muted')
    span.textContent = value
    return span
  }
}
