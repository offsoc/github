export type AuthTokenResult = {
  token: string
  expiration: string
}

/**
 * AuthToken represents an authentication token that is passed to azure.ai, which is used to authenticate
 * requests to the Azure AI API.
 *
 * It also can tell if it needs refreshing, i.e. if it is expired or if the SSO orgs have changed since
 * it was minted.
 *
 * Finally, it can convert itself to/from ordinary JS objects that can be stored/retrieved from
 * local storage.
 */
export class AuthToken {
  token: string
  expiration: string

  constructor(token: string, expiration: string) {
    this.token = token
    this.expiration = expiration
  }

  /**
   * Returns a formatted string to be used as the value of an `Authorization` header,
   * e.g. "GitHub-Bearer <encrypted token>"
   */
  get authorizationHeaderValue() {
    return `GitHub-Bearer ${this.token}`
  }

  /**
   * Returns true if this auth token needs to be refreshed.
   */
  needsRefreshing() {
    return this.isExpired
  }

  /**
   * Returns true if this auth token is expired.
   */
  get isExpired() {
    const expirationDateString = new Date(this.expiration)

    const expirationDate = new Date(
      Date.UTC(
        expirationDateString.getUTCFullYear(),
        expirationDateString.getUTCMonth(),
        expirationDateString.getUTCDate(),
        expirationDateString.getUTCHours(),
        expirationDateString.getUTCMinutes(),
        expirationDateString.getUTCSeconds(),
        expirationDateString.getUTCMilliseconds(),
      ),
    )

    const padding = 15 * 1000 // seconds

    return expirationDate < new Date(Date.now() + padding)
  }

  /**
   * Build a new AuthToken from the results of a call to the token API endpoint.
   */
  static fromResult(result: AuthTokenResult) {
    return new AuthToken(result.token, result.expiration)
  }

  /**
   * Convert this token into a plain JS object, which can be stringified and put into localStorage.
   */
  serialize(): AuthTokenResult {
    return {
      token: this.token,
      expiration: this.expiration,
    }
  }

  /**
   * Build a new auth token from a plain JS object, i.e. one parsed from localStorage.
   */
  static deserialize(serialized: AuthTokenResult): AuthToken {
    return new AuthToken(serialized.token, serialized.expiration)
  }
}
