import {useDisableUserContentScrolling} from '../use-disable-user-content-scrolling'
import {renderHook} from '@testing-library/react'
import {getUserContentScrolling, setUserContentScrolling} from '@github-ui/allow-user-content-scrolling'

test('use-disable-user-content-scrolling', () => {
  setUserContentScrolling(true)

  const {unmount} = renderHook(() => useDisableUserContentScrolling())
  expect(getUserContentScrolling()).toBe(false)

  unmount()
  expect(getUserContentScrolling()).toBe(true)
})
