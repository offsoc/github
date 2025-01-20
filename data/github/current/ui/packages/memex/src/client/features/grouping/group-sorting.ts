import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {Label, User} from '../../api/common-contracts'
import {fullDisplayName} from '../../helpers/tracked-by-formatter'
import type {GroupingMetadataWithSource} from './types'

/**
 * Use a special collator to make sure that when grouping by number we sort in numerical order
 * (e.g. '1', '2', '10') rather than lexical order (e.g. '1', '10', '2').
 *
 * This doesn't otherwise affect string comparisons, so it has no effect when we group by other
 * types (which each represent the group value as a string).
 *
 * https://stackoverflow.com/a/38641281
 */
const NUMERIC_COLLATOR = new Intl.Collator(undefined, {numeric: true})

/**
 * Alphabetical ascending order compare, assuming the users within a group are sorted alphabetically
 *
 * @param a - The first group to compare
 * @param b - The second group to compare
 * @returns the sorted array
 */
function compareAssigneesGroups(a: GroupingMetadataWithSource, b: GroupingMetadataWithSource) {
  const sourceA = a.sourceObject
  const sourceB = b.sourceObject

  // base case, prioritize assignees over non-assignees
  if (sourceA.dataType !== MemexColumnDataType.Assignees || sourceB.dataType !== MemexColumnDataType.Assignees) {
    return -1
  }

  return NUMERIC_COLLATOR.compare(a.value, b.value)
}

function compareTrackedByGroups(a: GroupingMetadataWithSource, b: GroupingMetadataWithSource) {
  const sourceA = a.sourceObject
  const sourceB = b.sourceObject

  // only compare parent item groups, ignore everything else
  if (
    sourceA.dataType === MemexColumnDataType.TrackedBy &&
    sourceA.kind === 'group' &&
    sourceB.dataType === MemexColumnDataType.TrackedBy &&
    sourceB.kind === 'group'
  ) {
    return NUMERIC_COLLATOR.compare(fullDisplayName(sourceA.value), fullDisplayName(sourceB.value))
  }

  return -1
}

/**
 * Compare function to sort Assignees by the user login in alphabetical ascending order
 */
export function compareAssigneesInAscOrder(a: User, b: User): number {
  return NUMERIC_COLLATOR.compare(a.login, b.login)
}

/**
 * Compare function to sort Labels by the label name in alphabetical ascending order
 */
export function compareLabelsInAscOrder(a: Label, b: Label): number {
  return NUMERIC_COLLATOR.compare(a.name, b.name)
}

/**
 * sorts aggregated groups by kind defaults to NUMERICAL_COLLATOR
 *
 * @param dataType - The data type of the column
 * @param groups - The groups to sort
 * @returns the sorted groups by column data type
 */
export function sortAggregatedGroupsByKind(
  dataType: MemexColumnDataType,
  groups: Array<GroupingMetadataWithSource>,
): Array<GroupingMetadataWithSource> {
  switch (dataType) {
    case MemexColumnDataType.Assignees:
      return groups.sort(compareAssigneesGroups)
    case MemexColumnDataType.TrackedBy:
      return groups.sort(compareTrackedByGroups)
    default:
      return groups.sort((a, b) => NUMERIC_COLLATOR.compare(a.value, b.value))
  }
}
