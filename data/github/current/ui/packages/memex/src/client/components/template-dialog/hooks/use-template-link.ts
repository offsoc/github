import type {To} from 'react-router-dom'

import type {CustomTemplate} from '../../../api/common-contracts'
import type {SystemTemplate} from '../../../api/memex/contracts'
import type {ViewType} from '../../../helpers/view-type'
import {useSearchParams} from '../../../router'

export const CustomTemplateParam = 'custom_template'
export const SystemTemplateParam = 'system_template'
export const LayoutTemplateParam = 'layout_template'

export type SelectedTemplate =
  | {type: 'custom'; template: CustomTemplate}
  | {type: 'system'; template: SystemTemplate}
  | {type: 'layout'; viewType: ViewType}

// Constructs a URL to a template within the dialog, preserving existing state.
export function useTemplateLink(link: SelectedTemplate): To {
  const [searchParams] = useSearchParams()
  // URLSearchParams is mutable, so we are simply modifying the existing instance and returning it directly.
  if (link.type === 'custom') {
    searchParams.set(CustomTemplateParam, String(link.template.projectNumber))
  }
  if (link.type === 'system') {
    searchParams.set(SystemTemplateParam, link.template.id)
  }
  if (link.type === 'layout') {
    searchParams.set(LayoutTemplateParam, link.viewType)
  }
  return {search: searchParams.toString()}
}
