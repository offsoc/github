import {Link} from '@primer/react'
import {Banner} from '@primer/react/experimental'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'

import {repositoryPath} from '@github-ui/paths'
import type {HeaderPageData} from '../../page-data/payloads/header'

export function PullRequestPausedDependabotBanner({repository}: Pick<HeaderPageData, 'repository'>) {
  const titleString = 'Dependabot updates are paused'
  const paragraphString = `We noticed you haven't used Dependabot in a while, so we've paused automated Dependabot
  updates for this repository.`
  const afterBreakString = 'To resume updates, merge a Dependabot pull request or use '
  const boldString = '@dependabot rebase.'
  const helpUrl = `${
    useAppPayload<{helpUrl: string}>().helpUrl
  }/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates#about-automatic-deactivation-of-dependabot-updates`
  const repoPullsUrl = `${repositoryPath({
    owner: repository.ownerLogin,
    repo: repository.name,
    action: 'pulls',
  })}/app%2Fdependabot`

  return (
    <Banner className="d-flex flex-row width-full" variant="warning" title={titleString}>
      <Banner.Description>
        <p>
          {paragraphString}
          <br />
          {afterBreakString} <b>{boldString}</b>.{'\u00A0'}
          <Link inline href={repoPullsUrl}>
            See open Dependabot pull requests
          </Link>{' '}
          or
          {'\u00A0'}
          <Link inline href={helpUrl}>
            learn more about pausing of activity.
          </Link>
        </p>
      </Banner.Description>
    </Banner>
  )
}
