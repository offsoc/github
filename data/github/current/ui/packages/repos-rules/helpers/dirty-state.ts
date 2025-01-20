import type {Rule} from '../types/rules-types'

export enum DirtyState {
  ADDED = 'New',
  MODIFIED = 'Edited',
  REMOVED = 'Removed',
}

export const getRuleDirtyState = (rule: Rule) =>
  rule.id || rule['parameters']['max_ref_updates'] !== undefined
    ? rule._enabled
      ? DirtyState.MODIFIED
      : DirtyState.REMOVED
    : DirtyState.ADDED
