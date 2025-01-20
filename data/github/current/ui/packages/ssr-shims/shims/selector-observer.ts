/**
 * This is a shim for the `@github/selector-observer` package. This package is dependent on browser globals, and is used
 * in such a way that it's effects are not needed for SSR. This shim is injected via webpack
 **/
export function observe() {
  // Do nothing in SSR
}
