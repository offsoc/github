import type {Repository} from '@github-ui/current-repository'
import {Box, Flash} from '@primer/react'

import {isWeirichCommit} from '../../utils/weirich-commit'

export function WeirichCommitBanner({oid, repo}: {oid: string; repo: Repository}) {
  if (!isWeirichCommit(oid, repo.id)) {
    return null
  }

  return (
    <Flash className="mb-4">
      <Box
        as="img"
        src="/images/modules/commit/flowers@2x.png"
        alt="flower image"
        className="mr-4 mt-1 float-left"
        sx={{width: '88px', height: '49px'}}
      />
      <h2>Thanks for everything, Jim.</h2>
      <p>We will miss you.</p>
    </Flash>
  )
}
