import type React from 'react'

import {LABELS} from '../constants/labels'
import {TEST_IDS} from '../constants/test-ids'
import {CommentHeaderBadge} from './CommentHeaderBadge'

type Props = {
  createdAt: string
  owner: string
  viewerDidAuthor?: boolean
}

export const SponsorsBadge: React.FC<Props> = ({createdAt, owner, viewerDidAuthor}: Props) => {
  const sponsorDate = new Date(createdAt)
  const sponsorMmonth = sponsorDate.toLocaleString('default', {month: 'long'})
  const label = LABELS.sponsor(owner, `${sponsorMmonth} ${sponsorDate.getFullYear()}`)

  return (
    <CommentHeaderBadge
      label={LABELS.sponsorBadge}
      ariaLabel={label}
      testId={TEST_IDS.sponsorLabel}
      viewerDidAuthor={viewerDidAuthor}
    />
  )
}
