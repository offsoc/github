import {act, renderHook} from '@testing-library/react'
import {useFeatureRequest} from '../use-feature-request'
import {mockFetch} from '@github-ui/mock-fetch'

describe('useFeatureRequest', () => {
  test('returns the correct initial state when alreadyRequested is false', () => {
    const featureRequestInfo = {
      alreadyRequested: false,
      dismissed: false,
      requestPath: '/path',
      featureName: 'feature',
    }
    const {result} = renderHook(() => useFeatureRequest(featureRequestInfo))

    const {inProgress, requested, toggleFeatureRequest} = result.current

    expect(inProgress).toBe(false)
    expect(requested).toBe(false)
    expect(toggleFeatureRequest).toBeInstanceOf(Function)
  })

  test('returns the correct initial state when alreadyRequested is true', () => {
    const featureRequestInfo = {
      alreadyRequested: true,
      dismissed: false,
      requestPath: '/path',
      featureName: 'feature',
    }
    const {result} = renderHook(() => useFeatureRequest(featureRequestInfo))

    const {inProgress, requested, toggleFeatureRequest} = result.current

    expect(inProgress).toBe(false)
    expect(requested).toBe(true)
    expect(toggleFeatureRequest).toBeInstanceOf(Function)
  })

  test('returns the correct state after clicking', async () => {
    const featureRequestInfo = {
      alreadyRequested: false,
      dismissed: false,
      requestPath: '/path',
      featureName: 'feature',
    }
    const {result} = renderHook(() => useFeatureRequest(featureRequestInfo))

    const {toggleFeatureRequest} = result.current

    await act(() => {
      toggleFeatureRequest()
      mockFetch.resolvePendingRequest('/path', {feature: 'feature'}, {ok: true})
    })

    const {inProgress, requested} = result.current

    expect(inProgress).toBe(false)
    expect(requested).toBe(true)
  })

  test('returns the correct state after clicking and failing', async () => {
    const featureRequestInfo = {
      alreadyRequested: false,
      dismissed: false,
      requestPath: '/path',
      featureName: 'feature',
    }
    const {result} = renderHook(() => useFeatureRequest(featureRequestInfo))

    const {toggleFeatureRequest} = result.current

    await act(() => {
      toggleFeatureRequest()
      mockFetch.resolvePendingRequest('/path', {feature: 'feature'}, {ok: false})
    })

    const {inProgress, requested} = result.current

    expect(inProgress).toBe(false)
    expect(requested).toBe(false)
  })

  test('sets inProgress to true when clicking', async () => {
    const featureRequestInfo = {
      alreadyRequested: false,
      dismissed: false,
      requestPath: '/path',
      featureName: 'feature',
    }
    const {result} = renderHook(() => useFeatureRequest(featureRequestInfo))

    const {toggleFeatureRequest} = result.current

    await act(() => {
      toggleFeatureRequest()
    })

    const {inProgress} = result.current

    expect(inProgress).toBe(true)
  })
})
