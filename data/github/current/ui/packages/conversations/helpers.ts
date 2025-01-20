export function anchorComment(commentDatabaseId: string, anchorPrefix = 'r') {
  history.replaceState(null, '', `#${anchorPrefix}${commentDatabaseId}`)
}
