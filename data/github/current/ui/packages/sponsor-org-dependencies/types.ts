export interface Dependency {
  name: string
  fullRepoName: string
}

export interface SponsorableData {
  id: number
  sponsorableName: string
  dependenciesArray: Dependency[]
  dependencyCount: number
  sponsorableAvatarUrl: string
  sponsorableIsOrg: boolean
  recentActivity?: string | null
  viewerIsSponsor: boolean
}
