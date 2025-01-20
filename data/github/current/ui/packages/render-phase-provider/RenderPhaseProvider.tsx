import {useState, createContext, type ReactNode} from 'react'
import {IS_SERVER} from '@github-ui/ssr-utils'
// eslint-disable-next-line no-restricted-imports
import {useHydratedEffect} from '@github-ui/use-hydrated-effect'

export const enum RenderPhase {
  ServerRender = 'ServerRender',
  ClientHydrate = 'ClientHydrate',
  ClientRender = 'ClientRender',
}

export const RenderPhaseContext = createContext<RenderPhase>(RenderPhase.ClientRender)

export function RenderPhaseProvider({wasServerRendered, children}: {wasServerRendered: boolean; children: ReactNode}) {
  const [renderPhase, setRenderPhase] = useState<RenderPhase>(() => {
    if (IS_SERVER) {
      return RenderPhase.ServerRender
    }
    if (wasServerRendered) {
      return RenderPhase.ClientHydrate
    }
    return RenderPhase.ClientRender
  })

  useHydratedEffect(() => {
    if (renderPhase === RenderPhase.ClientRender) return
    setRenderPhase(RenderPhase.ClientRender)
  }, [renderPhase])

  return <RenderPhaseContext.Provider value={renderPhase}>{children}</RenderPhaseContext.Provider>
}
