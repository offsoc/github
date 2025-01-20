import {useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {UserContactEmail, type ContactEmails} from './UserContactEmail'
import {PayoutDestination} from './PayoutDestination'
import type {Countries} from './BankPayout'
import type {FiscalHosts} from './FiscalHostPayout'
import {UserResidenceCountry} from './UserResidenceCountry'
import {OrgContactEmail} from './OrgContactEmail'
import {BillingCountry} from './BillingCountry'
import {Button, Flash} from '@primer/react'
import type {FormEvent} from 'react'

export interface SignupFormProps {
  formData: FormData
  sponsorableData: SponsorableData
  sponsorsListingData?: SponsorsListingData
  docsLinks: DocsLinks
  setSponsorsListingData: (data: SponsorsListingData) => void
}

export interface FormData {
  formAction: string
  countries: Countries
  fiscalHosts: FiscalHosts
}

export interface SponsorableData {
  isUser: boolean
  possibleContactEmails: ContactEmails
  contactEmailUpdatePath: string
}

export interface SponsorsListingData {
  isWaitlisted: boolean
  contactEmail: string
  countryOfResidence: string
  billingCountry: string
  usesFiscalHost: boolean
  signupStatusPartialPath: string
}

export interface DocsLinks {
  about: string
  fiscalHosts: string
}

export function SignupForm({
  formData,
  sponsorableData,
  sponsorsListingData,
  docsLinks,
  setSponsorsListingData,
}: SignupFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const isUpdate = !!sponsorsListingData

  const submitForm = async (event: FormEvent) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const method = isUpdate ? 'PUT' : 'POST'
    const body = new FormData(form)
    const result = await verifiedFetch(formData.formAction, {method, body})
    const resultText = await result.text()
    const resultJSON = JSON.parse(resultText)
    if (result.ok) {
      const listingData = resultJSON.sponsorsListingData
      setSponsorsListingData(listingData)
      setError(null)
      setSuccess('Your information has been saved.')
    } else {
      setSuccess(null)
      setError(resultJSON.error)
    }
  }

  return (
    <form
      method="post"
      action={formData.formAction}
      onSubmit={submitForm}
      data-turbo="false"
      {...testIdProps('sponsors-signup-form')}
    >
      {error && (
        <Flash variant="danger" role="alert" sx={{mb: 3}}>
          {error}
        </Flash>
      )}
      {success && (
        <Flash variant="success" role="alert" sx={{mb: 3}}>
          {success}
        </Flash>
      )}
      {sponsorableData.isUser ? (
        <>
          <UserContactEmail
            possibleContactEmails={sponsorableData.possibleContactEmails}
            contactEmailUpdatePath={sponsorableData.contactEmailUpdatePath}
            currentContactEmail={sponsorsListingData?.contactEmail}
          />
          <UserResidenceCountry
            countries={formData.countries}
            currentCountryOfResidence={sponsorsListingData?.countryOfResidence}
          />
        </>
      ) : (
        <OrgContactEmail
          possibleContactEmails={sponsorableData.possibleContactEmails}
          contactEmailUpdatePath={sponsorableData.contactEmailUpdatePath}
        />
      )}
      {isUpdate && !sponsorsListingData?.usesFiscalHost ? (
        <BillingCountry countries={formData.countries} currentBillingCountry={sponsorsListingData.billingCountry} />
      ) : (
        <PayoutDestination
          countries={formData.countries}
          fiscalHosts={formData.fiscalHosts}
          fiscalHostDocsURL={docsLinks.fiscalHosts}
          currentBillingCountry={sponsorsListingData?.billingCountry}
        />
      )}
      <Button type="submit" variant={isUpdate ? 'default' : 'primary'} sx={{mt: 4}}>
        {isUpdate ? 'Update' : 'Submit'}
      </Button>
    </form>
  )
}
