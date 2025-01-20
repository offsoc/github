export type Option = {
  name: string
  value: string
  disabled?: boolean
  is_custom?: boolean
}

export type Group = {
  name?: string
  options: Options
  selected_value: string
  query_param: string
}
export type Groups = Group[]
export type Options = Option[]
