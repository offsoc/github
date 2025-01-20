import {type ReactNode, type RefObject, useMemo} from 'react'

import {type ActionBarContentContextProps, ActionBarContentProvider} from './ActionBarContentContext'
import {ActionBarRefProvider} from './ActionBarRefContext'
import {ActionBarResizeProvider, type ActionBarResizeProviderValueProps} from './ActionBarResizeContext'
import type {Density} from './types'
import {gapFromDensity} from './utils'
import {VisibleAndOverflowContainer, type VisibleAndOverflowContainerProps} from './VisibleAndOverflowContainer'

const defaultDensity: Density = 'normal'

export type ActionBarProps = ActionBarContentContextProps &
  Pick<
    VisibleAndOverflowContainerProps,
    'overflowMenuToggleProps' | 'sx' | 'outerContainerSx' | 'className' | 'style'
  > & {
    /**
     * Any other elements to display in the action bar that shouldn't be collapsed based on available space.
     */
    children?: ReactNode
    /**
     * Spacing between individual items in the action bar, as well as between items and the overflow menu toggle
     * button. Defaults to 'normal'.
     */
    density?: Density

    /**
     * A ref to the element that should be used as the anchor for the overflow menu.
     */
    anchorRef?: RefObject<HTMLElement>
  }

export const ActionBar = ({
  actions = [],
  staticMenuActions,
  overflowMenuToggleProps,
  children,
  sx,
  label,
  variant,
  outerContainerSx,
  density = defaultDensity,
  anchorRef,
  className,
  style,
}: ActionBarProps) => {
  const contentProviderValue = useMemo<ActionBarContentContextProps>(
    () => ({actions, staticMenuActions, variant, label}),
    [actions, staticMenuActions, variant, label],
  )
  const resizeProviderValue = useMemo<ActionBarResizeProviderValueProps>(
    () => ({actionKeys: actions.map(action => action.key), gap: gapFromDensity(density)}),
    [actions, density],
  )

  const hasStaticMenuActions = staticMenuActions && staticMenuActions.length > 0
  const hasActions = actions && actions.length > 0

  if (!hasActions && !hasStaticMenuActions) return null

  return (
    <ActionBarRefProvider value={{anchorRef}}>
      <ActionBarResizeProvider value={resizeProviderValue}>
        <ActionBarContentProvider value={contentProviderValue}>
          <VisibleAndOverflowContainer
            outerContainerSx={outerContainerSx}
            overflowMenuToggleProps={overflowMenuToggleProps}
            sx={sx}
            className={className}
            style={style}
          >
            {children}
          </VisibleAndOverflowContainer>
        </ActionBarContentProvider>
      </ActionBarResizeProvider>
    </ActionBarRefProvider>
  )
}
