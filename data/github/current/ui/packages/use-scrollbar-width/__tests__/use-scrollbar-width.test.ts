import {renderHook} from '@testing-library/react'
import {useScrollbarWidth} from '../use-scrollbar-width'

test('Renders the useScrollbarWidth hook', () => {
  const el = document.createElement('div')
  el.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;'
  document.body.appendChild(el)

  const {result} = renderHook(() => useScrollbarWidth())
  expect(result.current).toBe(el.offsetWidth - el.clientWidth)
})
