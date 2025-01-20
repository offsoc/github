import type {AccountFilterProps} from '../AccountFilter'
import type {DirectOnlyFilterProps} from '../DirectOnlyFilter'
import type {EcosystemsFilterProps} from '../EcosystemsFilter'
import type {OrderingFilterProps} from '../OrderingFilter'
import type {SponsorsExploreFilterProps} from '../SponsorsExploreFilter'

export function getSponsorsExploreFilterProps(): SponsorsExploreFilterProps {
  return {
    accounts: {
      monalisa: {avatarUrl: 'https://github.com/monalisa.png', isOrganization: false},
      github: {avatarUrl: 'https://github.com/github.png', isOrganization: true},
    },
    selectedAccount: 'monalisa',
    ecosystems: {
      FOO: {label: 'Foo'},
      BAR: {label: 'Bar'},
    },
    selectedEcosystems: ['FOO'],
    orderings: {
      MOST_USED: {label: 'Most used'},
      LEAST_USED: {label: 'Least used'},
    },
    selectedOrdering: 'MOST_USED',
    directDependenciesOnly: true,
  }
}

export function getEcosystemsFilterProps(): EcosystemsFilterProps {
  return {
    ecosystems: getSponsorsExploreFilterProps().ecosystems,
    ecosystemsFilter: getSponsorsExploreFilterProps().selectedEcosystems,
    setEcosystemsFilter: jest.fn(),
  }
}

export function getAccountFilterProps(): AccountFilterProps {
  return {
    accounts: getSponsorsExploreFilterProps().accounts,
    accountFilter: getSponsorsExploreFilterProps().selectedAccount,
    setAccountFilter: jest.fn(),
  }
}

export function getOrderingFilterProps(): OrderingFilterProps {
  return {
    orderings: getSponsorsExploreFilterProps().orderings,
    orderingFilter: getSponsorsExploreFilterProps().selectedOrdering,
    setOrderingFilter: jest.fn(),
  }
}

export function getDirectOnlyFilterProps(): DirectOnlyFilterProps {
  return {
    directOnlyFilter: getSponsorsExploreFilterProps().directDependenciesOnly,
    setDirectOnlyFilter: jest.fn(),
  }
}
