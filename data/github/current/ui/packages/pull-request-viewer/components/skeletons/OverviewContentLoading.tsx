import {Box, PageLayout, SplitPageLayout} from '@primer/react'

import SkeletonMetadataPanel from './SkeletonMetadataPanel'
import {SkeletonPullRequestDescription} from './SkeletonPullRequestDescription'
import {SkeletonPullRequestSummarySecondaryContent} from './SkeletonPullRequestSummarySecondaryContent'

export function OverviewContentLoading() {
  return (
    <SplitPageLayout.Content as="div" padding="none" width="full">
      <PageLayout columnGap="none" containerWidth="xlarge" padding="none">
        <PageLayout.Content as="div" padding="none" sx={{p: [2, 3, 4], pr: [2, 3, 0]}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <SkeletonPullRequestDescription />
            <SkeletonPullRequestSummarySecondaryContent />
          </Box>
        </PageLayout.Content>
        <PageLayout.Pane padding="normal" position="end" width="large">
          <SkeletonMetadataPanel />
        </PageLayout.Pane>
      </PageLayout>
    </SplitPageLayout.Content>
  )
}
