import {MergeMethod} from '@github-ui/mergebox/types'
import type {MergeBoxPartialProps} from '../MergeBoxPartial'

export function getMergeBoxPartialProps(): MergeBoxPartialProps {
  return {
    defaultMergeMethod: MergeMethod.MERGE,
    pullRequestId: 'PR_kwAEAQ',
    basePageDataUrl: 'monalisa/pull/1',
    viewerLogin: 'monalisa',
    shouldReadFromJSONAPI: false,
  }
}
