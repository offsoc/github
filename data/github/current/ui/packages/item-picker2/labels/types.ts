import type {ItemPickerLabelsItem_DateFragment$data} from './__generated__/ItemPickerLabelsItem_DateFragment.graphql'
import type {ItemPickerLabelsItem_Fragment$data} from './__generated__/ItemPickerLabelsItem_Fragment.graphql'
import type {ItemPickerLabelsItem_PathFragment$data} from './__generated__/ItemPickerLabelsItem_PathFragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

type AdditionalInfo = OmitFragment<ItemPickerLabelsItem_Fragment$data> &
  Partial<OmitFragment<ItemPickerLabelsItem_PathFragment$data>> &
  Partial<OmitFragment<ItemPickerLabelsItem_DateFragment$data>>

export type SubmittedLabel = {
  id: string
  additionalInfo: AdditionalInfo
}
