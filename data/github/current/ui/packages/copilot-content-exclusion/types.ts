export type OrgSettingsPayload = {
  organization: string
  lastEdited: LastEditedPayload
  document?: string
  message?: string
}

export type RepoSettingsPayload = {
  organization: string
  repo: string
  lastEdited: LastEditedPayload
  message?: string
  orgLevelRules: Array<{paths: string[]; link: string; name: string}>
  repoDocument: string | null
}

export type LastEditedPayload = {login: string; time: string; link?: string}
