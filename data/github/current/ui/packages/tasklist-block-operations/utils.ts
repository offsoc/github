import type {AppendItemMDPayload, MDOperationPayload} from './types'

export async function performTasklistBlockOperation(body: string, args: MDOperationPayload) {
  const {
    appendItem,
    removeItem,
    removeTasklistBlock,
    updateItemPosition,
    updateItemState,
    updateItemTitle,
    updateTasklistTitle,
  } = await import('./operations')

  if (args.operation === 'append_item') {
    // Let the backend handle URLs so that issues can be rendered correctly.
    if (!/^\s*(https?:|#)/.test(args.value)) {
      return appendItem(body, args.position, args.value)
    }
  } else if (args.operation === 'update_item_title') {
    return updateItemTitle(body, args.position, args.value)
  } else if (args.operation === 'update_item_state') {
    return updateItemState(body, args.position, args.closed)
  } else if (args.operation === 'update_item_position') {
    return updateItemPosition(body, args.src, args.dst)
  } else if (args.operation === 'remove_item') {
    return removeItem(body, args.position)
  } else if (args.operation === 'remove_tasklist_block') {
    return removeTasklistBlock(body, args.position)
  } else if (args.operation === 'update_tasklist_title') {
    return updateTasklistTitle(body, args.position, args.name)
  }

  return null
}

export async function transformMarkdownToHTML(body: string) {
  const {transformToHTML} = await import('./operations')
  return transformToHTML(body)
}

export function isAppendItemMDPayload(payload: MDOperationPayload): payload is AppendItemMDPayload {
  return payload.operation === 'append_item'
}
