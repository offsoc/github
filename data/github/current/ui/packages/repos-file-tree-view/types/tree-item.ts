export interface TreeItem<T> {
  items: Array<TreeItem<T>>
  data: T
  autoExpand?: boolean
}
