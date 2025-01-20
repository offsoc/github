import {Box, PageLayout, SplitPageLayout} from '@primer/react'

import {SkeletonPullRequestActivity} from './SkeletonPullRequestActivity'

export function ActivityContentLoading() {
  return (
    <SplitPageLayout.Content as="div" padding="none" width="full">
      <PageLayout columnGap="none" containerWidth="xlarge" padding="none">
        <PageLayout.Content as="div">
          <Box sx={{pt: 4}}>
            <SkeletonPullRequestActivity />
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </SplitPageLayout.Content>
  )
}
