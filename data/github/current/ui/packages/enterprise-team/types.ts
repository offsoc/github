export type EnterpriseTeam = {
  name: string
  slug: string
  id: string
  external_group_mapping: boolean
}

export type User = {
  login: string
  id: number
  name: string | null
}
