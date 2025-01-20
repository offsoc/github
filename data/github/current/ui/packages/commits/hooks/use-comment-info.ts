import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import type {CommitPayload} from '../types/commit-types'

export function useCommentInfo() {
  const payload = useRoutePayload<CommitPayload>()
  return payload.commentInfo
}
