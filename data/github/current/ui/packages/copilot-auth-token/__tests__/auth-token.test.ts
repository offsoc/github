import {AuthToken, type AuthTokenResult} from '../auth-token'

describe('AuthToken', () => {
  describe('authorizationHeaderValue', () => {
    it('starts with "GitHub-Bearer"', () => {
      const token = new AuthToken('deadbeef', '2024-04-01T12:34:56', [])

      expect(token.authorizationHeaderValue).toBe('GitHub-Bearer deadbeef')
    })
  })

  describe('isExpired', () => {
    it('is true if the token is expired', () => {
      const token = new AuthToken('deadbeef', '2020-01-01T00:00:00', [])

      expect(token.isExpired).toBeTruthy()
    })

    it('is false if the token is not expired', () => {
      const token = new AuthToken('deadbeef', '2999-01-01T00:00:00', [])

      expect(token.isExpired).toBeFalsy()
    })

    it('has a 15 second padding', () => {
      let expiry = new Date(Date.now() + 5000)
      let token = new AuthToken('deadbeef', expiry.toISOString(), [])

      expect(token.isExpired).toBeTruthy()

      expiry = new Date(Date.now() + 20000)
      token = new AuthToken('deadbeef', expiry.toISOString(), [])

      expect(token.isExpired).toBeFalsy()
    })
  })

  describe('ssoChanged', () => {
    it('returns false when ssoOrgs remains an empty array', () => {
      const token = new AuthToken('deadbeef', '2024-01-01T12:34:56', [])

      expect(token.ssoChanged([])).toBeFalsy()
    })

    it('returns false when ssoOrgs are equal', () => {
      const orgId = '1234'
      const token = new AuthToken('deadbeef', '2024-01-01T12:34:56', [orgId])

      expect(token.ssoChanged([orgId])).toBeFalsy()
    })

    it('returns false when ssoOrgs have the same items with different orders', () => {
      const o1 = {
        id: '1234',
        login: 'github',
        avatarUrl: 'whatever',
      }
      const o2 = {
        id: '1235',
        login: 'bithug',
        avatarUrl: 'whocares',
      }
      const token = new AuthToken('deadbeef', '2024-01-01T12:34:56', [o1.id, o2.id])

      expect(token.ssoChanged([o2.id, o1.id])).toBeFalsy()
    })

    it('returns true if ssoOrgs differ', () => {
      const o1 = {
        id: '1234',
        login: 'github',
        avatarUrl: 'whatever',
      }
      const o2 = {
        id: '1235',
        login: 'bithug',
        avatarUrl: 'whocares',
      }
      const token = new AuthToken('deadbeef', '2024-01-01T12:34:56', [o1.id, o2.id])

      expect(token.ssoChanged([o2.id])).toBeTruthy()
    })
  })

  describe('needsRefreshing', () => {
    it('returns true if the token is expired', () => {
      const token = new AuthToken('deadbeef', '2020-01-01T00:00:00', [])

      expect(token.needsRefreshing([])).toBeTruthy()
    })

    it('returns true if ssoOrgs differs', () => {
      const org = {
        id: '1234',
        login: 'github',
        avatarUrl: 'whatever',
      }

      const token = new AuthToken('deadbeef', '2999-01-01T00:00:00', [org.id])

      expect(token.needsRefreshing([])).toBeTruthy()
    })

    it('returns false otherwise', () => {
      const token = new AuthToken('deadbeef', '2999-01-01T00:00:00', [])

      expect(token.needsRefreshing([])).toBeFalsy()
    })
  })

  describe('fromResult', () => {
    it('builds an auth token correctly', () => {
      const result: AuthTokenResult = {
        token: 'deadbeef',
        expiration: '2020-01-01T00:00:00',
      }
      const orgIds = ['1234']

      const token = AuthToken.fromResult(result, orgIds)

      expect(token.value).toEqual(result.token)
      expect(token.expiration).toEqual(result.expiration)
      expect(token.ssoOrgIDs).toEqual(['1234'])
    })
  })

  describe('serialize', () => {
    it('returns a plain JS object', () => {
      const token = new AuthToken('deadbeef', '2020-01-01T00:00:00', ['1234'])

      expect(token.serialize()).toEqual({
        value: token.value,
        expiration: token.expiration,
        ssoOrgIDs: token.ssoOrgIDs,
      })
    })
  })

  describe('deserialize', () => {
    it('builds an AuthToken correctly', () => {
      const token = AuthToken.deserialize({
        value: 'deadbeef',
        expiration: '2020-01-01T00:00:00',
        ssoOrgIDs: ['1234'],
      })

      expect(token.value).toEqual('deadbeef')
      expect(token.expiration).toEqual('2020-01-01T00:00:00')
      expect(token.ssoOrgIDs).toEqual(['1234'])
    })
  })
})
