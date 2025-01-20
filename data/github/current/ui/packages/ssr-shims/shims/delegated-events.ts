/**
 * This is a shim for the `delegated-events` package. This package is dependent on browser globals, and is used
 * in such a way that it's effects are not needed for SSR. This shim is injected via webpack
 **/
export function on() {
  // Do nothing in SSR
}

export function fire() {
  // Do nothing in SSR
}
