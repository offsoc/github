import {ApiCache} from '../api-cache'

describe('ApiCache', () => {
  it('dispatches only one request for the same params', async () => {
    const fetchFn = jest.fn()
    fetchFn.mockResolvedValue({ok: true, payload: 'result'})
    const cache = new ApiCache(fetchFn)

    await Promise.all([cache.get('param1', 'param2'), cache.get('param1', 'param2')])

    expect(fetchFn).toHaveBeenCalledTimes(1)
  })
  it('dispatches multiple requests for different params', async () => {
    const fetchFn = jest.fn()
    fetchFn.mockResolvedValue({ok: true, payload: 'result'})
    const cache = new ApiCache(fetchFn)

    await Promise.all([cache.get('param1', 'param2'), cache.get('param3', 'param4')])

    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
  it('caches the result', async () => {
    const fetchFn = jest.fn()
    fetchFn.mockResolvedValue({ok: true, payload: 'result'})
    const cache = new ApiCache(fetchFn)

    await cache.get('param1', 'param2')
    await cache.get('param1', 'param2')

    expect(fetchFn).toHaveBeenCalledTimes(1)
  })
  it('returns different results for different params', async () => {
    const fetchFn = jest.fn((a: string, b: string) =>
      Promise.resolve({ok: true, payload: `${a}-${b}`, status: 200} as const),
    )

    const cache = new ApiCache(fetchFn)

    expect(await cache.get('param1', 'param2')).toEqual({ok: true, payload: 'param1-param2', status: 200})
    expect(await cache.get('param3', 'param4')).toEqual({ok: true, payload: 'param3-param4', status: 200})
  })
})
