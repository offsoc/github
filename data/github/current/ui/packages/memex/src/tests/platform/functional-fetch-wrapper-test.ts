import {EXPECTED_NETWORK_ERROR_MESSAGES} from '@github-ui/failbot'

import {ApiError} from '../../client/platform/api-error'
import {
  ErrorUsedToCatchStackTraceBeforeAsyncAction,
  fetchJSON,
  fetchJSONWith,
} from '../../client/platform/functional-fetch-wrapper'

const fetchMock = jest.spyOn(window, 'fetch')

describe('fetchJSON', () => {
  const original = window.location

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...original, reload: jest.fn()},
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', {configurable: true, value: original})
  })

  it('calls fetch for a get request', async () => {
    const data = {
      a: {
        b: {
          c: 'd',
        },
      },
    }

    const response = new Response(JSON.stringify(data))
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const json = await fetchJSON<typeof data>('/foo')

    expect(json).toEqual({headers: response.headers, ok: true, data})
  })

  it('calls fetch', async () => {
    const data = {
      a: {
        b: {
          c: 'd',
        },
      },
    }

    const response = new Response(JSON.stringify(data))
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const json = await fetchJSON<typeof data>('/foo', {method: 'POST'})

    expect(json).toEqual({headers: response.headers, ok: true, data})
  })

  it('calls fetch with a payload', async () => {
    const data = {
      a: {
        b: {
          c: 'd',
        },
      },
    }

    const response = new Response(JSON.stringify(data))
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const json = await fetchJSON<typeof data, typeof data>('/foo', {method: 'POST', body: data})

    expect(json).toEqual({headers: response.headers, ok: true, data})
  })

  it.each`
    code
    ${400}
    ${403}
    ${404}
  `('throws on errors $code', async ({code}: {code: number}) => {
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response('{}', {status: code}))
    })

    const handler = () => fetchJSON('/foo', {method: 'POST'})
    try {
      await handler()
      throw new Error('expected fetchJSON to throw and trip the catch statement')
    } catch (e: any) {
      if (!(e instanceof ApiError)) throw new Error(`Expected ApiError: ${e.message}`)
      expect(e.message).toEqual('Sorry, something went wrong')
      if (!e.stack) throw new Error('Expected stack')

      expect(e.stack).toContain('handler')
      expect(e.stack).toContain(`ApiError ({"status":${code}})`)
      expect(e.stack).not.toContain(ErrorUsedToCatchStackTraceBeforeAsyncAction.name)
    }
  })

  it('refreshes the page on 401s', async () => {
    const mockFn = jest.spyOn(window.location, 'reload')
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response('{}', {status: 401}))
    })
    await fetchJSON<any>('/foo', {method: 'POST'})
    expect(mockFn).toHaveBeenCalled()
  })

  it('a 401 will pass through ok: false', async () => {
    const response = new Response('', {status: 401})
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const resp = await fetchJSON('/foo', {method: 'POST'})

    expect(resp).toEqual({headers: response.headers, ok: false, data: {}})
  })

  // this test ensures that when a 'Failed to fetch' error is thrown, it is caught and an ApiError is thrown instead
  // with a message of 'Failed to fetch' which we're checking for here to as we suppress this error in failbot
  // See /ui/packages/failbot/failbot.ts#L33
  it.each(Array.from(EXPECTED_NETWORK_ERROR_MESSAGES))(
    'should throw an ApiError when a network error is throw with the message "%s"',
    async expectedMessage => {
      fetchMock.mockImplementation(() => {
        return new Promise(() => {
          throw new TypeError(expectedMessage)
        })
      })
      const handler = fetchJSONWith('/foo', {method: 'POST'})

      await expect(handler).rejects.toThrow(expectedMessage)
      await expect(handler).rejects.toThrow(ApiError)
    },
  )
})

describe('fetchJSONWith', () => {
  const original = window.location

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...original, reload: jest.fn()},
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', {configurable: true, value: original})
  })

  it('calls fetch for a GET request', async () => {
    const data = {
      a: {
        b: {
          c: 'd',
        },
      },
    }

    const response = new Response(JSON.stringify(data))
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const json = await fetchJSONWith<typeof data>('/foo', {method: 'GET'})

    expect(json).toEqual({headers: response.headers, ok: true, data})
  })

  it('calls fetch for a POST request', async () => {
    const data = {
      a: {
        b: {
          c: 'd',
        },
      },
    }

    const response = new Response(JSON.stringify(data))
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const json = await fetchJSONWith<typeof data>('/foo', {method: 'POST'})

    expect(json).toEqual({headers: response.headers, ok: true, data})
  })

  it('calls fetch with a payload', async () => {
    const data = {
      a: {
        b: {
          c: 'd',
        },
      },
    }

    const response = new Response(JSON.stringify(data))
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const json = await fetchJSONWith<typeof data>('/foo', {method: 'POST', body: data})

    expect(json).toEqual({headers: response.headers, ok: true, data})
  })

  it.each`
    code
    ${400}
    ${403}
    ${404}
  `('throws on errors $code', async ({code}: {code: number}) => {
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response('{}', {status: code}))
    })

    const handler = () => fetchJSONWith('/foo', {method: 'POST'})
    try {
      await handler()
      throw new Error('expected fetchJSONWith to throw and trip the catch statement')
    } catch (e: any) {
      if (!(e instanceof ApiError)) throw new Error(`Expected ApiError: ${e.message}`)
      expect(e.message).toEqual('Sorry, something went wrong')
      if (!e.stack) throw new Error('Expected stack')

      expect(e.stack).toContain('handler')
      expect(e.stack).toContain(`ApiError ({"status":${code}})`)
      expect(e.stack).not.toContain(ErrorUsedToCatchStackTraceBeforeAsyncAction.name)
    }
  })

  it('refreshes the page on 401s', async () => {
    const mockFn = jest.spyOn(window.location, 'reload')
    fetchMock.mockImplementation(() => {
      return Promise.resolve(new Response('{}', {status: 401}))
    })

    await fetchJSONWith<any>('/foo', {method: 'POST'})

    expect(mockFn).toHaveBeenCalled()
  })

  it('a 401 will pass through ok: false', async () => {
    const response = new Response('', {status: 401})
    fetchMock.mockImplementation(() => {
      return Promise.resolve(response)
    })

    const resp = await fetchJSONWith('/foo', {method: 'POST'})

    expect(resp).toEqual({headers: response.headers, ok: false, data: {}})
  })

  // this test ensures that when a 'Failed to fetch' error is thrown, it is caught and an ApiError is thrown instead
  // with a message of 'Failed to fetch' which we're checking for here to as we suppress this error in failbot
  // See /ui/packages/failbot/failbot.ts#L33
  it.each(Array.from(EXPECTED_NETWORK_ERROR_MESSAGES))(
    'should throw an ApiError when a network error is throw with the message "%s"',
    async expectedMessage => {
      fetchMock.mockImplementation(() => {
        return new Promise(() => {
          throw new TypeError(expectedMessage)
        })
      })
      const handler = fetchJSONWith('/foo', {method: 'POST'})

      await expect(handler).rejects.toThrow(expectedMessage)
      await expect(handler).rejects.toThrow(ApiError)
    },
  )
})
