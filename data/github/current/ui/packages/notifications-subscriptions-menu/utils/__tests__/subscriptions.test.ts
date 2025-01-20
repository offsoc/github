import {
  SUBSCRIPTION_TYPE_TEXT,
  SubscriptionTypeValue,
  subscriptionTypeText,
  subscriptionLabelText,
} from '../subscriptions'

test.each(Object.values(SubscriptionTypeValue))('returns correct text for %s subscription', subscription => {
  const text = subscriptionTypeText(subscription)
  expect(text).toEqual(SUBSCRIPTION_TYPE_TEXT[subscription])
})

test('returns correct text for non existing subscription', () => {
  const text = subscriptionTypeText('blah')
  expect(text).toEqual('')
})

describe('aria labels', () => {
  it('participating', () => {
    const label = subscriptionLabelText(SubscriptionTypeValue.NONE, 'repo')
    expect(label).toEqual('Watch: Participating in repo')
  })

  it('all', () => {
    const label = subscriptionLabelText(SubscriptionTypeValue.WATCHING, 'repo')
    expect(label).toEqual('Unwatch: All Activity in repo')
  })

  it('ignoring', () => {
    const label = subscriptionLabelText(SubscriptionTypeValue.IGNORING, 'repo')
    expect(label).toEqual('Stop ignoring in repo')
  })

  it('custom', () => {
    const label = subscriptionLabelText(SubscriptionTypeValue.CUSTOM, 'repo')
    expect(label).toEqual('Unwatch: Custom in repo')
  })
})
