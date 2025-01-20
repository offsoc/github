/* eslint @typescript-eslint/no-empty-function: off */
/**
 * This is a shim for `@github/catalyst` package. This package is use for custom elements, and is not needed for SSR.
 * We expect the custom elements to only provide client-side behaviors, and not to perform rendering tasks which
 * need to be handled for the initial page load.
 **/

export function attr() {}
export function controller() {}
export function findTarget() {}
export function lazyDefine() {}
export function target() {}
export function targets() {}
