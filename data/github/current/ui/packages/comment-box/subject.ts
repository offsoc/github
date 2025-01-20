export type SubjectType = 'issue_comment' | 'issue' | 'pull_request' | 'commit'

export type RepoSubject = {
  type: SubjectType
  id?: {
    id: string
    databaseId?: number
  }
  repository: {
    databaseId: number
    nwo: string
    slashCommandsEnabled: boolean
  }
}

// Projects are not bound to a repository or issue, so we need to handle them separately.
export type ProjectSubject = {
  type: 'project'
  id?: {
    databaseId: number
  }
}

export type Subject = RepoSubject | ProjectSubject
