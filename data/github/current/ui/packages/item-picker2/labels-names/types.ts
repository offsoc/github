import type {ItemPickerLabelsNamesItem_DateFragment$data} from './__generated__/ItemPickerLabelsNamesItem_DateFragment.graphql'
import type {ItemPickerLabelsNamesItem_Fragment$data} from './__generated__/ItemPickerLabelsNamesItem_Fragment.graphql'
import type {ItemPickerLabelsNamesItem_PathFragment$data} from './__generated__/ItemPickerLabelsNamesItem_PathFragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

type AdditionalInfo = OmitFragment<ItemPickerLabelsNamesItem_Fragment$data> &
  Partial<OmitFragment<ItemPickerLabelsNamesItem_PathFragment$data>> &
  Partial<OmitFragment<ItemPickerLabelsNamesItem_DateFragment$data>>

export type SubmittedLabel = {
  id: string
  additionalInfo: AdditionalInfo
}
