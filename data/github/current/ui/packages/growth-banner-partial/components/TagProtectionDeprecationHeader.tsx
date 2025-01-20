import type {FC} from 'react'
import {Link} from '@primer/react'
import type {RegisteredComponentChildren} from '../types'

export const TagProtectionDeprecationHeader: FC<RegisteredComponentChildren> = () => {
  return (
    <>
      Protected tags are being deprecated. To continue protecting tags, please migrate to a tag ruleset by August 30th.
      You can learn more about the sunset in our{' '}
      <Link href="https://gh.io/tag-protection-sunset" inline={true}>
        changelog
      </Link>{' '}
      and can get started now by migrating to rulesets.
    </>
  )
}
