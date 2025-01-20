import type {ConsentExperienceProps} from '../ConsentExperience'

export function getConsentExperienceProps(): ConsentExperienceProps {
  return {
    fieldName: 'marketingConsent',
    countryFieldSelector: '.js-country-select',
    privacyStatementHref: 'https://docs.github.com/site-policy/privacy-policies/github-privacy-statement',
    emailSubscriptionSettingsLinkHref: '/settings/emails/link/new',
    exampleFields: ['first name', 'last name', 'email'],
  }
}
