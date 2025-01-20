export function registerCustomElement(
  tagName: string,
  elementClass: CustomElementConstructor,
  options?: ElementDefinitionOptions | undefined,
) {
  if (typeof window === 'undefined') return
  if (!window.customElements.get(tagName)) {
    // Disabling these lint rules because they are not compatible with dynamic custom element registration
    // eslint-disable-next-line custom-elements/tag-name-matches-class, custom-elements/valid-tag-name
    window.customElements.define(tagName, elementClass, options)
  }
}
