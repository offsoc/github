import type {UpdateColumnValueAction} from '../../api/columns/contracts/domain'

export type OmnibarItemAttrs = {
  /**
   * Optional: an initial set of actions to apply to the item added from the omnibar.
   *
   * Set this option to add additional data to the item, e.g. associate it with
   * a particular group i.e. vertical or horizontal in the current layout.
   */
  updateColumnActions?: Array<UpdateColumnValueAction>
  previousItemId?: number
  groupId?: string
  secondaryGroupId?: string
}
