import type {FC} from 'react'
import {Button, Link} from '@primer/react'
import type {RegisteredComponentChildren} from '../types'

export const BranchProtectionDeprecationHeader: FC<RegisteredComponentChildren> = ({helpUrl, rulesetsPath}) => {
  return (
    <div className="d-flex flex-sm-column flex-md-column flex-lg-column flex-xl-row">
      <div className="mr-xl-2">
        Take advantage of new features such as signed commits, requiring status checks, requiring linear history, and
        more!{' '}
        <Link
          href={`${helpUrl}/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`}
          inline={true}
        >
          Learn more
        </Link>{' '}
      </div>
      <div className="d-flex mt-sm-2 mt-md-2 mt-lg-2 mt-xl-n1 ml-sm-n2 ml-md-n2 ml-lg-n2">
        <Button variant="invisible" size="small" as="a" href={rulesetsPath}>
          Go to rulesets
        </Button>
      </div>
    </div>
  )
}
