export interface Author {
  displayName: string
  /**
   * The author may or may not have a GitHub login/path.
   */
  login: string | undefined
  path: string | undefined
  avatarUrl: string
}
