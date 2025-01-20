interface CSPTrustedTypesPolicy {
  createHTML: (s: string, response: Response) => CSPTrustedHTMLToStringable
}
interface CSPTrustedHTMLToStringable {
  toString: () => string
}
export default class IncludeFragmentElement extends HTMLElement {
  #private
  static setCSPTrustedTypesPolicy(policy: CSPTrustedTypesPolicy | Promise<CSPTrustedTypesPolicy> | null): void
  static get observedAttributes(): Array<string>
  get src(): string
  set src(val: string)
  get loading(): 'eager' | 'lazy'
  set loading(value: 'eager' | 'lazy')
  get accept(): string
  set accept(val: string)
  get data(): Promise<string>
  attributeChangedCallback(attribute: string, oldVal: string | null): void
  // eslint-disable-next-line custom-elements/no-constructor
  constructor()
  connectedCallback(): void
  request(): Request
  load(): Promise<string>
  fetch(request: RequestInfo): Promise<Response>
}

declare global {
  interface Window {
    IncludeFragmentElement: IncludeFragmentElement
  }
  interface HTMLElementTagNameMap {
    'include-fragment': IncludeFragmentElement
  }
  namespace JSX {
    interface IntrinsicElements {
      'include-fragment': React.DetailedHTMLProps<
        React.HTMLAttributes<IncludeFragmentElement> & {
          src: string
          loading?: 'eager' | 'lazy'
          accept?: string
        },
        IncludeFragmentElement
      >
    }
  }
}
