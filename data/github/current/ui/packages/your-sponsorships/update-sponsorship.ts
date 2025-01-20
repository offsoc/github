import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {SponsorshipData} from './your-sponsorships-types'
import {EmailOptInValues} from './your-sponsorships-types'

export interface SponsorshipUpdate {
  sponsorableLogin: string
  privacyLevel: string
  subscribedToNewsletterUpdates?: boolean
}

interface SponsorshipUpdateBody {
  sponsor: string
  privacy_level: string
  email_opt_in?: EmailOptInValues
}

interface UpdateSponsorship {
  sponsorLogin: string
  sponsorshipUpdate: SponsorshipUpdate
  sponsorships: SponsorshipData[]
  setSponsorships: (sponsorships: SponsorshipData[]) => void
  setFlash: (flash: {variant: 'success' | 'danger'; message: string}) => void
}

export const updateSponsorship = async ({
  sponsorLogin,
  sponsorshipUpdate,
  sponsorships,
  setSponsorships,
  setFlash,
}: UpdateSponsorship) => {
  let body: SponsorshipUpdateBody
  if (sponsorshipUpdate.subscribedToNewsletterUpdates === undefined) {
    body = {
      sponsor: sponsorLogin,
      privacy_level: sponsorshipUpdate.privacyLevel,
    }
  } else {
    body = {
      sponsor: sponsorLogin,
      privacy_level: sponsorshipUpdate.privacyLevel,
      email_opt_in: sponsorshipUpdate.subscribedToNewsletterUpdates
        ? EmailOptInValues.OPT_IN
        : EmailOptInValues.OPT_OUT,
    }
  }

  const res = await verifiedFetchJSON(`/sponsors/${sponsorshipUpdate.sponsorableLogin}/sponsorships`, {
    method: 'PUT',
    body,
  })

  if (res.ok) {
    const updatedSponsorships = sponsorships.map(sponsorship =>
      sponsorship.sponsorableLogin === sponsorshipUpdate.sponsorableLogin
        ? {
            ...sponsorship,
            ...{
              privacyLevel: sponsorshipUpdate.privacyLevel,
              subscribedToNewsletterUpdates: sponsorshipUpdate.subscribedToNewsletterUpdates,
            },
          }
        : sponsorship,
    )
    setSponsorships(updatedSponsorships)
    setFlash({variant: 'success', message: `Sponsorship to @${sponsorshipUpdate.sponsorableLogin} updated`})
  } else {
    setFlash({variant: 'danger', message: 'There was a problem updating your sponsorship'})
  }
}
