import {ListView} from '@github-ui/list-view'
import {Box, Heading} from '@primer/react'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'

export interface RunnerListProps {
  heading?: string
  numberOfRunners: number
  children: React.ReactNode
}

/**
 * See ListView stories for a representation of this component.
 * ui/packages/list-view/src/stories/ActionRunners.stories.tsx
 * https://ui.githubapp.com/storybook/?path=/story/recipes-list-view-dotcom-pages--action-runners
 */
export function RunnerList({heading, numberOfRunners, children, ...props}: RunnerListProps) {
  const title = `${numberOfRunners} available runner${numberOfRunners === 1 ? '' : 's'}`

  return (
    <div>
      {heading && (
        <Heading sx={{fontSize: 2, marginBottom: 1}} as="h2">
          {heading}
        </Heading>
      )}
      <Box sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}} {...props}>
        <ListView metadata={<ListViewMetadata title={title} />} title={title} titleHeaderTag="h3">
          {children}
        </ListView>
      </Box>
    </div>
  )
}
