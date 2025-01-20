import {useEffect} from 'react'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {useAppPayload} from './use-app-payload'
import {useRoutePayload} from './use-route-payload'

export function usePublishPayload() {
  const payload = useRoutePayload()
  const appPayload = useAppPayload()

  useEffect(() => {
    function onInitialSoftNav() {
      // For a hard navigation, we publish the payload on INITIAL event
      // because the first payload changed is too early and some components (Catalyst) may not be ready yet.
      // This may trigger the same event twice.
      document.dispatchEvent(new CustomEvent('soft-nav:payload', {detail: {payload, appPayload}}))
    }
    document.addEventListener(SOFT_NAV_STATE.INITIAL, onInitialSoftNav)

    return () => {
      document.removeEventListener(SOFT_NAV_STATE.INITIAL, onInitialSoftNav)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('soft-nav:payload', {detail: {payload, appPayload}}))
  }, [appPayload, payload])
}
