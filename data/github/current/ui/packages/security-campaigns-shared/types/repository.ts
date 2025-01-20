export type Repository = {
  name: string
  ownerLogin: string
  path: string
  /**
   * The octicon key that represents this repository's present state.
   * see Repository#repo_type_icon
   */
  typeIcon: 'repo' | 'lock' | 'repo-forked' | 'mirror' | string
}
