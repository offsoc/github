import {formatQuantityDisplay} from '../../utils/usage'

import type {ProductUsageLineItem, RepoUsageLineItem} from '../../types/usage'

describe('formatQuantityDisplay', () => {
  it('returns quantity for early customers', () => {
    const lineItem: ProductUsageLineItem = {
      ...copilotLineItem,
      fullQuantity: 0, // early customers have no full quantity
      quantity: 5,
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('5 Seats')
  })

  it('returns quantity for non subscription products', () => {
    const lineItem: ProductUsageLineItem = {
      appliedCostPerQuantity: 0.259,
      billedAmount: 2.59,
      product: 'actions',
      quantity: 10,
      fullQuantity: 20,
      sku: 'macos_16_core',
      friendlySkuName: 'Macos 16-core',
      usageAt: '2023-03-01T08:00:00.00Z',
      unitType: 'Minutes',
    }

    expect(formatQuantityDisplay(lineItem)).toEqual('10 min')
  })

  it('returns full quantity for metered subscription products', () => {
    const lineItem: ProductUsageLineItem = {
      ...copilotLineItem,
      quantity: 5,
      fullQuantity: 10,
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('10 Seats')
  })

  it('does not return units for non product line items', () => {
    const lineItems: RepoUsageLineItem[] = [
      {
        appliedCostPerQuantity: 0.259,
        billedAmount: 2.59,
        product: 'actions',
        quantity: 10,
        fullQuantity: 10,
        usageAt: '2023-03-01T08:00:00.00Z',
        repo: {name: 'foo'},
        org: {name: 'bar', avatarSrc: 'https://avatars.githubusercontent.com/u/1234567'},
      },
    ]

    expect(formatQuantityDisplay(lineItems[0]!)).toEqual('10')
  })

  it('formats seconds unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'Seconds',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 sec')
  })

  it('formats minutes unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'Minutes',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 min')
  })

  it('formats hours unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'Hours',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 hr')
  })

  it('formats bytes unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'Bytes',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 B')
  })

  it('formats megabytes unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'Megabytes',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 MB')
  })

  it('formats gigabytes unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'Gigabytes',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 GB')
  })

  it('formats megabyte hours unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'MegabyteHours',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 MB/h')
  })

  it('formats gigabyte hours unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'GigabyteHours',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 GB/h')
  })

  it('formats user months unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'UserMonths',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1 Seat')
  })

  it('leaves blank unrecognized unit', () => {
    const lineItem: ProductUsageLineItem = {
      ...genericLineItem,
      unitType: 'Foo',
    }
    expect(formatQuantityDisplay(lineItem)).toEqual('1')
  })
})

const copilotLineItem: ProductUsageLineItem = {
  appliedCostPerQuantity: 21,
  billedAmount: 105,
  product: 'copilot',
  quantity: 5,
  fullQuantity: 5,
  sku: 'copilot_for_business',
  friendlySkuName: 'Copilot for Business',
  usageAt: '2023-03-01T08:00:00.00Z',
  unitType: 'UserMonths',
}

const genericLineItem: ProductUsageLineItem = {
  appliedCostPerQuantity: 1,
  billedAmount: 1,
  product: 'SkyHighHoppers',
  quantity: 1,
  fullQuantity: 1,
  sku: 'bounce_a_lot_balloony_boots',
  friendlySkuName: 'Bounce-a-Lot Balloony Boots',
  usageAt: '2023-03-01T08:00:00.00Z',
  unitType: 'Bounces',
}
