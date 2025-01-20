import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

// The estimated size of a card. Used for virtualization.
export const CARD_SIZE_ESTIMATE = 125
// Vertical gap between cards
export const CARD_MARGIN_BOTTOM = 8
// Padding between column and cards
export const COLUMN_PADDING = 4

export const COLUMN_STYLE: BetterSystemStyleObject = {
  borderRadius: 2,
  transition: 'transform 75ms',
  border: '1px solid',
  borderColor: 'border.default',
}

export const HORIZONTAL_GROUP_CONTAINER_STYLE: BetterSystemStyleObject = {
  display: 'flex',
  backgroundColor: 'canvas.default',
}

export const BASE_BOARD_CARD_AREA_STYLE: BetterSystemStyleObject = {
  flex: 'auto',
  height: '0',
  p: 2,
  px: '16px',
  overflowY: 'hidden',
  position: 'relative', // Needed to show the column drag-n-drop sash
  display: 'flex',
}

export const HORIZONTAL_GROUP_BOARD_CARD_AREA_STYLE: BetterSystemStyleObject = {
  ...BASE_BOARD_CARD_AREA_STYLE,
  flexDirection: 'column',
  overflowY: 'auto',
  py: 0,
  pb: 2,
}

export const HORIZONTAL_GROUP_HEADER_STYLE: BetterSystemStyleObject = {
  display: 'flex',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}

export const HORIZONTAL_GROUP_AREA_CONTAINER_STYLE: BetterSystemStyleObject = {
  isolation: 'isolate',
  height: 'fit-content',
  width: 'fit-content',
}
