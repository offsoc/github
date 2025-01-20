import type {OnboardingOrganizationsPayload} from '../routes/OnboardingOrganizations'

export function getOnboardingOrganizationsRoutePayload(): OnboardingOrganizationsPayload {
  return {
    business: {
      name: 'Test Enterprise',
      slug: 'test-enterprise',
      avatar_url: 'test-enterprise',
    },
  }
}
