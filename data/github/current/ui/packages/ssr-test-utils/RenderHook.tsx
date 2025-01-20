import React from 'react'
import {renderToString} from 'react-dom/server'
import {render, type renderHook} from '@testing-library/react'

type RenderCallback = Parameters<typeof renderHook>[0]
type RenderOptions = Parameters<typeof renderHook>[1] & {
  container?: HTMLElement | null
  baseElement?: HTMLElement | null
}
type ResultRef = React.ComponentProps<typeof TestComponent>['result']
type Calls = unknown[]

function TestComponent({
  renderCallback,
  renderCallbackProps,
  result,
  calls,
}: {
  renderCallback: RenderCallback
  renderCallbackProps?: unknown
  result: React.MutableRefObject<ReturnType<typeof renderCallback> | null>
  calls: Calls
}) {
  result.current = renderCallback(renderCallbackProps)
  calls.push(result.current)
  return null
}

/**
 * A wrapper around renderHook that returns an array of all the calls to the hook
 */
export function renderHookWithCalls(renderCallback: RenderCallback, options: RenderOptions = {}) {
  const result = React.createRef() as ResultRef
  const calls: Calls = []

  const utils = render(<TestComponent renderCallback={renderCallback} result={result} calls={calls} />, options)

  function rerender(props?: unknown) {
    utils.rerender(
      <TestComponent renderCallback={renderCallback} renderCallbackProps={props} result={result} calls={calls} />,
    )
  }

  return {...utils, rerender, result, calls}
}

/**
 * This render util allows testing the full SSR hydration lifecycle of a hook:
 * 1. When first called, it renders to the `options.container` using `renderToString`.
 * 2. Call `hydrate` to render the hook again using `render` and `hydrate` to simulate the hydration
 * 3. Call `rerender` to re-render the hook CSR.
 */
export function renderHookSSR(renderCallback: RenderCallback, options: RenderOptions = {}) {
  const {initialProps, wrapper, ...renderOptions} = options
  let {container, baseElement = container} = options
  const Wrapper = wrapper ?? React.Fragment
  const result = React.createRef<ResultRef>()
  const calls: Calls = []

  if (!baseElement) {
    baseElement = document.body
  }
  if (!container) {
    container = baseElement.appendChild(document.createElement('div'))
  }

  const serverOutput = renderToString(
    <Wrapper>
      <TestComponent renderCallback={renderCallback} renderCallbackProps={initialProps} result={result} calls={calls} />
    </Wrapper>,
  )
  container.innerHTML = serverOutput

  function hydrate(rerenderCallbackProps?: unknown) {
    return render(
      <TestComponent
        renderCallback={renderCallback}
        renderCallbackProps={rerenderCallbackProps}
        result={result}
        calls={calls}
      />,
      {
        ...renderOptions,
        container,
        hydrate: true,
        wrapper,
      },
    )
  }

  function rerender(rerenderCallbackProps?: unknown) {
    return render(
      <TestComponent
        renderCallback={renderCallback}
        renderCallbackProps={rerenderCallbackProps}
        result={result}
        calls={calls}
      />,
      {
        ...renderOptions,
        container,
        hydrate: false,
        wrapper,
      },
    )
  }

  return {result, calls, hydrate, rerender}
}
