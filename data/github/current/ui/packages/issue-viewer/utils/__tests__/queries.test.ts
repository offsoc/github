import {getRepositorySearchQuery} from '../queries'

test('returns correct search for only a repo name', () => {
  const value = getRepositorySearchQuery('github')
  expect(value).toEqual('github in:name archived:false')
})

test('returns correct search for org and empty repo', () => {
  const value = getRepositorySearchQuery('github/')
  expect(value).toEqual('org:github in:name archived:false')
})

test('returns correct search for empty org and repo', () => {
  const value = getRepositorySearchQuery('/github')
  expect(value).toEqual('/github in:name archived:false')
})

test('returns correct search for org and repo', () => {
  const value = getRepositorySearchQuery('github/github')
  expect(value).toEqual('org:github github in:name archived:false')
})
