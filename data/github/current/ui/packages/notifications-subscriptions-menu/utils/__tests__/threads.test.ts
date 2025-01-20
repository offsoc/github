import {threadNameText} from '../threads'

test('returns correct text for pull requests', () => {
  const text = threadNameText('PullRequest')
  expect(text).toEqual('Pull requests')
})

test('returns correct text for security alerts', () => {
  const text = threadNameText('SecurityAlert')
  expect(text).toEqual('Security alerts')
})

test('returns correct text for other threads', () => {
  const text = threadNameText('Issue')
  expect(text).toEqual('Issues')
})
