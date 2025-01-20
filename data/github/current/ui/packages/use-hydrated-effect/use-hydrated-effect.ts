// eslint-disable-next-line no-restricted-imports
import {useLayoutEffect} from 'react'
import {IS_BROWSER} from '@github-ui/ssr-utils'

/**
 * @package
 *
 * Prefer `useClientValue` from `@github-ui/use-client-value` or `useLayoutEffect` from React. This hook exists
 * to support an optimization to avoid unnecessary re-paints after hydration and should not be used to measure DOM
 * elements or other browser-only values.
 *
 * An SSR-Friendly wrapper around `useLayoutEffect` that will not run on the server and so will not
 * trigger the React warning about calling `useLayoutEffect` on the server.
 */
export function useHydratedEffect(effect: React.EffectCallback, deps?: React.DependencyList | undefined) {
  if (IS_BROWSER) {
    // A bit of a hack!
    // We want to avoid the React warning about calling `useLayoutEffect` on the server. But we also want to
    // keep the linter from yelling because it thinks this is a conditional hook call. `useLayoutEffect` only runs on
    // the client anyways, otherwise none of this would be a good idea.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(effect, deps)
  }
}
