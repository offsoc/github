import type {ItemPickerRepositoryItem_Fragment$data} from './__generated__/ItemPickerRepositoryItem_Fragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

type AdditionalInfo = OmitFragment<ItemPickerRepositoryItem_Fragment$data>

export type SubmittedRepository = {
  id: string
  additionalInfo: AdditionalInfo
}
