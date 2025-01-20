import {act, renderHook} from '@testing-library/react'
import type {MutableRefObject} from 'react'

import {type RenderMessage, RenderState, useFileRenderer} from '../use-file-renderer'

describe('useFileRenderer', () => {
  afterEach(cleanupFileRenderer)

  it('triggers "ack" and "branding" commands in response to a "hello" message', () => {
    const {result, mockPostMessage} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({type: 'render', body: 'hello', payload: null})

    expect(mockPostMessage).toHaveBeenCalledTimes(2)
    expect(mockPostMessage.mock.calls[0][0]).toContain('"cmd":"ack"')
    expect(mockPostMessage.mock.calls[1][0]).toContain('"cmd":"branding"')
  })

  it('processes data given as a string', () => {
    const {result, mockPostMessage} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame(JSON.stringify({type: 'render', body: 'hello', payload: null}))

    expect(mockPostMessage).toHaveBeenCalledTimes(2)
    expect(mockPostMessage.mock.calls[0][0]).toContain('"cmd":"ack"')
    expect(mockPostMessage.mock.calls[1][0]).toContain('"cmd":"branding"')
  })

  it('updates the state in response to an "error" message', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({type: 'render', body: 'error', payload: {error: 'test error message'}})

    expect(result.current.renderState).toBe(RenderState.ERROR)
    expect(result.current.errorMsg).toBe('test error message')
  })

  it('updates the state in response to an "error" with no message', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({type: 'render', body: 'error', payload: {error: null}})

    expect(result.current.renderState).toBe(RenderState.ERROR)
    expect(result.current.errorMsg).toBe(null)
  })

  it('updates the state in response to an "error" with no payload', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({type: 'render', body: 'error', payload: null})

    expect(result.current.renderState).toBe(RenderState.ERROR)
    expect(result.current.errorMsg).toBe(null)
  })

  it('updates the state to be an error if the data is null', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame(null)

    expect(result.current.renderState).toBe(RenderState.ERROR)
  })

  it('updates the state to be an error if the data is not a valid JSON string', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame('not a valid JSON string')

    expect(result.current.renderState).toBe(RenderState.ERROR)
  })

  it('updates the state to be an error if the data is not a valid message object', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame(JSON.stringify({invalidProperty: 'invalid'}))

    expect(result.current.renderState).toBe(RenderState.ERROR)
  })

  it('updates the state to be an error if the data is not an object', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame(true as unknown as RenderMessage)

    expect(result.current.renderState).toBe(RenderState.ERROR)
  })

  it('updates the state in response to a "loading" or "loaded" message', () => {
    const {result} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({type: 'render', body: 'loaded', payload: null})

    expect(result.current.renderState).toBe(RenderState.LOADED)

    simulateMessageFromIFrame({type: 'render', body: 'loading', payload: null})

    expect(result.current.renderState).toBe(RenderState.LOADING)
  })

  it('updates the state and the container height in response to a "ready" message', () => {
    const {result, containerElement} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({type: 'render', body: 'ready', payload: {height: 100}})

    expect(result.current.renderState).toBe(RenderState.READY)
    expect(containerElement.style.height).toBe('100px')
  })

  it('updates the container height in response to a "resize" message', () => {
    const {result, containerElement} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({type: 'render', body: 'resize', payload: {height: 100}})

    expect(containerElement.style.height).toBe('100px')
  })

  it('sends the container width in response to a "code_rendering_service:container:get_size" message', () => {
    const {result, containerElement, mockPostMessage} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    containerElement.getBoundingClientRect = jest.fn().mockReturnValueOnce({width: 42} as DOMRect)

    simulateMessageFromIFrame({
      type: 'render',
      body: 'code_rendering_service:container:get_size',
      payload: null,
    })

    expect(mockPostMessage).toHaveBeenCalledTimes(1)
    expect(mockPostMessage.mock.calls[0][0]).toContain('"code_rendering_service:container:size":{"width":42}')
  })

  it('sends the data-content of the iframe to the iframe in response to a "code_rendering_service:markdown:get_data" message', () => {
    const {result, iframeElement, containerElement, mockPostMessage} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    const testData = JSON.stringify({
      data: {
        testKey: 'testValue',
      },
    })
    iframeElement.setAttribute('data-content', testData)
    containerElement.getBoundingClientRect = jest.fn().mockReturnValueOnce({width: 42} as DOMRect)

    simulateMessageFromIFrame({
      type: 'render',
      body: 'code_rendering_service:markdown:get_data',
      payload: null,
    })

    expect(mockPostMessage).toHaveBeenCalledTimes(1)
    expect(mockPostMessage.mock.calls[0][0]).toContain('code_rendering_service:data:ready')
    expect(mockPostMessage.mock.calls[0][0]).toContain('"width":42')
    expect(mockPostMessage.mock.calls[0][0]).toContain('"testKey":"testValue"')
  })

  it('ignores data sent from a different origin', () => {
    const {result, mockPostMessage} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://badactor.com',
          data: {type: 'render', body: 'loaded', payload: null},
        }),
      )
    })

    expect(result.current.renderState).toBe(RenderState.LOADING)
    expect(mockPostMessage).not.toHaveBeenCalled()
  })

  it('ignores data with an invalid body type', () => {
    const {result, mockPostMessage} = setupUseFileRenderer()
    expect(result.current.renderState).toBe(RenderState.LOADING)

    simulateMessageFromIFrame({
      type: 'render',
      body: 'unknown',
      payload: null,
    })

    expect(result.current.renderState).toBe(RenderState.LOADING)
    expect(mockPostMessage).not.toHaveBeenCalled()
  })
})

function setupUseFileRenderer() {
  const view = renderHook(() => useFileRenderer('https://github.com'))
  const iframeElement = document.createElement('iframe')
  const containerElement = document.createElement('div')
  containerElement.classList.add('test-renderer-container')

  document.body.appendChild(containerElement)
  containerElement.appendChild(iframeElement)

  const mockPostMessage = jest.fn()
  ;(iframeElement as unknown as {contentWindow: {postMessage: typeof mockPostMessage}}).contentWindow.postMessage =
    mockPostMessage
  ;(view.result.current.iFrameRef as MutableRefObject<HTMLIFrameElement>).current = iframeElement
  ;(view.result.current.containerRef as MutableRefObject<HTMLDivElement>).current = containerElement

  return {...view, mockPostMessage, containerElement, iframeElement}
}

function cleanupFileRenderer() {
  document.body.textContent = ''
}

function simulateMessageFromIFrame(data: RenderMessage | string | null) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', {origin: 'https://github.com', data}))
  })
}
