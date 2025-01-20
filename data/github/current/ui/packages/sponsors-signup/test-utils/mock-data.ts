import type {SponsorsSignupProps} from '../SponsorsSignup'

function baseProps() {
  return {
    formData: {
      formAction: '/waitlist',
      countries: {US: {countryCode: 'US', name: 'United States', stripeSupported: true}},
      fiscalHosts: {osc: {name: 'Open Source Collective', sponsorsListingId: 1}},
    },
    docsLinks: {
      about: 'docs.github.com/sponsors',
      fiscalHosts: 'docs.github.com/fiscal-hosts',
    },
  }
}

export function getUserCreateProps(): SponsorsSignupProps {
  return {
    ...baseProps(),
    sponsorableData: {
      isUser: true,
      possibleContactEmails: {
        'user@user.com': {type: 'user', email: 'user@user.com', id: 1},
      },
      contactEmailUpdatePath: '/update-email',
    },
  }
}

export function getOrgCreateProps(): SponsorsSignupProps {
  return {
    ...baseProps(),
    sponsorableData: {
      isUser: false,
      possibleContactEmails: {
        'org@org.com': {type: 'billing', email: 'org@org.com'},
      },
      contactEmailUpdatePath: '/update-email',
    },
  }
}

export function getUserUpdateProps(): SponsorsSignupProps {
  return {
    ...baseProps(),
    sponsorableData: {
      isUser: true,
      possibleContactEmails: {
        'user@user.com': {type: 'user', email: 'user@user.com', id: 1},
      },
      contactEmailUpdatePath: '/update-email',
    },
    sponsorsListingData: {
      isWaitlisted: true,
      contactEmail: 'user@user.com',
      countryOfResidence: 'US',
      billingCountry: 'US',
      usesFiscalHost: false,
      signupStatusPartialPath: '/sponsors/some-user/signup-status',
    },
  }
}

export function getOrgUpdateProps(): SponsorsSignupProps {
  return {
    ...baseProps(),
    sponsorableData: {
      isUser: false,
      possibleContactEmails: {
        'org@org.com': {type: 'billing', email: 'org@org.com'},
      },
      contactEmailUpdatePath: '/update-email',
    },
    sponsorsListingData: {
      isWaitlisted: true,
      contactEmail: 'org@org.com',
      countryOfResidence: 'US',
      billingCountry: 'US',
      usesFiscalHost: false,
      signupStatusPartialPath: '/sponsors/some-org/signup-status',
    },
  }
}
