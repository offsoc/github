import {useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {Heading, Link, Spinner, Text} from '@primer/react'
import type {DocsLinks, FormData, SponsorableData, SponsorsListingData} from './SignupForm'
import {SignupForm} from './SignupForm'

export interface SponsorsSignupProps {
  formData: FormData
  sponsorableData: SponsorableData
  sponsorsListingData?: SponsorsListingData
  docsLinks: DocsLinks
}

export function SponsorsSignup({formData, sponsorableData, sponsorsListingData, docsLinks}: SponsorsSignupProps) {
  const [sponsorsListingDataState, setSponsorsListingDataState] = useState<SponsorsListingData | undefined>(
    sponsorsListingData,
  )

  return (
    <div className="container-sm p-responsive mt-7">
      <div className="d-flex flex-column flex-items-center mb-3">
        <Heading as="h1" sx={{mb: 3}}>
          Get Sponsored
        </Heading>
        <Text sx={{color: 'fg.muted'}}>
          Launch a{' '}
          <Link href={docsLinks.about} inline={true} {...testIdProps('sponsors-help-docs')}>
            GitHub Sponsors profile
          </Link>{' '}
          and start receiving funding.
        </Text>
      </div>
      {sponsorsListingDataState === undefined || sponsorsListingDataState?.isWaitlisted ? (
        <SignupForm
          formData={formData}
          sponsorableData={sponsorableData}
          sponsorsListingData={sponsorsListingDataState}
          docsLinks={docsLinks}
          setSponsorsListingData={setSponsorsListingDataState}
        />
      ) : (
        <include-fragment src={sponsorsListingDataState.signupStatusPartialPath}>
          <div className="d-flex flex-column flex-items-center">
            <Spinner size="medium" aria-label="Loading sign-up status" />
          </div>
        </include-fragment>
      )}
    </div>
  )
}
