import {setUserContentScrolling, getUserContentScrolling} from '../allow-user-content-scrolling'

test('setUserContentScrolling', () => {
  setUserContentScrolling(true)
  expect(getUserContentScrolling()).toBe(true)

  setUserContentScrolling(false)
  expect(getUserContentScrolling()).toBe(false)
})
