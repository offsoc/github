import {Box, Button, Heading} from '@primer/react'
import {useEffect, useReducer} from 'react'
import {useParams} from 'react-router-dom'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useAlive} from '@github-ui/use-alive'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useClientValue} from '@github-ui/use-client-value'
import {ssrSafeLocation, ssrSafeWindow} from '@github-ui/ssr-utils'
import {throttle} from '@github/mini-throttle'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

const updateCountReducer = ({updateCount}: {updateCount: number}) => {
  return {updateCount: updateCount + 1}
}

function AliveCounter({aliveChannel}: {aliveChannel: string}) {
  const [{updateCount}, incrementUpdateCount] = useReducer(updateCountReducer, {updateCount: 0})
  useAlive(aliveChannel, incrementUpdateCount)

  return <>Fetch detected via alive {updateCount} time(s).</>
}

export function ShowPage() {
  const {sandbox_id: sandboxId} = useParams()
  const payload = useRoutePayload<{aliveChannel: string} | undefined>()

  const [scrollOffset, updateScrollOffset] = useClientValue<number>(() => window.scrollY, 0, [ssrSafeWindow?.scrollY])
  const [userAgent] = useClientValue<string>(() => navigator.userAgent, 'Unknown User Agent on Server')

  useEffect(() => {
    const scrollListener = throttle(() => {
      updateScrollOffset()
    }, 100)
    // we're just outputting scroll position for demo purposes. So we don't want an intersection observer
    // eslint-disable-next-line github/prefer-observers
    window.addEventListener('scroll', scrollListener)
    return () => {
      window.removeEventListener('scroll', scrollListener)
    }
  }, [updateScrollOffset])

  // A sandbox ID for testing render errors in feature code:
  if (sandboxId === '6') {
    throw new Error('Whoops')
  }

  const clientOnlyValues = {scrollOffset, userAgent}
  const {pathname, origin, search} = ssrSafeLocation

  const toast = useToastContext()
  const onTestFetch = async () => {
    await verifiedFetch('/_react_sandbox/fetch_test', {method: 'POST'})
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    toast.addToast({message: 'Test Fetch Sent', type: 'success'})
  }

  return (
    <>
      <Heading as="h1" tabIndex={-1}>
        React sandbox show page (sandbox ID: {sandboxId})
      </Heading>

      <Box
        id="react-payload"
        as="pre"
        sx={{padding: 4, marginBottom: 4, backgroundColor: 'canvas.inset', borderRadius: 2}}
        data-hpc
      >
        {JSON.stringify({payload}, null, 2)}
      </Box>

      <Box
        id="react-client-values"
        as="pre"
        sx={{padding: 4, marginBottom: 4, backgroundColor: 'canvas.inset', borderRadius: 2}}
        data-hpc
      >
        {JSON.stringify({clientOnlyValues}, null, 2)}
      </Box>

      <Box
        id="react-ssr-safe-location"
        as="pre"
        sx={{padding: 4, marginBottom: 4, backgroundColor: 'canvas.inset', borderRadius: 2}}
        data-hpc
      >
        {JSON.stringify({pathname, origin, search}, null, 2)}
      </Box>

      <Button onClick={onTestFetch}>Test Fetch</Button>
      {payload?.aliveChannel && <AliveCounter aliveChannel={payload.aliveChannel} />}
    </>
  )
}
