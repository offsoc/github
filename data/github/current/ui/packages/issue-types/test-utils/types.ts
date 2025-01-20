export type OrganizationPayload = {
  viewer: {
    isEnterpriseManagedUser: boolean
  }
  organization: {
    id?: string
    login: string
  }
  node: {
    id: string
    isEnabled: boolean
    name: string
    description: string
    isPrivate: boolean
  }
  issueTypes?: {
    totalCount: number
    edges: Array<{
      node: {
        id: string
        name: string
      }
    }>
  }
}
