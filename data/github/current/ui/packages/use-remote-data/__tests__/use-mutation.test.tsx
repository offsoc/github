/* eslint eslint-comments/no-use: off */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {act, fireEvent, render, renderHook, screen} from '@testing-library/react'
import {useMutation, type Result} from '../use-remote-data'

import {nextTick, withResolvers} from '../test-utils'

describe('useMutation', () => {
  it('has contracted api', () => {
    expect(useMutation).toBeDefined()
    expect(useMutation).toBeInstanceOf(Function)
  })

  it('smoke test', async () => {
    const fetcher = jest.fn(
      async (key: any, payload: {foo: string}) =>
        ({
          ok: true,
          status: 200,
          data: payload,
        }) as const,
    )

    const {result} = renderHook(() => useMutation<{foo: string}>('/my-api', fetcher))

    let [commit, loading] = result.current

    expect(loading).toBe(false)

    const onComplete = jest.fn()
    const onError = jest.fn()

    act(() => {
      commit({
        payload: {foo: 'bar'},
        onComplete,
        onError,
      })
    })

    // eslint-disable-next-line unused-imports/no-unused-vars
    function tsTests() {
      commit({
        // @ts-expect-error ts-tests
        payload: {bar: 'baz'},
        foo: 'bar',
      })

      commit({
        payload: {foo: 'bar'},
        // @ts-expect-error ts-tests
        foo: 'bar',
      })
    }

    // prettier wants to collapse this blank line — no!
    ;[commit, loading] = result.current

    expect(loading).toBe(true)

    await nextTick()

    // prettier wants to collapse this blank line — no!
    ;[commit, loading] = result.current

    expect(loading).toBe(false)
    expect(fetcher).toHaveBeenCalledTimes(1)

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  test('if there was a serious error we get the error instance', async () => {
    const error = new Error('tester')
    const fetcher = jest.fn(async () => {
      throw error
    })

    const {result} = renderHook(() => useMutation<{foo: string}>('/my-api', fetcher))

    let [commit, loading] = result.current

    expect(loading).toBe(false)

    const onComplete = jest.fn()
    const onError = jest.fn()

    act(() => {
      commit({
        payload: {foo: 'bar'},
        onComplete,
        onError,
      })
    })

    // prettier wants to collapse this blank line — no!
    ;[commit, loading] = result.current

    expect(loading).toBe(true)

    await nextTick()

    expect(onComplete).toHaveBeenCalledTimes(0)
    expect(onError).toHaveBeenCalledWith(error)
  })

  test('should not fail if new commit happens', async () => {
    const fetcher = jest.fn(async (key: any, payload: any, signal: AbortSignal) => {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
      return {ok: true, status: 200, data: payload} as const
    })

    const {result} = renderHook(() => useMutation<{foo: string}>('/my-api', fetcher))

    let [commit, loading] = result.current

    expect(loading).toBe(false)

    const onComplete = jest.fn()
    const onError = jest.fn()

    act(() => {
      commit({
        payload: {foo: 'bar'},
        onComplete,
        onError,
      })
    })

    // prettier wants to collapse this blank line — no!
    ;[commit, loading] = result.current

    expect(loading).toBe(true)

    act(() => {
      commit({
        payload: {foo: 'baz'},
        onComplete,
        onError,
      })
    })

    await nextTick()

    // prettier wants to collapse this blank line — no!
    ;[commit, loading] = result.current

    expect(loading).toBe(false)
    expect(fetcher).toHaveBeenCalledTimes(2)

    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenCalledWith({foo: 'baz'}, 200)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  test('re-use promise for same payload', async () => {
    const resolvers = withResolvers<Result<unknown>>()

    const fetcher = jest.fn(async () => resolvers.promise)

    const {result} = renderHook(() => useMutation<{foo: string}>('/my-api', fetcher))

    let [commit, loading] = result.current

    expect(loading).toBe(false)

    const onComplete = jest.fn()
    const onError = jest.fn()

    act(() => {
      commit({
        payload: {foo: 'bar'},
        onComplete,
        onError,
      })
    })

    // prettier wants to collapse this blank line — no!
    ;[commit, loading] = result.current

    expect(loading).toBe(true)
    expect(fetcher).toHaveBeenCalledTimes(1)

    act(() => {
      commit({
        payload: {foo: 'bar'},
        onComplete,
        onError,
      })
    })

    resolvers.resolve({ok: true, status: 200, data: {foo: 'bar'}})
    await nextTick()

    // prettier wants to collapse this blank line — no!
    ;[commit, loading] = result.current

    expect(loading).toBe(false)
    expect(fetcher).toHaveBeenCalledTimes(1)

    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(onError).toHaveBeenCalledTimes(0)
  })

  test('re-use promise cross hook', async () => {
    const resolvers = withResolvers<Result<unknown>>()

    const fetcher = jest.fn(async () => resolvers.promise)

    const {result: firstHook} = renderHook(() => useMutation<{foo: string}>('/my-api', fetcher))
    const {result: secondHook} = renderHook(() => useMutation<{foo: string}>('/my-api', fetcher))

    let [commitA, loadingA] = firstHook.current
    let [commitB, loadingB] = secondHook.current

    expect(loadingA).toBe(false)
    expect(loadingB).toBe(false)

    act(() => {
      commitA({
        payload: {foo: 'bar'},
      })
      commitB({
        payload: {foo: 'bar'},
      })
    })

    // prettier wants to collapse this blank line — no!
    ;[commitA, loadingA] = firstHook.current
    ;[commitB, loadingB] = secondHook.current

    expect(loadingA).toBe(true)
    expect(loadingB).toBe(true)
    expect(fetcher).toHaveBeenCalledTimes(1)

    resolvers.resolve({ok: true, status: 200, data: {foo: 'bar'}})
    await nextTick()

    // prettier wants to collapse this blank line — no!
    ;[commitA, loadingA] = firstHook.current
    ;[commitB, loadingB] = secondHook.current

    expect(loadingA).toBe(false)
    expect(loadingB).toBe(false)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  test('sample use-case', async () => {
    const fetcher = jest.fn(async (key: any, payload: any) => ({ok: true, status: 200, data: payload}) as const)

    function App() {
      const [commit, loading] = useMutation('/my-api', fetcher)

      return (
        <button onClick={() => commit({})} disabled={loading}>
          Test Button {loading ? 'loading' : ''}
        </button>
      )
    }

    render(<App />)

    const button = screen.queryByRole('button')

    expect(button).toHaveTextContent('Test Button')
    expect(button).not.toBeDisabled()

    fireEvent.click(button!)

    expect(button).toHaveTextContent('Test Button loading')
    expect(button).toBeDisabled()

    await nextTick()

    expect(button).toHaveTextContent('Test Button')
    expect(button).not.toBeDisabled()
  })
})
