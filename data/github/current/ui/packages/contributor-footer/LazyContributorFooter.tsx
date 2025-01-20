import {ContributorFooter} from './ContributorFooter'
import {graphql, useFragment} from 'react-relay'
import type {LazyContributorFooter$key} from './__generated__/LazyContributorFooter.graphql'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

type LazyContributorFooterProps = {
  repositoryKey?: LazyContributorFooter$key
  sx?: BetterSystemStyleObject
}

export function LazyContributorFooter({repositoryKey, sx}: LazyContributorFooterProps) {
  const data = useFragment(
    graphql`
      fragment LazyContributorFooter on Repository {
        codeOfConductFileUrl
        securityPolicyUrl
        contributingFileUrl
      }
    `,
    repositoryKey,
  )
  if (!data) {
    return <></>
  }

  const {codeOfConductFileUrl, securityPolicyUrl, contributingFileUrl} = data

  return (
    <ContributorFooter
      codeOfConductFileUrl={codeOfConductFileUrl ?? undefined}
      securityPolicyUrl={securityPolicyUrl ?? undefined}
      contributingFileUrl={contributingFileUrl ?? undefined}
      sx={{...sx}}
    />
  )
}
