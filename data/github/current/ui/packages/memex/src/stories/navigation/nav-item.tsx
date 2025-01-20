import {ActionList, ActionMenu} from '@primer/react'

import {getStoryFullPathname, getStoryId, type StoryDefinition} from '../story-definitions'
import {navItemOverlaySx} from './styles'

export const NavItem = ({
  storyGroup,
  stories,
  activeStoryId,
}: {
  storyGroup: string
  stories: Array<StoryDefinition>
  activeStoryId?: string
}) => {
  return (
    <ActionMenu>
      <ActionMenu.Button>{storyGroup}</ActionMenu.Button>
      <ActionMenu.Overlay anchorSide="outside-bottom" sx={navItemOverlaySx}>
        <ActionList>
          {stories.map(story => {
            const pathname = getStoryFullPathname(story)
            const storyId = getStoryId(story)
            const isActiveStory = storyId === activeStoryId
            return (
              <ActionList.LinkItem active={isActiveStory} key={pathname} href={pathname}>
                {story.name}
              </ActionList.LinkItem>
            )
          })}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
