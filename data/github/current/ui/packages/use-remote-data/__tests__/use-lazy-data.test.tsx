import {render, renderHook, screen} from '@testing-library/react'
import {useLazyData, type Result} from '../use-remote-data'

import {nextTick, withResolvers} from '../test-utils'

describe('useLazyData', () => {
  it('has contracted api', () => {
    expect(useLazyData).toBeDefined()
    expect(useLazyData).toBeInstanceOf(Function)
  })

  it('smoke test', async () => {
    const resolveable = withResolvers<Result<unknown>>()
    const fetcher = jest.fn(async () => resolveable.promise)

    const {result} = renderHook(() => {
      return useLazyData('/my-api', fetcher)
    })

    expect(result.current).toMatchObject({loading: true})

    resolveable.resolve({ok: true, status: 200, data: {foo: 'bar'}})
    await nextTick()

    expect(result.current).toMatchObject({loading: false, data: {foo: 'bar'}})
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("if the response was 204 don't do anything", async () => {
    const resolveable = withResolvers<Result<unknown>>()
    const fetcher = jest.fn(async () => resolveable.promise)

    const {result} = renderHook(() => {
      return useLazyData('/my-api', fetcher)
    })

    expect(result.current).toMatchObject({loading: true})

    resolveable.resolve({ok: true, status: 204, data: null})
    await nextTick()

    expect(result.current).toMatchObject({loading: false, data: null})
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('should not fetch when an initial value is supplied', async () => {
    const initialData = {hello: 'world'}
    const resolveable = withResolvers<Result<unknown>>()
    const fetcher = jest.fn(() => resolveable.promise)

    const {result} = renderHook(() => {
      return useLazyData('/my-api', fetcher, {initialData})
    })

    resolveable.resolve({ok: true, status: 200, data: {}})
    expect(result.current.data).toBe(initialData)
    expect(fetcher).toHaveBeenCalledTimes(0)
  })

  it('fetches with initial data on key change', async () => {
    const initialData = {hello: 'world'}
    const resolveable = withResolvers<Result<unknown>>()
    const fetcher = jest.fn(() => resolveable.promise)

    const {result, rerender} = renderHook((props: {key: string}) => {
      return useLazyData(props?.key ?? '/my-api', fetcher, {initialData})
    })

    resolveable.resolve({ok: true, status: 200, data: {hello: 'buddy'}})
    await nextTick()

    rerender({key: '/my-api?q=searching'})
    await nextTick()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(result.current.data).not.toBe(initialData)
    expect(result.current).toMatchObject({loading: false, data: {hello: 'buddy'}})
  })

  it('shouldnt perform a fetch on a rerender', async () => {
    const resolveable = withResolvers<Result<unknown>>()
    const fetcher = jest.fn(() => resolveable.promise)

    const {result, rerender} = renderHook(() => {
      return useLazyData('/my-api', fetcher)
    })

    expect(result.current).toMatchObject({loading: true})

    resolveable.resolve({ok: true, status: 200, data: {foo: 'bar'}})
    await nextTick()

    expect(result.current).toMatchObject({loading: false, data: {foo: 'bar'}})
    expect(fetcher).toHaveBeenCalledTimes(1)

    rerender()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(result.current).toMatchObject({loading: false, data: {foo: 'bar'}})
  })

  it('if we rerender, with different values, fetch again', async () => {
    const fetcher = jest.fn(
      async (payload: readonly [string, {v: number}]) =>
        ({
          ok: true,
          status: 200,
          data: payload[1],
        }) as const,
    )

    const {result, rerender} = renderHook(
      (props: {v: number}) => {
        return useLazyData(['/my-api', props], fetcher)
      },
      {
        initialProps: {v: 1},
      },
    )

    expect(result.current).toMatchObject({loading: true})
    await nextTick()
    expect(result.current).toMatchObject({loading: false, data: {v: 1}})

    const props = {v: 2}
    rerender(props)

    expect(result.current).toMatchObject({loading: true, data: {v: 1}})
    await nextTick()
    expect(result.current).toMatchObject({loading: false, data: {v: 2}})

    // lets just test there isnt also a third fetch
    rerender(props)

    await nextTick()
    expect(result.current).toMatchObject({loading: false, data: {v: 2}})

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  test('sample use-case', async () => {
    const fetcher = jest.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          data: {foo: 'bar'},
        }) as const,
    )

    function App() {
      const {loading, data} = useLazyData('/my-api', fetcher)

      return (
        <p>
          loading:{loading ? 'true' : 'false'},data:{JSON.stringify(data)}
        </p>
      )
    }

    render(<App />)

    screen.getByText('loading:true,data:')

    await nextTick()

    expect(screen.getByText('loading:false,data:{"foo":"bar"}')).toBeInTheDocument()
  })
})
