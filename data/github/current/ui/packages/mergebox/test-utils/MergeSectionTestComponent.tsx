import type {createMockEnvironment} from 'relay-test-utils'

import {MergeMethodContextProvider} from '../contexts/MergeMethodContext'
import PullRequestsAppWrapper from './PullRequestsAppWrapper'
import {MergeSection, type MergeSectionProps} from '../components/sections/merge-section/MergeSection'
import {MergeMethod} from '../types'
import {useState} from 'react'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import {BASE_PAGE_DATA_URL} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {QueryClientProvider} from '@tanstack/react-query'

type MergeSectionTestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  defaultMergeMethod?: MergeMethod
} & MergeSectionProps

export function MergeSectionTestComponent({
  environment,
  defaultMergeMethod = MergeMethod.MERGE,
  ...props
}: MergeSectionTestComponentProps) {
  const pullRequestId = props.id

  const MergeBoxWithRelay = () => {
    const [shouldFocusPrimaryButton, setShouldFocusPrimaryButton] = useState(false)

    return (
      <MergeSection
        {...props}
        shouldFocusPrimaryMergeButton={shouldFocusPrimaryButton}
        setShouldFocusPrimaryMergeButton={setShouldFocusPrimaryButton}
        refetchMergeBoxQuery={() => {}}
      />
    )
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <QueryClientProvider client={queryClient}>
        <PageDataContextProvider basePageDataUrl={BASE_PAGE_DATA_URL}>
          <MergeMethodContextProvider defaultMergeMethod={defaultMergeMethod}>
            <MergeBoxWithRelay />
          </MergeMethodContextProvider>
        </PageDataContextProvider>
      </QueryClientProvider>
    </PullRequestsAppWrapper>
  )
}
