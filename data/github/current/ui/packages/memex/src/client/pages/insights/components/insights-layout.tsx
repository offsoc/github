import {Box, PageLayout} from '@primer/react'
import {memo} from 'react'

import {InsightsSideNav} from './side-nav'

export const InsightsLayout = memo<{
  children?: React.ReactNode
}>(function InsightsLayout({children}) {
  return (
    <PageLayout containerWidth="full" sx={{height: '100%', padding: 0, m: 0, [`& > ${Box}`]: {minHeight: '100%'}}}>
      <PageLayout.Pane
        position="start"
        sx={{
          padding: [3, null, null, 4],
          borderRight: '1px solid',
          borderColor: 'border.subtle',
        }}
      >
        <InsightsSideNav />
      </PageLayout.Pane>
      <PageLayout.Content
        width="large"
        sx={{
          padding: [3, null, null, 4],
        }}
      >
        {children}
      </PageLayout.Content>
    </PageLayout>
  )
})
