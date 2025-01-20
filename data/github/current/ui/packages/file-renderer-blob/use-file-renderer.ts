import {useCallback, useEffect, useRef, useState} from 'react'

const HELLO_TIMEOUT = 10_000
const LOAD_TIMEOUT = 45_000

export const DEFAULT_RENDERER_HEIGHT = '500px'

interface RenderTiming {
  load?: number | null
  helloTimer?: number | null
  hello?: number | null
  loadTimer?: number | null
  untimed?: boolean
}

interface RenderCommand {
  type: 'render:cmd'
  body?: unknown
}

export interface RenderMessage {
  type: 'render'
  body: string
  payload:
    | null
    | undefined
    | {
        height?: number
        error?: string | null
      }
}

export enum RenderState {
  ERROR = 'ERROR',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  READY = 'READY',
}

interface FileRendererHandle {
  renderState: RenderState
  errorMsg: string | null
  iFrameRef: React.RefObject<HTMLIFrameElement>
  containerRef: React.RefObject<HTMLDivElement>
}

export function useFileRenderer(origin: string): FileRendererHandle {
  const [renderStateRef, setRenderState] = useStatefulRef(RenderState.LOADING)
  const errorMsg = useRef<string | null>(null)

  const iFrameRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const renderTiming = useRef<RenderTiming>({untimed: true})

  const messageListener = useCallback(
    (event: MessageEvent) =>
      onMessage(
        event,
        origin,
        iFrameRef,
        containerRef,
        renderTiming,
        setRenderState,
        error => (errorMsg.current = error),
      ),
    [origin, setRenderState],
  )

  useEffect(() => {
    // Clear the timeouts
    resetTiming(renderTiming.current)

    const timeoutWatchdog = (checkHello: boolean) => {
      if (
        (renderStateRef.current !== RenderState.LOADING && renderStateRef.current !== RenderState.LOADED) ||
        (checkHello && !renderTiming.current.hello)
      ) {
        return
      }

      setRenderState(RenderState.ERROR)
    }

    renderTiming.current = {
      load: Date.now(),
      hello: null,
      helloTimer: window.setTimeout(timeoutWatchdog, HELLO_TIMEOUT, true),
      loadTimer: window.setTimeout(timeoutWatchdog, LOAD_TIMEOUT),
    }

    return () => {
      resetTiming(renderTiming.current)
    }
  }, [renderStateRef, setRenderState])

  useEffect(() => {
    window.addEventListener('message', messageListener)
    return () => window.removeEventListener('message', messageListener)
  }, [messageListener])

  return {renderState: renderStateRef.current, errorMsg: errorMsg.current, iFrameRef, containerRef}
}

function onMessage(
  event: MessageEvent,
  origin: string,
  iFrameRef: React.RefObject<HTMLIFrameElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  renderTiming: React.RefObject<RenderTiming>,
  setRenderState: (state: RenderState) => void,
  setError: (error: string | null) => void,
) {
  if (event.origin !== origin) return

  const renderMessage = getRenderMessage(event)
  if (!renderMessage) {
    setRenderState(RenderState.ERROR)
    return
  }

  const body = renderMessage.body
  const payload = renderMessage.payload != null ? renderMessage.payload : undefined

  const renderWindow = iFrameRef.current?.contentWindow

  switch (body) {
    case 'hello':
      {
        const timingData = renderTiming.current ?? {
          untimed: true,
        }

        timingData.hello = Date.now()

        const ackmsg = {
          type: 'render:cmd',
          body: {
            cmd: 'ack',
            ack: true,
          },
        } as const

        const msg = {
          type: 'render:cmd',
          body: {
            cmd: 'branding',
            branding: false,
          },
        } as const

        sendRenderCommand(renderWindow, ackmsg)
        sendRenderCommand(renderWindow, msg)
      }
      break
    case 'error':
    case 'error:fatal':
    case 'error:invalid':
      if (payload) {
        setError(payload.error ?? null)
        setRenderState(RenderState.ERROR)
      } else {
        setRenderState(RenderState.ERROR)
      }
      break
    case 'loading':
      setRenderState(RenderState.LOADING)
      break
    case 'loaded':
      setRenderState(RenderState.LOADED)
      break
    case 'ready':
      // TODO: markdown success
      //markdownEnrichmentSuccess(container)

      if (payload && typeof payload.height === 'number' && containerRef.current) {
        containerRef.current.style.height = `${payload.height}px`
      }

      setRenderState(RenderState.READY)

      break
    case 'resize':
      if (payload && typeof payload.height === 'number' && containerRef.current) {
        containerRef.current.style.height = `${payload.height}px`
      }

      break
    case 'code_rendering_service:container:get_size':
      sendRenderCommand(renderWindow, {
        type: 'render:cmd',
        body: {
          cmd: 'code_rendering_service:container:size',
          'code_rendering_service:container:size': {
            width: containerRef.current?.getBoundingClientRect().width,
          },
        },
      })
      break
    case 'code_rendering_service:markdown:get_data':
      if (!iFrameRef.current || !containerRef.current) return
      sendIFrameDataToIFrame(iFrameRef.current, containerRef.current)
      break
    default:
      break
  }
}

function useStatefulRef<T>(initialState: T) {
  // Workaround because window listeners only have access to the initial state. So use refs
  const [renderStateInt, setRenderStateInt] = useState<T>(initialState)
  const renderStateRef = useRef<T>(renderStateInt)

  const setRenderState = (state: T) => {
    renderStateRef.current = state
    setRenderStateInt(state)
  }

  return [renderStateRef, setRenderState] as const
}

function resetTiming(renderTiming: RenderTiming) {
  if (!renderTiming) {
    return
  }
  renderTiming.load = renderTiming.hello = null
  if (renderTiming.helloTimer) {
    clearTimeout(renderTiming.helloTimer)
    renderTiming.helloTimer = null
  }
  if (renderTiming.loadTimer) {
    clearTimeout(renderTiming.loadTimer)
    renderTiming.loadTimer = null
  }
}

function sendIFrameDataToIFrame(iframe: HTMLIFrameElement, container: HTMLDivElement) {
  const data = iframe.getAttribute('data-content')
  if (!data) {
    return
  }

  const msg = {
    type: 'render:cmd',
    body: {
      cmd: 'code_rendering_service:data:ready',
      'code_rendering_service:data:ready': {
        data: JSON.parse(data).data,
        width: container.getBoundingClientRect().width,
      },
    },
  } as const

  sendRenderCommand(iframe.contentWindow, msg)
}

function sendRenderCommand(renderWindow: Window | null | undefined, message: RenderCommand) {
  if (renderWindow && renderWindow.postMessage) {
    renderWindow.postMessage(JSON.stringify(message), '*')
  }
}

function getRenderMessage(event: MessageEvent): RenderMessage | null {
  let data = event.data as unknown

  if (!data) return null

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data) as unknown
    } catch {
      // Ignore parse errors
      return null
    }
  }

  if (!isRenderMessage(data)) return null

  return data
}

function isRenderMessage(data: unknown): data is RenderMessage {
  if (typeof data !== 'object' || !data) {
    return false
  }

  const messageData = data as RenderMessage
  return (
    messageData.type === 'render' && typeof messageData.body === 'string' && typeof messageData.payload === 'object'
  )
}
