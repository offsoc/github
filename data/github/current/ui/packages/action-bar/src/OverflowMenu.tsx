import {testIdProps} from '@github-ui/test-id-props'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, type IconButtonProps, merge} from '@primer/react'
import {Fragment, useMemo} from 'react'

import {useActionBarContent} from './ActionBarContentContext'
import {useActionBarRef} from './ActionBarRefContext'
import {useActionBarResize} from './ActionBarResizeContext'

export type OverflowMenuProps = {
  anchorProps?: Omit<IconButtonProps, 'aria-labelledby'>
}

const defaultMenuToggleIcon = KebabHorizontalIcon
const defaultMenuToggleVariant = 'invisible'

export const OverflowMenu = ({
  anchorProps: {
    'aria-label': ariaLabel,
    icon = defaultMenuToggleIcon,
    variant = defaultMenuToggleVariant,
    ...otherAnchorProps
  } = {
    icon: defaultMenuToggleIcon,
    variant: defaultMenuToggleVariant,
  },
}: OverflowMenuProps) => {
  const {actions, staticMenuActions, label} = useActionBarContent()
  const {visibleChildEndIndex} = useActionBarResize()
  const {anchorRef} = useActionBarRef()
  const anchorProps = useMemo(
    () =>
      merge(otherAnchorProps, {
        'aria-label': ariaLabel?.trim() || `More ${label}`,
        icon,
        sx: {flexShrink: 0},
        variant,
      }),
    [ariaLabel, icon, label, variant, otherAnchorProps],
  )
  const overflowActions = useMemo(() => actions?.slice(visibleChildEndIndex), [actions, visibleChildEndIndex])

  const hasOverflowActions = overflowActions && overflowActions.length > 0
  const hasStaticMenuActions = staticMenuActions && staticMenuActions.length > 0

  if (!hasOverflowActions && !hasStaticMenuActions) return null

  return (
    <ActionMenu anchorRef={anchorRef}>
      <ActionMenu.Anchor>
        <IconButton {...testIdProps('overflow-menu-anchor')} {...anchorProps} />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay align="end">
        <ActionList>
          {hasStaticMenuActions &&
            staticMenuActions.map(staticMenuAction => (
              <Fragment key={`${staticMenuAction.key}`}>{staticMenuAction.render()}</Fragment>
            ))}

          {overflowActions?.map(action => <Fragment key={action.key}>{action.render(true)}</Fragment>)}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
