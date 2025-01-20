import {CommentDivider} from '@github-ui/commenting/CommentDivider'
import {CommentLoading} from '@github-ui/commenting/CommentLoading'

import {VALUES} from '../constants/values'
import styles from './issue-timeline-loading.module.css'

type IssueTimelineLoadingProps = {
  rowCount?: number
  delayedShow?: boolean
}

export const IssueTimelineLoading = ({
  rowCount = VALUES.rowLoadingSkeletonCount,
  delayedShow,
}: IssueTimelineLoadingProps) => {
  return (
    <div className={delayedShow ? styles.delaySkeletonLoad : ''}>
      <CommentDivider />
      {[...Array(rowCount)].map((_, index) => (
        <div key={index}>
          <CommentLoading />
          <CommentDivider />
        </div>
      ))}
    </div>
  )
}
