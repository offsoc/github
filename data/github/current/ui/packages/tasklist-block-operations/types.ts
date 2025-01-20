export type AppendItemMDPayload = {
  operation: 'append_item'
  position: number
  value: string
  formId: string
}

export type UpdateItemTitleMDPayload = {
  operation: 'update_item_title'
  position: [number, number]
  value: string
  formId: string
}

export type UpdateItemStateMDPayload = {
  operation: 'update_item_state'
  position: [number, number]
  closed: boolean
  formId: string
}

export type RemoveItemMDPayload = {
  operation: 'remove_item'
  position: [number, number]
  formId: string
}

export type RemoveTasklistBlockMDPayload = {
  operation: 'remove_tasklist_block'
  position: number
  formId: string
}

export type AddTasklistBlockMDPayload = {
  operation: 'add_tasklist_block'
  formId: string
}

export type UpdateItemPositionMDPayload = {
  operation: 'update_item_position'
  src: [number, number]
  dst: [number, number]
  formId: string
}

export type ConvertToIssueMDPayload = {
  operation: 'convert_to_issue'
  position: [number, number]
  formId: string
}

export type UpdateTasklistTitlePayload = {
  operation: 'update_tasklist_title'
  position: number
  name: string
  formId: string
}

export type MDOperationPayload =
  | AppendItemMDPayload
  | UpdateItemTitleMDPayload
  | UpdateItemStateMDPayload
  | RemoveItemMDPayload
  | RemoveTasklistBlockMDPayload
  | AddTasklistBlockMDPayload
  | UpdateItemPositionMDPayload
  | ConvertToIssueMDPayload
  | UpdateTasklistTitlePayload
