import type {Meta} from '@storybook/react'
import MicrosoftAnalyticsEvent from './MicrosoftAnalyticsEvent'

export default {
  title: 'MicrosoftAnalyticsEvent',
  component: MicrosoftAnalyticsEvent,
} as Meta

export const MicrosoftAnalyticsEventExample = {
  render: () => (
    <>
      <p>Microsoft Analytics Event is not a visible component and appears in the DOM as:</p>
      <code>&lt;microsoft-analytics-event&gt;&lt;/microsoft-analytics-event&gt;</code>
      <MicrosoftAnalyticsEvent />
    </>
  ),
}
