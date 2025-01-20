import {render} from '@testing-library/react'
import {createRef} from 'react'
import {getScrollableParent} from '../get-scrollable-parent'

test('get-scrollable-parent', () => {
  const outterRef = createRef<HTMLDivElement>()
  const innerRef = createRef<HTMLDivElement>()
  render(
    <div ref={outterRef} style={{overflowY: 'auto'}}>
      <div ref={innerRef} />
    </div>,
  )
  expect(getScrollableParent(innerRef.current as HTMLElement)).toBe(outterRef.current)
})

test('get-scrollable-parent with no scrollable parent', () => {
  const outterRef = createRef<HTMLDivElement>()
  const innerRef = createRef<HTMLDivElement>()
  render(
    <div ref={outterRef}>
      <div ref={innerRef} />
    </div>,
  )
  expect(getScrollableParent(innerRef.current as HTMLElement)).not.toBe(outterRef.current)
})
