import type {MemexItemModel} from '../../../models/memex-item-model'
import type {VerticalGroup} from '../../../models/vertical-group'
import type {FocusType} from '../../../navigation/types'
import type {MovingCards} from '../navigation'

export type CardProps = {
  verticalGroup: VerticalGroup
  columnIndex: number
  item: MemexItemModel
  scrollIntoView?: boolean
  index: number
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>
  focusType: FocusType | undefined
  keyboardMovingCard: MovingCards | undefined
  isDragDisabled: boolean
  isVisible: boolean
  size: number
  horizontalGroupId?: string
  horizontalGroupIndex: number
}

export type CardWithoutItemProps = Omit<
  CardProps,
  'item' | 'index' | 'sashSide' | 'isDragDisabled' | 'isVisible' | 'size'
>
