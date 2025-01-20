import type {SponsorsDashboardYourSponsorsProps} from '../SponsorsDashboardYourSponsors'

export function getSponsorsDashboardYourSponsorsProps(): SponsorsDashboardYourSponsorsProps {
  return {
    tiers: {
      '1': {
        id: '1',
        selected: false,
        name: '$1 a month',
        monthlyPriceInCents: 100,
        frequency: 'recurring',
        state: 'published',
        subscriptionCount: 1,
        href: '/sponsors/your_sponsors/?tier_id=1',
      },
      '2': {
        id: '2',
        selected: false,
        name: '$2 one time',
        monthlyPriceInCents: 200,
        frequency: 'one_time',
        state: 'custom',
        subscriptionCount: 2,
        href: '/sponsors/your_sponsors/?tier_id=2',
      },
      '3': {
        id: '3',
        selected: false,
        name: '$3 a month',
        monthlyPriceInCents: 300,
        frequency: 'recurring',
        state: 'retired',
        subscriptionCount: 1,
        href: '/sponsors/your_sponsors/?tier_id=3',
      },
    },
    defaultPath: '/sponsors/your_sponsors',
  }
}
