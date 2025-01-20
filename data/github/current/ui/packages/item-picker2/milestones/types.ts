import type {ItemPickerMilestonesItem_Fragment$data} from './__generated__/ItemPickerMilestonesItem_Fragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

type AdditionalInfo = OmitFragment<ItemPickerMilestonesItem_Fragment$data>

export type SubmittedMilestone = {
  id: string
  additionalInfo: AdditionalInfo
}
