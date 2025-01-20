import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

// when a Token uses a `leadingVisual` prop, `inline-block` causes the text to be on a separate line from the icon.
// This is a workaround to make the text and icon appear on the same line.
const truncatedTokenWithIconStyle: BetterSystemStyleObject = {
  overflow: 'hidden',
  cursor: 'inherit',
  '> span': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}

const truncatedTokenNoIconStyle: BetterSystemStyleObject = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-flex',
  cursor: 'inherit',
  // this is needed to counteract inline-block and maintain the vertical centering
  '> span': {
    verticalAlign: 'text-top',
  },
}

export function getTokenStyle(input: string, withIcon?: boolean) {
  return withIcon ? truncatedTokenWithIconStyle : truncatedTokenNoIconStyle
}

export type BaseFieldProps<TField, TValue> = {
  viewerCanUpdate: boolean
  onIssueUpdate?: () => void
  itemId: string
  projectId: string
  field: TField
  value: TValue | null
  isStatusField?: boolean
}
