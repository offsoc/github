import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import type {ShowModelPayload} from '../../../../types'

import {SafeHTMLBox} from '@github-ui/safe-html'

export function Evaluation() {
  const {modelEvaluation} = useRoutePayload<ShowModelPayload>()

  return <>{modelEvaluation && <SafeHTMLBox html={modelEvaluation} className="p-3" />}</>
}
