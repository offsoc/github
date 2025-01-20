import {expect, test} from '@jest/globals'
import {IssueReference} from '../issue-reference'

describe('IssueReference', () => {
  describe('href', () => {
    test.each([
      {
        pathname: '/github/github/pull/2',
        reference: '#1',
        expected_href: 'https://github.com/ghost_pilot/github/github/issues/1',
      },
      {
        pathname: '/github/github/pull/2',
        reference: 'https://github.com/github/github/issues/1',
        expected_href: 'https://github.com/ghost_pilot/github/github/issues/1',
      },
      {
        pathname: '/github/github/compare/main...monalisa-patch-1',
        reference: 'github/codespaces#1',
        expected_href: 'https://github.com/ghost_pilot/github/codespaces/issues/1',
      },
      {
        pathname: '/t4e-best/repo',
        reference: 'a9a/i2i#123',
        expected_href: 'https://github.com/ghost_pilot/a9a/i2i/issues/123',
      },
      {
        pathname: '/github/codespaces/discussions/new?category=availability-reports',
        reference: 'github/codespaces#1',
        expected_href: 'https://github.com/ghost_pilot/github/codespaces/issues/1',
      },
      {
        pathname: '/github/codespaces/discussions/new?category=availability-reports',
        reference: '#1',
        expected_href: 'https://github.com/ghost_pilot/github/codespaces/issues/1',
      },
    ])('creates a valid URL from an issue reference', ({pathname, reference, expected_href}) => {
      // @ts-expect-error: mocking out window.location
      delete window.location
      window.location = {
        origin: 'https://github.com',
        pathname,
      } as unknown as Location
      const obj = new IssueReference(reference)
      expect(obj.href).toEqual(expected_href)
    })
  })
})
