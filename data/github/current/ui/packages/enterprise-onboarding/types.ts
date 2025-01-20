export interface OrgNameStatus {
  exists: boolean
  is_name_modified: boolean
  name: string
  not_alphanumeric: boolean
  over_max_length: boolean
  unavailable: boolean
}
