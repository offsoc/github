import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {type AvatarProps, Box, type BoxProps, CounterLabel} from '@primer/react'
import type {BetterCssProperties, BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef} from 'react'
import {keyframes} from 'styled-components'

import type {UserPresence} from '../api/alive/contracts'

export function itemFromPresence(presence: UserPresence & {avatarUrl: string}): MemexAvatarStackItem {
  return {
    ...presence,
    id: presence.userId,
    hovercardUrl: `/hovercards?user_id=${presence.userId}`,
  }
}

export type MemexAvatarStackItem = {
  id: number
  avatarUrl: string
  hovercardUrl: string
  isIdle?: boolean
}

/**
 * Type alias to represent fields that need to be populated by the caller
 * of the component.
 */
type BackgroundStyles = Pick<BetterCssProperties, 'backgroundColor' | 'boxShadow'>

type MemexAvatarStackProps = {
  items: ReadonlyArray<MemexAvatarStackItem>
  size?: number
  /**
   * Required styles to apply to container. These are dependent on the current
   * theme, and only the values needed to customize the component are specified
   * here.
   */
  backgroundSx: BackgroundStyles
  maxVisible?: number
}

const fadeInKeyFrames = keyframes`
  from {
    opacity: 0
  }
  to {
    opacity: 1
  }`

const MemexAvatarStackWrapper = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const {sx, ...other} = props

  const mergedSx: BetterSystemStyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'flex-end',
    zIndex: '0',
    animationName: fadeInKeyFrames.getName(),
    overflow: 'visible',
    verticalAlign: 'text-bottom',
    ...sx,
  }

  return <Box ref={ref} sx={mergedSx} {...other} />
})

MemexAvatarStackWrapper.displayName = 'MemexAvatarStackWrapper'

const StyledAvatarBox = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const {sx, ...other} = props

  const mergedSx: BetterSystemStyleObject = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '100%',
    flexShrink: 0,
    marginLeft: 0,
    marginRight: theme => `-${theme.space[1]}`,
    animation: 'fadeIn 0.5s ease-in-out',
    ...sx,
  }

  return <Box ref={ref} sx={mergedSx} {...other} />
})

StyledAvatarBox.displayName = 'StyledAvatarBox'

const StyledAvatar = forwardRef<HTMLImageElement, AvatarProps>((props, ref) => {
  const {sx, ...other} = props
  const mergedSx = {
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.5s ease-in-out',
    ...sx,
  }

  return <GitHubAvatar ref={ref} sx={mergedSx} {...other} />
})

StyledAvatar.displayName = 'StyledAvatar'

const StyledCounter = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const {sx, ...other} = props

  const mergedSx: BetterSystemStyleObject = {
    backgroundColor: 'canvas.subtle',
    display: `flex`,
    alignItems: `center`,
    borderRadius: `20px`,
    marginLeft: theme => `-${theme.space[1]}`,
    animation: 'fadeIn 0.5s ease-in-out',
    ...sx,
  }

  return <Box ref={ref} sx={mergedSx} {...other} />
})

StyledCounter.displayName = 'StyledCounter'

const MemexAvatarStack = ({items, backgroundSx, size = 24, maxVisible = 5}: MemexAvatarStackProps) => {
  const count = items.length

  const {backgroundColor, boxShadow} = backgroundSx

  const overflowCount = count - maxVisible

  return (
    <MemexAvatarStackWrapper {...testIdProps('memex-avatar-stack')}>
      <Box sx={{display: 'flex', mr: 1}}>
        {
          // NOTE: this is using an older hovercards endpoint that accepts a userId.  Once we start fetching users by id, we can use "/users/:username/hovercard"
        }
        {items.slice(0, maxVisible).map((user, index) => {
          return (
            <StyledAvatarBox
              {...testIdProps('memex-avatar-stack-item')}
              key={user.id}
              sx={{
                backgroundColor,
                boxShadow,
                zIndex: index,
              }}
            >
              <StyledAvatar
                {...testIdProps(`memex-avatar-state-${user.isIdle ? 'idle' : 'active'}`)}
                sx={{opacity: user.isIdle ? 0.3 : 1}}
                size={size}
                src={user.avatarUrl}
                data-hovercard-url={user.hovercardUrl}
              />
            </StyledAvatarBox>
          )
        })}
      </Box>
      {count > maxVisible ? (
        <Box
          sx={{position: 'relative', zIndex: maxVisible, display: 'flex', alignItems: 'center'}}
          {...testIdProps('memex-avatar-stack-overflow')}
        >
          <StyledCounter sx={{boxShadow}}>
            <CounterLabel
              sx={{
                height: size + 1,
                width: size + 1,
                fontSize: size < 24 ? '9px' : 0,
                p: 0,
                color: 'fg.muted',
                lineHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                overflow: 'hidden',
              }}
            >
              +{overflowCount > 99 ? '∞' : overflowCount}
            </CounterLabel>
          </StyledCounter>
        </Box>
      ) : null}
    </MemexAvatarStackWrapper>
  )
}

export default MemexAvatarStack
