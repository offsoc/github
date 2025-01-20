import type {ServerDateValue} from '../../../../api/columns/contracts/date'
import type {Iteration} from '../../../../api/columns/contracts/iteration'
import type {NumericValue} from '../../../../api/columns/contracts/number'
import type {PersistedOption} from '../../../../api/columns/contracts/single-select'
import type {EnrichedText} from '../../../../api/columns/contracts/text'
import type {
  ExtendedRepository,
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone,
  User,
} from '../../../../api/common-contracts'
import type {TrackedByItem} from '../../../../api/issues-graph/contracts'
import type {ItemCompletion} from '../../../../api/memex-items/side-panel-item'

export type SidePaneSideBarItemValueType =
  | Iteration
  | Array<User>
  | EnrichedText
  | Array<Label>
  | PersistedOption
  | Milestone
  | Array<LinkedPullRequest>
  | ServerDateValue
  | NumericValue
  | ExtendedRepository
  | ItemCompletion
  | Array<TrackedByItem>
  | IssueType
  | undefined
