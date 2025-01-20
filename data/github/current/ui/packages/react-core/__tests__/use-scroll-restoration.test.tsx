import {renderHook, act, waitFor} from '@testing-library/react'
import {useScrollRestoration, installScrollRestoration} from '../use-scroll-restoration'

const fakeRestorationDataForIdentifier = jest.fn().mockImplementation(() => ({
  scrollPosition: {x: 66, y: 33},
}))

jest.mock('@github/turbo', () => ({
  session: {
    history: {
      getRestorationDataForIdentifier: fakeRestorationDataForIdentifier,
      restorationIdentifier: 'whatever',
    },
  },
}))

describe('useScrollRestoration', () => {
  describe('with `use-scroll-restoration` feature flag enabled', () => {
    beforeEach(() => {
      installScrollRestoration()
    })
    it('does not restore scroll position on load', () => {
      renderHook(() => useScrollRestoration())

      expect(window.scrollTo).not.toHaveBeenCalled()
    })

    it('does not restore scroll position if there is no restoration info', () => {
      fakeRestorationDataForIdentifier.mockImplementationOnce(() => undefined)
      act(() => window.dispatchEvent(new PopStateEvent('popstate', {})))
      renderHook(() => useScrollRestoration())

      expect(window.scrollTo).not.toHaveBeenCalled()
    })

    it('restores scroll position after popstate to the turbo restoration state', async () => {
      act(() => window.dispatchEvent(new PopStateEvent('popstate', {})))
      renderHook(() => useScrollRestoration())

      expect(fakeRestorationDataForIdentifier).toHaveBeenCalled()
      await waitFor(() => expect(window.scrollTo).toHaveBeenLastCalledWith(66, 33))
      expect(window.scrollTo).toHaveBeenCalledTimes(1)
    })
  })

  it('only runs installScrollRestoration once', async () => {
    jest.spyOn(window, 'addEventListener')

    installScrollRestoration()
    await waitFor(() => {
      // we need to wait for the async turbo import
      expect(window.addEventListener).toHaveBeenCalledTimes(1)
    })
    installScrollRestoration()
    expect(window.addEventListener).toHaveBeenCalledTimes(1)
  })
})
