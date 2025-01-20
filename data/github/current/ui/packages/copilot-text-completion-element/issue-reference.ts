export class IssueReference {
  private reference: string
  private _href: string | undefined

  title: string | undefined
  description: string | undefined

  constructor(reference: string) {
    this.reference = reference
  }

  get href(): string {
    if (!this._href) {
      if (this.reference.startsWith(window.location.origin)) {
        this._href = this.reference.replace(window.location.origin, `${window.location.origin}/ghost_pilot`)
        return this._href
      }

      const currentNwo = window.location.pathname.split('/').slice(1, 3).join('/')
      const [repo, issueNumber] = this.reference.split('#')

      if (this.reference.startsWith('#')) {
        this._href = `${window.location.origin}/ghost_pilot/${currentNwo}/issues/${issueNumber}`
      } else {
        this._href = `${window.location.origin}/ghost_pilot/${repo}/issues/${issueNumber}`
      }
    }

    return this._href
  }
}
