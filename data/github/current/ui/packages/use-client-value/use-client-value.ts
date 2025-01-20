import {useCallback, useState, useRef, type DependencyList} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useHydratedEffect} from '@github-ui/use-hydrated-effect'
// eslint-disable-next-line no-restricted-imports
import {RenderPhase, useRenderPhase} from '@github-ui/use-render-phase'

type ClientValueCallback<T> = (previousValue?: T) => T

/**
 * This hook allows reading browser-only values in an SSR / hydration safe manner while guaranteeing the minimum
 * number of re-renders during CSR.
 * - In CSR, this hook will resolve the `clientValueCallback` on first render.
 * - In SSR, the `serverValue` will be returned.
 * - Finally, after hydration, the `clientValueCallback` will be resolved.
 *
 * Note that between SSR and hydration, this can cause flashes of unhydrated content when server and client values
 * differ, however this hook will not result in hydration mismatch warnings and bugs.
 *
 * @see https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/ssr/ssr-tools/#useclientvalue-source
 *
 * @example
 * const [origin, updateOrigin] = useClientValue(() => window.location.origin, 'github.com', [window?.location?.origin])
 *
 * @param clientValueCallback A function that returns the value to be used on the client.
 * @param serverValue A value to be used during SSR on the server.
 * @param deps A dependency array used to memoize the `clientValueCallback`.
 *         Note that if including a browser global in the array, be sure to check for it's existence
 *         (eg `window?.api?.value`) as it may not be available in SSR.
 * @returns  [
 *             `clientValue` (Either a browser-only value, or a server fallback),\n
 *             `updateValue` (A function that can be used to update the `clientValue` by re-running the `clientValueCallback`)
 *           ]
 *
 * *Credit https://www.benmvp.com/blog/handling-react-server-mismatch-error/ for inspiration*
 */
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue: T,
  deps?: DependencyList,
): [T, () => void]
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue?: T,
  deps?: DependencyList,
): [T | undefined, () => void]
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue?: T,
  deps: DependencyList = [],
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(clientValueCallback, deps)
  const renderPhase = useRenderPhase()
  const isCSRFirstRender = useRef(renderPhase === RenderPhase.ClientRender)

  const [clientValue, setClientValue] = useState<T | undefined>(() => {
    if (renderPhase === RenderPhase.ClientRender) return memoizedCallback()
    return serverValue
  })

  const updateClientValue = useCallback(() => {
    setClientValue(memoizedCallback)
  }, [memoizedCallback])

  useHydratedEffect(() => {
    // in CSR on first render we've already set the value in the `useState` above
    if (!isCSRFirstRender.current) {
      setClientValue(memoizedCallback)
    }
    isCSRFirstRender.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedCallback, ...deps])

  return [clientValue, updateClientValue]
}
