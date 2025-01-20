export type Org = {
  id: number
  displayLogin: string
  path: string
  avatarUrl: string
  memberCount: number
  enablementStatus: string
}

export type OrgsToUpdate = {[key: number]: string}

export type CodespacesBusinessEnablementProps = {
  policy_input_list: PolicyInput[]
  submit_url: string
  initalOrganizations: Org[]
  search_url: string
  initialPageCount: number
  disable_form: boolean
}

export type PolicyInput = {
  name: string
  value: string
  checked: boolean
  disabled: boolean
  text: string
  description: string
  confirm_message: string
}
