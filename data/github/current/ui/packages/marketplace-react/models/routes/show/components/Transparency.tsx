import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import type {ShowModelPayload} from '../../../../types'

import {SafeHTMLBox} from '@github-ui/safe-html'

export function Transparency() {
  const {modelTransparencyContent} = useRoutePayload<ShowModelPayload>()

  return <SafeHTMLBox className="p-3" html={modelTransparencyContent} />
}
