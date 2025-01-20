import type {GlobalUserNavDrawerProps} from '../GlobalUserNavDrawer'
import type {AccountSwitcherProps} from '../AccountSwitcher'

export const stashedAccounts: NonNullable<AccountSwitcherProps['stashedAccounts']> = [
  {
    login: 'theinterned',
    name: 'Ned Schwartz',
    avatarUrl: 'https://avatars.githubusercontent.com/theinterned',
    userSessionId: 2,
  },
  {
    login: 'dgreif',
    name: 'Dusty Greif',
    avatarUrl: 'https://avatars.githubusercontent.com/dgreif',
    userSessionId: null,
  },
  {
    login: 'byronrwalker',
    name: 'Byron Walker',
    avatarUrl: 'https://avatars.githubusercontent.com/bryonrwalker',
    userSessionId: null,
  },
  {
    login: 'justinbyo',
    name: 'Justin Young',
    avatarUrl: 'https://avatars.githubusercontent.com/justinbyo',
    userSessionId: null,
  },
  {
    login: 'mattcosta7',
    name: 'Matt Costabile',
    avatarUrl: 'https://avatars.githubusercontent.com/mattcosta7',
    userSessionId: null,
  },
  {
    login: 'manuelpuyol',
    name: 'Manuel Puyol',
    avatarUrl: 'https://avatars.githubusercontent.com/manuelpuyol',
    userSessionId: null,
  },
  {
    login: 'jfuchs',
    name: 'Jon Fuchs',
    avatarUrl: 'https://avatars.githubusercontent.com/jfuchs',
    userSessionId: null,
  },
  {
    login: 'humzahchoudry',
    name: 'Humzah Choudry',
    avatarUrl: 'https://avatars.githubusercontent.com/humzahchoudry',
    userSessionId: null,
  },
  {
    login: 'jibrang',
    name: 'Jibran Garcia',
    avatarUrl: 'https://avatars.githubusercontent.com/jibrang',
    userSessionId: null,
  },
]

export function getUserNavDrawerProps(): GlobalUserNavDrawerProps {
  return {
    owner: {
      login: 'monalisa',
      name: 'Monalisa Octocat',
      avatarUrl: 'https://avatars.githubusercontent.com/u/92997159?v=4',
    },
    lazyLoadItemDataFetchUrl: '_side-panels/user.json',
    addAccountPath: '/add_account_path',
    switchAccountPath: '/switch_account_path',
    loginAccountPath: '/login?add_account=1',
    showAccountSwitcher: true,
    showCopilot: true,
    canAddAccount: true,
    showEnterprises: true,
    showEnterprise: true,
    showGists: true,
    showSponsors: true,
    showUpgrade: true,
    showFeaturesPreviews: true,
    showEnterpriseSettings: true,
    projectsPath: '/projects',
    gistsUrl: 'https://gist.github.com/mine',
    docsUrl: 'https://docs.github.com/',
    yourEnterpriseUrl: 'https://github.com/enterprises/github-inc',
    enterpriseSettingsUrl: 'https://github.com/enterprise/settings',
    supportUrl: 'https://support.github.com/',
    createMenuProps: {},
    onClose: () => {},
  }
}

export const enterpriseAccessVerificationMessage =
  "Your network administrator has blocked access to GitHub except for the 'Fake Empire' Enterprise. Please sign in with your '_fakee' account to access GitHub."
export const enterpriseAccessReason = 'enterprise access denied'
