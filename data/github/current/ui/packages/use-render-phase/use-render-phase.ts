import {RenderPhaseContext, RenderPhase} from '@github-ui/render-phase-provider'
import {useContext} from 'react'

/**
 * @package
 *
 * Prefer `useClientValue` over this hook. You can think of it as "environment sniffing" vs "feature detection"
 * (with [similar considerations to browser sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#avoiding_user_agent_detection)):
 * `useClientValue` is a feature detection mechanism, whereas `useRenderPhase` is an environment sniffing mechanism.
 *
 * This hook allows you to determine what phase of rendering you are in:
 * - During SSR, there are three distinct phases of rendering: `ServerRender`, `ClientHydrate` and `ClientRender`.
 * - During CSR, there is only one phase: `ClientRender`.
 */
export function useRenderPhase() {
  const renderPhase = useContext(RenderPhaseContext)
  return renderPhase
}

export {RenderPhase}
