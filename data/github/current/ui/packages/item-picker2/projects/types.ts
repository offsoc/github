import type {
  ItemPickerProjectsItem_ClassicProjectFragment$data,
  ItemPickerProjectsItem_ClassicProjectFragment$key,
} from './__generated__/ItemPickerProjectsItem_ClassicProjectFragment.graphql'
import type {
  ItemPickerProjectsItem_ProjectV2Fragment$data,
  ItemPickerProjectsItem_ProjectV2Fragment$key,
} from './__generated__/ItemPickerProjectsItem_ProjectV2Fragment.graphql'

export type OmitFragment<T> = Omit<T, ' $fragmentType' | ' $fragmentSpreads' | 'id'>

export type ItemPickerProjectsItem_FragmentData =
  | ItemPickerProjectsItem_ClassicProjectFragment$data
  | ItemPickerProjectsItem_ProjectV2Fragment$data

export type ItemPickerProjectsItem_FragmentKey =
  | (ItemPickerProjectsItem_ClassicProjectFragment$key & {readonly __typename?: 'Project'})
  | (ItemPickerProjectsItem_ProjectV2Fragment$key & {readonly __typename?: 'ProjectV2'})

type AdditionalInfo = OmitFragment<ItemPickerProjectsItem_FragmentData>

export type SubmittedProject = {
  id: string
  additionalInfo: AdditionalInfo
}
