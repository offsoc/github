import type {ItemPickerAssigneesItem_Fragment$data} from './__generated__/ItemPickerAssigneesItem_Fragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

type AdditionalInfo = OmitFragment<ItemPickerAssigneesItem_Fragment$data>

export type SubmittedAssignee = {
  id: string
  additionalInfo: AdditionalInfo
}
