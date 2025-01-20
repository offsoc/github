import type {Props as MeteredEnterpriseServerLicensesProps} from '../MeteredEnterpriseServerLicenses'

export function getEmptyMeteredEnterpriseServerLicensesProps(): MeteredEnterpriseServerLicensesProps {
  return {
    business: {slug: 'github-inc'},
    serverLicenses: [],
    consumedEnterpriseLicenses: 0,
  }
}

export function getMeteredEnterpriseServerLicensesProps(): MeteredEnterpriseServerLicensesProps {
  return {
    business: {slug: 'github-inc'},
    serverLicenses: [
      {
        reference_number: 'abc123',
        seats: 50,
        expires_at: '2030-01-01',
      },
    ],
    consumedEnterpriseLicenses: 50,
  }
}
