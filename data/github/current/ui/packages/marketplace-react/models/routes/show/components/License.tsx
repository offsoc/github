import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import type {ShowModelPayload} from '../../../../types'

import {SafeHTMLBox} from '@github-ui/safe-html'

export function License() {
  const {modelLicense} = useRoutePayload<ShowModelPayload>()

  return <SafeHTMLBox className="p-3" html={modelLicense} />
}
