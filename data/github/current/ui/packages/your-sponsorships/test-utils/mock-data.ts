import type {YourSponsorshipsProps} from '../YourSponsorships'

export function getYourSponsorshipsProps(): YourSponsorshipsProps {
  return {
    sponsorLogin: 'sponsoring-org',
    viewerPrimaryEmail: 'test@test.com',
    viewerCanManageSponsorships: true,
    viewerIsOrgMember: true,
    sponsorships: [
      {
        id: '123',
        sponsorableLogin: 'sponsorable',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 24, 2024',
        active: true,
        amount: '$5 a month',
        privacyLevel: 'public',
        subscribableId: 1,
        patreonLink: undefined,
        subscribedToNewsletterUpdates: false,
      },
    ],
  }
}

export function getYourSponsorshipsPropsMultipleSponsorships(): YourSponsorshipsProps {
  return {
    sponsorLogin: 'sponsoring-org',
    viewerPrimaryEmail: 'test@test.com',
    viewerCanManageSponsorships: true,
    viewerIsOrgMember: true,
    sponsorships: [
      {
        id: '2',
        sponsorableLogin: 'sponsorable1',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 24, 2024',
        active: true,
        amount: '$5 a month',
        privacyLevel: 'public',
        subscribableId: 1,
      },
      {
        id: '3',
        sponsorableLogin: 'sponsorable2',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 24, 2024',
        active: true,
        amount: '$5 a month',
        privacyLevel: 'public',
        subscribableId: 2,
      },
      {
        id: '4',
        sponsorableLogin: 'sponsorable3',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 24, 2024',
        active: true,
        amount: '$5 a month',
        privacyLevel: 'public',
        subscribableId: 3,
      },
      {
        id: '5',
        sponsorableLogin: 'sponsorable4',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 24, 2024',
        active: false,
        amount: '$5 a month',
        privacyLevel: 'public',
        subscribableId: 14,
      },
    ],
  }
}

export function getYourSponsorshipsPropsNoActive(): YourSponsorshipsProps {
  return {
    sponsorLogin: 'sponsoring-org',
    viewerPrimaryEmail: 'test@test.com',
    viewerCanManageSponsorships: true,
    viewerIsOrgMember: true,
    sponsorships: [
      {
        id: '123',
        sponsorableLogin: 'sponsorable',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 24, 2024',
        active: false,
        amount: '$5 a month',
        privacyLevel: 'public',
        subscribableId: 1,
      },
    ],
  }
}

export function getYourSponsorshipsPropsPagination(pageSize: number): YourSponsorshipsProps {
  return {
    sponsorLogin: 'sponsor',
    viewerPrimaryEmail: 'test@test.com',
    viewerCanManageSponsorships: true,
    viewerIsOrgMember: true,
    pageSize,
    sponsorships: [
      {
        id: '1',
        sponsorableLogin: 'sponsorable1',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 21, 2024',
        active: true,
        amount: '$3 a month',
        privacyLevel: 'public',
        subscribableId: 1,
      },
      {
        id: '2',
        sponsorableLogin: 'sponsorable2',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 23, 2024',
        active: true,
        amount: '$5 a month',
        privacyLevel: 'public',
        subscribableId: 2,
      },
      {
        id: '2',
        sponsorableLogin: 'sponsorable3',
        sponsorableIsOrg: true,
        sponsorableAvatarUrl: 'https://img.test/avatar',
        startDate: 'May 25, 2024',
        active: false,
        amount: '$7 a month',
        privacyLevel: 'public',
        subscribableId: 3,
      },
    ],
  }
}
