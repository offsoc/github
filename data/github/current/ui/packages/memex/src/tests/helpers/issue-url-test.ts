import {getIssueItemIdentifier} from '../../client/helpers/issue-url'

describe('issue url', () => {
  describe('getItemIdentifier', () => {
    it('should return undefined if the url is not an issue url (empty)', () => {
      const result = getIssueItemIdentifier('')
      expect(result).toBeUndefined()
    })

    it('should return undefined if the url is not an issue url (no match)', () => {
      const result = getIssueItemIdentifier('github.com')
      expect(result).toBeUndefined()
    })

    it('should return undefined if the url is not an issue url (no number)', () => {
      const result = getIssueItemIdentifier('github.com/owner/repo/issues/abc')
      expect(result).toBeUndefined()
    })

    it('should return undefined item identifier if an issue url (no number)', () => {
      const result = getIssueItemIdentifier('github.com/owner/repo/issues/123')
      expect(result).toMatchObject({
        owner: 'owner',
        repo: 'repo',
        number: 123,
      })
    })
  })
})
