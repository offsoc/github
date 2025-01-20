import type {ItemPickerRepositoryAssignableUsersItem_Fragment$data} from './__generated__/ItemPickerRepositoryAssignableUsersItem_Fragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

type AdditionalInfo = OmitFragment<ItemPickerRepositoryAssignableUsersItem_Fragment$data>

export type SubmittedAssignee = {
  id: string
  additionalInfo: AdditionalInfo
}
