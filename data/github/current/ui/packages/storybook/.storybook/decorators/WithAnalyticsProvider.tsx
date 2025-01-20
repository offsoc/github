import {AnalyticsProvider} from "@github-ui/analytics-provider"
import type {StoryContext} from './types'

const metadata = {}

export const withAnalyticsProvider = (
  Story: React.FC<React.PropsWithChildren<StoryContext>>,
  context: StoryContext
) => {
  return (
    <AnalyticsProvider appName="storybook-app" category="" metadata={metadata}>
      {Story(context)}
    </AnalyticsProvider>
  )
}
