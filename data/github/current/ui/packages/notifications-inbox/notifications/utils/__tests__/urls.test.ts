import {notificationSearchUrl, notificationUrl} from '../urls'

test('notificationUrl returns deafult url if no notificationId is passed', () => {
  const url = notificationUrl('')
  expect(url).toEqual('/inbox')
})

test('notificationUrl returns deafult url is appended notificationId', () => {
  const url = notificationUrl('NT_kwACpDY1OjI')
  expect(url).toEqual('/inbox/NT_kwACpDY1OjI')
})

test('notificationSearchUrl returns default url if query is undefined', () => {
  const url = notificationSearchUrl({query: undefined})
  expect(url).toEqual('/inbox')
})

test('notificationSearchUrl returns default url if query is empty string', () => {
  const url = notificationSearchUrl({query: ''})
  expect(url).toEqual('/inbox')
})

test('notificationSearchUrl returns url with query parameter', () => {
  const url = notificationSearchUrl({query: 'is:read'})
  expect(url).toEqual(`/inbox?q=${encodeURIComponent('is:read')}`)
})

test('notificationSearchUrl returns url with view parameter', () => {
  const url = notificationSearchUrl({view: 'focus'})
  expect(url).toEqual('/inbox/views/focus')
})

test('notificationSearchUrl returns url with view and query parameter', () => {
  const url = notificationSearchUrl({view: 'other', query: 'is:read'})
  expect(url).toEqual(`/inbox/views/other?q=${encodeURIComponent('is:read')}`)
})
