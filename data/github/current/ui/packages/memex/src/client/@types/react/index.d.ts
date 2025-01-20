// eslint-disable-next-line no-restricted-imports
export * from 'react'

declare module 'react' {
  export interface HTMLAttributes {
    /**
     * Make an element inert. As a hack for React not supporting `inert` (https://github.com/facebook/react/issues/17157),
     * we have to use string values instead of standard booleans.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert
     */
    inert?: 'inert'
  }
}
