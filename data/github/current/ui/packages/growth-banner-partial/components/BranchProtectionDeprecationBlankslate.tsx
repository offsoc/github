import type {FC} from 'react'
import {Button, Link} from '@primer/react'
import type {RegisteredComponentChildren} from '../types'

export const BranchProtectionDeprecationBlankslate: FC<RegisteredComponentChildren> = ({
  helpUrl,
  newBranchRulesetPath,
  newClassicBranchProtectionPath,
}) => {
  return (
    <>
      <p>
        Define branch rules to disable force pushing, prevent branches from being deleted, or require pull requests
        before merging. Learn more about{' '}
        <Link
          href={`${helpUrl}/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`}
          inline={true}
        >
          repository rules
        </Link>{' '}
        and{' '}
        <Link
          href={`${helpUrl}/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches`}
          inline={true}
        >
          protected branches
        </Link>
        .
      </p>
      <div className="d-flex flex-sm-column flex-md-row flex-lg-row flex-xl-row">
        <div className="d-flex">
          <Button as={Link} href={newBranchRulesetPath}>
            Add branch ruleset
          </Button>
        </div>
        <div className="d-flex ml-sm-n2 ml-md-2 ml-lg-2 ml-xl-2">
          <Button variant="invisible" as={Link} href={newClassicBranchProtectionPath}>
            Add classic branch protection rule
          </Button>
        </div>
      </div>
    </>
  )
}
