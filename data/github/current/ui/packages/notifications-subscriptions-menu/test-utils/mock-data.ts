import type {NotificationsSubscriptionsMenuProps} from '../NotificationsSubscriptionsMenu'
import type {ThreadType} from '../components/ThreadList'
import {SubscriptionTypeValue} from '../utils/subscriptions'

const threadList = [
  {
    name: 'Issue',
    enabled: true,
    subscribed: true,
  },
  {
    name: 'PullRequest',
    enabled: true,
    subscribed: false,
  },
  {
    name: 'Discussion',
    enabled: false,
    subscribed: false,
  },
]

export function getNotificationsSubscriptionsMenuProps(
  subscriptionType: string,
  threads?: ThreadType[],
): NotificationsSubscriptionsMenuProps {
  return {
    repositoryId: '1234',
    repositoryName: 'reponame',
    watchersCount: 0,
    subscriptionType,
    // If passed, use threads, otherwise use threadList only if subscriptionType is custom
    subscribableThreadTypes: threads ? threads : subscriptionType === SubscriptionTypeValue.CUSTOM ? threadList : [],
    repositoryLabels: [],
    showLabelSubscriptions: false,
  }
}

export function getNotificationsSubscriptionsMenuWithLabelsProps(): NotificationsSubscriptionsMenuProps {
  return {
    repositoryId: '1234',
    repositoryName: 'reponame',
    watchersCount: 0,
    subscriptionType: SubscriptionTypeValue.CUSTOM, // Must be custom to show threadList
    subscribableThreadTypes: threadList,
    repositoryLabels: [
      {
        id: 1,
        name: 'bug',
        html: 'bug <span style="color: red;"></span>',
        color: 'red',
        description: 'this is a description bug label',
        subscribed: true,
      },
      {
        id: 2,
        name: 'epic',
        html: 'epic <span style="color: blue;"></span>',
        color: 'blue',
        description: 'this is a description epic label',
        subscribed: false,
      },
    ],
    showLabelSubscriptions: true,
  }
}
