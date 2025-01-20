import type {QUERY_FIELDS} from '../../constants/queries'
import {getIssueSearchURL} from '../urls'

describe('getIssueSearchURL', () => {
  test('returns correct search url', () => {
    const identifier = {
      owner: 'github',
      repo: 'github',
    }

    const url = getIssueSearchURL(identifier, 'type', 'bug')
    expect(url).toBe(`/github/github/issues?q=${encodeURIComponent('type:bug')}`)
  })

  test('returns correct search url with whitespace metadata value', () => {
    const identifier = {
      owner: 'github',
      repo: 'github',
    }

    const url = getIssueSearchURL(identifier, 'type', 'feature request')
    expect(url).toBe(`/github/github/issues?q=${encodeURIComponent('type:feature request')}`)
  })

  test('returns correct search url when metadata field is missing', () => {
    const identifier = {
      owner: 'github',
      repo: 'github',
    }

    const url = getIssueSearchURL(identifier, '' as keyof typeof QUERY_FIELDS, 'feature request')
    expect(url).toBe('/github/github/issues')
  })

  test('returns correct search url when metadata value is missing', () => {
    const identifier = {
      owner: 'github',
      repo: 'github',
    }

    const url = getIssueSearchURL(identifier, 'type', '')
    expect(url).toBe('/github/github/issues')
  })

  test('returns empty string if owner is missing', () => {
    const identifier = {
      owner: '',
      repo: 'github',
    }

    const url = getIssueSearchURL(identifier, 'type', 'bug')
    expect(url).toBe('')
  })

  test('returns empty string if repo is missing', () => {
    const identifier = {
      owner: 'github',
      repo: '',
    }

    const url = getIssueSearchURL(identifier, 'type', 'bug')
    expect(url).toBe('')
  })
})
