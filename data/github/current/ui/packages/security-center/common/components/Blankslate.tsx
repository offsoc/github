import {SingleSignOnBanner} from '@github-ui/single-sign-on-banner'
import {useSso} from '@github-ui/use-sso'
import {SearchIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import {Blankslate as PrimerBlankslate} from '@primer/react/drafts'

import PageLayout from './page-layout'

export interface BlankslateProps {
  heading: string
  subheading?: string
  message: string
  description?: string
  learnMoreLink?: {text: string; url: string}
  feedbackLink: {text: string; url: string}
}

export function Blankslate({
  heading,
  subheading,
  message,
  description,
  learnMoreLink,
  feedbackLink,
}: BlankslateProps): JSX.Element {
  const {ssoOrgs} = useSso()
  const ssoOrgNames = ssoOrgs.map(o => o['login']).filter(n => n !== undefined)

  return (
    <PageLayout>
      {ssoOrgNames.length > 0 && (
        <PageLayout.Banners>
          <SingleSignOnBanner protectedOrgs={ssoOrgNames} />
        </PageLayout.Banners>
      )}

      <PageLayout.Header title={heading} description={subheading} feedbackLink={feedbackLink} />
      <PageLayout.Content>
        <Box sx={{borderWidth: 1, borderRadius: 2, borderStyle: 'solid', borderColor: 'border.default'}}>
          <PrimerBlankslate spacious>
            <PrimerBlankslate.Visual>
              <SearchIcon size="medium" />
            </PrimerBlankslate.Visual>
            <PrimerBlankslate.Heading as="h3">{message}</PrimerBlankslate.Heading>
            {description != null && <PrimerBlankslate.Description>{description}</PrimerBlankslate.Description>}
            {learnMoreLink != null && (
              <PrimerBlankslate.SecondaryAction href={learnMoreLink.url}>
                {learnMoreLink.text}
              </PrimerBlankslate.SecondaryAction>
            )}
          </PrimerBlankslate>
        </Box>
      </PageLayout.Content>
    </PageLayout>
  )
}
