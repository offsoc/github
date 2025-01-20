export const LABELS = {
  title: 'Inbox',
  documentTitle: 'Inbox',
  sidebarTitle: 'Inbox',
  searchPlaceholder: 'Search inbox',
  searchAriaLabel: 'Search inbox',

  inboxPath: '/inbox',
  viewsPath: '/views',
  viewsPrefix: '/inbox/views/',

  searchId: 'notifications-search',
  searchTestId: 'notifications-search-bar',
  desktopSearchId: 'notifications-search-bar-desktop',
  mobileSearchId: 'notifications-search-bar-mobile',

  inboxId: 'inbox',
  numberOfNotifications: (numNotifications: number) =>
    `${numNotifications} ${numNotifications === 1 ? 'notification' : 'notifications'}`,
  // /inbox?q=<my_search_query>
  notificationQueryUrlKey: 'q',
  loadingListingResults: '.. notifications (out of ..)',
  errorLoading: 'We encountered an error trying to load inbox',
  failedToLoadInbox: 'Failed to load inbox',
  failedToOptOutInbox: 'Unable to opt-in/out. Please refresh or try again later',
  copyLink: (str: string | null) => `Copy link ${str ? `to ${str}` : ''}`,
  backToInbox: 'Back to inbox',

  markAsDone: 'Mark as done',
}
