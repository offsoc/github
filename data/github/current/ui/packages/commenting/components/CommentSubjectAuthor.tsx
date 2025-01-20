import type React from 'react'

import {LABELS} from '../constants/labels'
import {TEST_IDS} from '../constants/test-ids'
import {CommentHeaderBadge} from './CommentHeaderBadge'

type Props = {
  viewerDidAuthor?: boolean
  subjectType?: string
}

export const CommentSubjectAuthor: React.FC<Props> = ({viewerDidAuthor, subjectType}: Props) => {
  return (
    <CommentHeaderBadge
      viewerDidAuthor={viewerDidAuthor}
      ariaLabel={LABELS.commentSubjectAuthoer(viewerDidAuthor ?? false, subjectType ?? 'comment')}
      label={LABELS.commentAuthor}
      testId={TEST_IDS.commentSubjectAuthor}
    />
  )
}
