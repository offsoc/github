import {DiscountTarget} from '../enums'

export const MOCK_DISCOUNTS = [
  {
    isFullyApplied: false,
    currentAmount: 50.0,
    targetAmount: 0.0,
    percentage: 10.0,
    uuid: '87040e3f-eed0-4c15-abe3-f595150d51db',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Enterprise,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 25.0,
    targetAmount: 0.0,
    percentage: 5.0,
    uuid: '87040e3f-eed0-4c15-abe3-f595150d51db',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Enterprise,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 80.0,
    targetAmount: 90.0,
    percentage: 0.0,
    uuid: '87040e3f-eed0-4c15-abe3-f595150d51db',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Enterprise,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 200.0,
    targetAmount: 400.0,
    percentage: 0.0,
    uuid: '85679075-fe74-461e-9c22-808ac1393944',
    targets: [
      {
        id: 'actions_linux',
        type: DiscountTarget.SKU,
      },
      {
        id: 'actions_macos',
        type: DiscountTarget.SKU,
      },
      {
        id: 'actions_windows',
        type: DiscountTarget.SKU,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 10.0,
    targetAmount: 12.5,
    percentage: 0.0,
    uuid: '1596aea4-44d4-4939-98ba-4ea3bb4749cb',
    targets: [
      {
        id: 'actions_storage',
        type: DiscountTarget.SKU,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 20.0,
    targetAmount: 542.5,
    percentage: 0.0,
    uuid: '80688497-f2d5-4969-8550-c6265f7ef0b4',
    targets: [{id: 'git_lfs_storage', type: DiscountTarget.SKU}],
  },
  {
    isFullyApplied: false,
    currentAmount: 10.0,
    targetAmount: 678.125,
    percentage: 0.0,
    uuid: 'dd97934f-1d5c-48c6-b821-22f98da6acfd',
    targets: [{id: 'git_lfs_bandwidth', type: DiscountTarget.SKU}],
  },
  {
    isFullyApplied: false,
    currentAmount: 5.0,
    targetAmount: 100.5,
    percentage: 0.0,
    uuid: '21f7eab8-8d6a-4485-956e-eed43930312b',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Repository,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 15.0,
    targetAmount: 50.0,
    percentage: 0.0,
    uuid: '21f7eab8-8d6a-4485-956e-eed43930312b',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Organization,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 1.0,
    targetAmount: 0,
    percentage: 15.0,
    uuid: '21f7eab8-8d6a-4485-956e-eed43930312b',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Repository,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 10.0,
    targetAmount: 0,
    percentage: 20.0,
    uuid: '21f7eab8-8d6a-4485-956e-eed43930312b',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Organization,
      },
    ],
  },
]

export const MOCK_DISCOUNTS_WITH_FREE_PUBLIC_REPO = [
  {
    isFullyApplied: false,
    currentAmount: 50.0,
    targetAmount: 100.0,
    percentage: 0.0,
    uuid: '87040e3f-eed0-4c15-abe3-f595150d51db',
    targets: [
      {
        id: '1',
        type: DiscountTarget.Enterprise,
      },
    ],
  },
  {
    isFullyApplied: false,
    currentAmount: 10.0,
    targetAmount: 0.0,
    percentage: 100.0,
    uuid: '9cdf0dca-1b19-11ee-be56-0242ac120002',
    targets: [],
  },
]
