class HeroStatElement extends HTMLElement {
  connectedCallback(): void {
    this.render()
  }

  static get observedAttributes(): string[] {
    return ['value', 'label']
  }

  attributeChangedCallback(): void {
    this.render()
  }

  render(): void {
    const value = this.getAttribute('value')
    const labeltext = this.getAttribute('label')

    const wrapper = document.createElement('div')
    wrapper.classList.add('col-md-2')
    wrapper.setAttribute('role', 'button')
    wrapper.setAttribute('tabindex', '0')

    const innerDiv = document.createElement('div')
    innerDiv.classList.add('color-bg-subtle', 'height-full', 'color-shadow-small', 'mb-2', 'mb-md-0')

    const textDiv = document.createElement('div')
    textDiv.classList.add('p-3')

    const label = document.createElement('label')
    label.textContent = labeltext
    label.classList.add('color-fg-muted', 'text-normal')

    const valueDiv = document.createElement('div')
    valueDiv.textContent = value
    valueDiv.classList.add('color-fg-default', 'f2')

    textDiv.append(label, valueDiv)
    innerDiv.append(textDiv)

    wrapper.append(innerDiv)

    this.textContent = ''
    this.append(wrapper)
  }
}

function RegisterHeroStat() {
  if (!window.customElements.get('hero-stat')) {
    window.customElements.define('hero-stat', HeroStatElement)
  }
}

// eslint-disable-next-line custom-elements/no-exports-with-element
export {HeroStatElement, RegisterHeroStat}
