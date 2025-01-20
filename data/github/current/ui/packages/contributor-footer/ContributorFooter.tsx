import {InfoIcon} from '@primer/octicons-react'
import {Box, Link, Octicon} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Fragment} from 'react'
import {isEnterprise} from '@github-ui/runtime-environment'

export type ContributorFooterProps = {
  contributingFileUrl?: string
  securityPolicyUrl?: string
  codeOfConductFileUrl?: string
  sx?: BetterSystemStyleObject
}

export function ContributorFooter({
  contributingFileUrl,
  securityPolicyUrl,
  codeOfConductFileUrl,
  sx,
}: ContributorFooterProps) {
  if (isEnterprise() || (!contributingFileUrl && !securityPolicyUrl && !codeOfConductFileUrl)) return null

  const Links = () => {
    const existingLinks = []

    if (contributingFileUrl) {
      existingLinks.push(
        <Link underline href={contributingFileUrl}>
          contributing guidelines
        </Link>,
      )
    }

    if (securityPolicyUrl) {
      existingLinks.push(
        <Link underline href={securityPolicyUrl}>
          security policy
        </Link>,
      )
    }

    if (codeOfConductFileUrl) {
      existingLinks.push(
        <Link underline href={codeOfConductFileUrl}>
          code of conduct
        </Link>,
      )
    }

    if (existingLinks.length === 1) return <>{existingLinks.pop()}</>

    const lastLink = existingLinks.pop()
    return (
      <>
        {existingLinks.map((link, i) => (
          <Fragment key={i}>
            {link}
            {i !== existingLinks.length - 1 ? ', ' : ' '}
          </Fragment>
        ))}
        and {lastLink}
      </>
    )
  }

  return (
    <Box
      data-testid="contributor-footer"
      sx={{display: 'flex', alignItems: 'flex-start', gap: 1, pt: 2, color: 'fg.muted', fontSize: 0, ...sx}}
    >
      <Octicon icon={InfoIcon} sx={{mt: '1px'}} />
      <span>
        Remember, contributions to this repository should follow its <Links />.
      </span>
    </Box>
  )
}
