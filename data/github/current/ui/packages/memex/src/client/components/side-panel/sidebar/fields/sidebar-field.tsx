import type {SidePanelItem} from '../../../../api/memex-items/side-panel-item'
import {ViewerPrivileges} from '../../../../helpers/viewer-privileges'
import type {ColumnModel} from '../../../../models/column-model'
import {FieldValue} from './core'
import type {SidePaneSideBarItemValueType} from './types'

type SidebarFieldData<T extends SidePaneSideBarItemValueType, C extends ColumnModel> = {
  model: SidePanelItem
  columnModel: C
  content?: T
}

export type SidebarCustomFieldProps<T extends SidePaneSideBarItemValueType, C extends ColumnModel> = SidebarFieldData<
  T,
  C
> & {
  onSaved: () => void
}

export type SidebarFieldRendererProps<T extends SidePaneSideBarItemValueType, C extends ColumnModel> = SidebarFieldData<
  T,
  C
>

export type SidebarFieldEditorProps<T extends SidePaneSideBarItemValueType, C extends ColumnModel> = SidebarFieldData<
  T,
  C
> & {
  onSaved: () => void
}

type SidebarFieldsProps<T extends SidePaneSideBarItemValueType, C extends ColumnModel> = SidebarCustomFieldProps<
  T,
  C
> & {
  renderer: React.FC<SidebarFieldRendererProps<T, C>>
  editor: React.FC<SidebarFieldEditorProps<T, C>>
  onSaved: () => void
}

export const SidebarField = <T extends SidePaneSideBarItemValueType, C extends ColumnModel>({
  model,
  columnModel,
  content,
  onSaved,
  renderer: Renderer,
  editor: Editor,
}: SidebarFieldsProps<T, C>) => {
  const {hasWritePermissions} = ViewerPrivileges()

  return hasWritePermissions ? (
    <Editor model={model} columnModel={columnModel} content={content} onSaved={onSaved} />
  ) : (
    <FieldValue>
      <Renderer model={model} columnModel={columnModel} content={content} />
    </FieldValue>
  )
}
