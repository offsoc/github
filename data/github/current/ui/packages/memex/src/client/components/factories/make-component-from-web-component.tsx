import {createComponent, type EventName} from '@lit-labs/react'
// eslint-disable-next-line no-restricted-imports, import/no-namespace
import * as React from 'react'

import {registerCustomElement} from '../../platform/register-custom-element'

interface CustomElementConstructor<T> {
  new (): T
}

type MakeComponentFromWebComponentOptions<
  ElementClass extends HTMLElement,
  EventMaps extends Record<string, EventName | string> = Record<never, never>,
> = {
  tagName: string
  elementClass: CustomElementConstructor<ElementClass>
  events?: EventMaps
}

/**
 * Given a CustomElement tag name and Constructor
 * register that custom element and return a
 * React component that wraps it, with proper
 * type information.
 */
export function makeComponentFromWebComponent<
  ElementClass extends HTMLElement,
  EventMaps extends Record<string, EventName | string> = Record<never, never>,
>({tagName, elementClass, events}: MakeComponentFromWebComponentOptions<ElementClass, EventMaps>) {
  registerCustomElement(tagName, elementClass)
  return createComponent({
    tagName,
    elementClass,
    react: React,
    events,
    displayName: tagName,
  })
}
