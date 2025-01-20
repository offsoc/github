/**
 * @fileoverview Utility functions for testing notifications.
 */

/// Helper method to generate a stub notification response
/// with optional overrides for notiifcation subject and list (origin)
export const mockNotification = ({number = 1, subject = null, list = null}) => ({
  isUnread: true,
  unreadItemsCount: 1,
  lastUpdatedAt: '2021-01-01T00:00:00Z',
  reason: 'SUBSCRIBED',
  summaryItemBody: 'Body',
  recentParticipants: [
    {
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345678?v=4',
    },
  ],
  subject: subject ?? {
    __typename: 'Issue',
    title: 'Test subject',
    issueState: 'CLOSED',
    stateReason: 'COMPLETED',
    number,
  },
  list: list ?? {
    __typename: 'Repository',
    name: 'test-repo',
    owner: {
      login: 'test-owner',
    },
  },
})
