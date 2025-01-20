import {Banner} from '@primer/react/experimental'
import {BranchName} from '@primer/react'

import type {HeaderPageData} from '../../page-data/payloads/header'

export function PullRequestHiddenCharactersBanner({pullRequest}: Pick<HeaderPageData, 'pullRequest'>) {
  const escapeUnicodeChars = (string: string) => {
    return string.replace(/[\u007F-\uFFFF]/g, chr => {
      return `\\u${`0000${chr.charCodeAt(0).toString(16)}`.substr(-4)}`
    })
  }

  return (
    <Banner
      aria-label="Hidden Characters Warning Banner"
      className="d-flex flex-row width-full"
      variant="warning"
      title="Hidden character warning"
      hideTitle
    >
      <Banner.Description>
        The head ref may contain hidden characters:{' '}
        <BranchName as="span">&quot;{escapeUnicodeChars(pullRequest.headBranch)}&quot;</BranchName>
      </Banner.Description>
    </Banner>
  )
}
