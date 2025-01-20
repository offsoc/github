import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionMenu, IconButton, ActionList} from '@primer/react'
import {useRef} from 'react'

type Props = React.PropsWithChildren<{
  isVisible: boolean
  testId?: string
}>

export function RowActionsMenu(props: Props) {
  const {isVisible, testId} = props

  const returnFocusRef = useRef(null)

  if (!isVisible) {
    return null
  }

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          icon={KebabHorizontalIcon}
          variant="invisible"
          aria-label="Open column options"
          ref={returnFocusRef}
          data-testid={testId}
          sx={{height: '28px', width: '28px'}}
        />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single">{props.children}</ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
