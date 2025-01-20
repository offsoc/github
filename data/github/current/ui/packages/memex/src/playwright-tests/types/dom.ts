import type {ElementHandle} from '@playwright/test'

// type alias from Playwright internals, for convenience in tests
export type HTMLOrSVGElementHandle = ElementHandle<HTMLElement | SVGElement>
