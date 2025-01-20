import type {DOMAttributes} from 'react'

type CustomElement<T> = Partial<T & DOMAttributes<T> & {children: any}>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'slash-command-expander': CustomElement<{
        keys: string
      }>
      'tasklist-block-add-tasklist': CustomElement<{
        keys: string
      }>
    }
  }
}
