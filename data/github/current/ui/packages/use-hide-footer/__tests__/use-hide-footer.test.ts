import {renderHook} from '@testing-library/react'
import {useHideFooter} from '../use-hide-footer'

describe('when the hook is passed false', () => {
  test('it returns undefined', () => {
    const {result} = renderHook(() => useHideFooter(false))
    expect(result.current).toBeUndefined()
  })

  test('it does not hide the <footer> element if it is in the DOM', () => {
    const footer = document.createElement('footer')
    footer.className = 'footer'
    document.body.appendChild(footer)
    renderHook(() => useHideFooter(false))

    expect(footer.hidden).toBe(false)

    document.body.removeChild(footer)
  })
})

describe('when the hook is passed true', () => {
  test('returns undefined if no <footer> element is in the DOM', () => {
    const {result} = renderHook(() => useHideFooter(true))
    expect(result.current).toBeUndefined()
  })

  test('hides the <footer> element if it is in the DOM', () => {
    const footer = document.createElement('footer')
    footer.className = 'footer'
    document.body.appendChild(footer)
    renderHook(() => useHideFooter(true))

    expect(footer.hidden).toBe(true)

    document.body.removeChild(footer)
  })
})
