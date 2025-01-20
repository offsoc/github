import type {SponsorsNewslettersProps} from '../SponsorsNewsletters'

export function getSponsorsNewslettersProps(): SponsorsNewslettersProps {
  return {
    tiers: {
      '1': {
        id: '1',
        name: '$1 a month',
        monthlyPriceInCents: 100,
        frequency: 'recurring',
        state: 'published',
        subscriptionCount: 1,
      },
      '2': {
        id: '2',
        name: '$2 one time',
        monthlyPriceInCents: 200,
        frequency: 'one_time',
        state: 'custom',
        subscriptionCount: 2,
      },
      '3': {
        id: '3',
        name: '$3 a month',
        monthlyPriceInCents: 300,
        frequency: 'recurring',
        state: 'retired',
        subscriptionCount: 1,
      },
    },
  }
}
