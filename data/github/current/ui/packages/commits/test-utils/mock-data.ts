import type {Author} from '@github-ui/commit-attribution'
import {createRepository} from '@github-ui/current-repository/test-helpers'
import type {SafeHTMLString} from '@github-ui/safe-html'

import type {CommitsPayload, DeferredCommitData, DeferredData} from '../types/commits-types'
import type {Commit} from '../types/shared'

export function getCommitsRoutePayload(): CommitsPayload {
  return {
    currentCommit: {
      oid: 'string',
    },
    commitGroups: [],
    filters: {
      since: '2023-09-01',
      until: '2023-09-27',
      author: {
        login: 'monalisa',
        name: null,
        path: '/monalisa',
        primaryAvatarUrl: '/monalisa',
      },
      currentBlobPath: 'blah.py',
      newPath: null,
      originalBranch: null,
      pagination: {
        hasNextPage: true,
        hasPreviousPage: true,
        endCursor: 'j9234jig82hhj1895345+34', //the string to add to the URL as the 'after' parameter when a user clicks next
        startCursor: 'jg92935718357f8d8+34', //the string to add to the URL as the 'before' parameter when a user clicks previous
      },
    },
    metadata: {
      showProfileHelp: true,
      browsingRenameHistory: false,
      deferredDataUrl: '/deferred-data-url',
      deferredContributorUrl: '/here-it-is',
      softNavToCommit: false,
    },
    repo: createRepository(),
    refInfo: {
      name: 'main',
      listCacheKey: 'key',
      currentOid: 'abcd12345face398f34f3b7b7db142a0724fa958',
      refType: 'tree',
    },
    timedOutMessage: '',
  }
}

export const authorData1: Author = {
  login: 'monalisa',
  displayName: 'monalisa',
  avatarUrl: 'http://alambic.github.localhost/avatars/u/2',
  path: '/monalisa',
}

const authorData2: Author = {
  login: 'monalisa2',
  displayName: 'monalisa2',
  avatarUrl: 'http://alambic.github.localhost/avatars/u/3',
  path: '/monalisa2',
}

export const sampleCommitRowData: Commit = {
  oid: '052a205c10a5a949ec8b00521da6508e7f2eab1fc',
  shortMessage: 'this is a short message',
  // eslint-disable-next-line github/unescaped-html-literal
  shortMessageMarkdownLink: '<a>this is a short message</a>' as SafeHTMLString,
  authors: [authorData1, authorData2],
  bodyMessageHtml: 'here is some body message html' as SafeHTMLString,
  committedDate: '2023-09-12T10:55:07.000-07:00',
  committer: {
    avatarUrl: 'http://alambic.github.localhost/avatars/u/3',
    displayName: 'GitHub',
    login: 'web-flow',
    path: '/web-flow',
  },
  committerAttribution: false,
  url: '/monalisa/smile/commit/052a205c10a5a949ec8b00521da6508e7f2eab1fc',
}

export function generateCommitMessages() {
  const seed = [
    {
      shortMessage: 'Merge pull request #1 from github/branch-name',
      shortMessageMarkdownLink:
        // eslint-disable-next-line github/unescaped-html-literal
        '<a class="color-fg-default" href="#">Merge pull request</a> <a class="issue-link js-issue-link" href="#">#1</a> <a class="color-fg-default" href="#">from github/branch-name</a>' as SafeHTMLString,
      bodyMessageHtml: 'Extended commit message' as SafeHTMLString,
    },
    {
      shortMessage: 'Add test coverage for new feature',
      shortMessageMarkdownLink:
        // eslint-disable-next-line github/unescaped-html-literal
        '<a class="color-fg-default" href="#">Add test coverage for new feature</a>' as SafeHTMLString,
      bodyMessageHtml: undefined,
    },
    {
      shortMessage: 'Add storybook for new feature',
      shortMessageMarkdownLink:
        // eslint-disable-next-line github/unescaped-html-literal
        '<a class="color-fg-default" href="#">Add storybook for new feature</a>' as SafeHTMLString,
      bodyMessageHtml: undefined,
    },
    {
      shortMessage: 'Fix linting issue',
      shortMessageMarkdownLink:
        // eslint-disable-next-line github/unescaped-html-literal
        '<a class="color-fg-default" href="#">Fix linting issue</a>' as SafeHTMLString,
      bodyMessageHtml: undefined,
    },
  ]

  const indexToUse = Math.floor(Math.random() * seed.length)

  return seed[indexToUse]
}

export const deferredCommit: DeferredCommitData = {
  oid: '052a205c10a5a949ec8b00521da6508e7f2eab1fc',
  statusCheckStatus: {
    state: 'success' as const,
    // eslint-disable-next-line camelcase
    short_text: '1 / 47',
  },
  signatureInformation: {
    hasSignature: true,
    isViewer: true,
    keyExpired: false,
    keyId: 'keystring',
    keyRevoked: false,
    signedByGitHub: true,
    signerLogin: 'Github',
    signerAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
    signatureType: 'GpgSignature' as const,
    signatureVerificationReason: 'just because',
  },
  verifiedStatus: 'verified' as const,
}

export const deferredPartiallyVerifiedCommit: DeferredCommitData = {
  oid: '152a205c10a5a949ec8b00521da6508e7f2eab1fc',
  statusCheckStatus: {
    state: 'pending' as const,
    // eslint-disable-next-line camelcase
    short_text: '1 / 47',
  },
  signatureInformation: {
    hasSignature: true,
    isViewer: true,
    keyExpired: false,
    keyId: 'keystring',
    keyRevoked: false,
    signedByGitHub: true,
    signerLogin: 'Github',
    signerAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
    signatureType: 'GpgSignature' as const,
    signatureVerificationReason: 'just because',
  },
  verifiedStatus: 'partially_verified' as const,
}

export const deferredUnverifiedCommit: DeferredCommitData = {
  oid: '252a205c10a5a949ec8b00521da6508e7f2eab1fc',
  statusCheckStatus: {
    state: 'failure' as const,
    // eslint-disable-next-line camelcase
    short_text: '1 / 47',
  },
  signatureInformation: {
    hasSignature: false,
    isViewer: true,
    keyExpired: false,
    keyId: 'keystring',
    keyRevoked: false,
    signedByGitHub: true,
    signerLogin: 'Github',
    signerAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
    signatureType: 'GpgSignature' as const,
    signatureVerificationReason: 'just because',
  },
  verifiedStatus: 'unverified' as const,
}

export const deferredOnBehalfOfCommit: DeferredCommitData = {
  oid: '352a205c10a5a949ec8b00521da6508e7f2eab1fc',
  statusCheckStatus: {
    state: 'success' as const,
    // eslint-disable-next-line camelcase
    short_text: '1 / 47',
  },
  signatureInformation: {
    hasSignature: true,
    isViewer: true,
    keyExpired: false,
    keyId: 'keystring',
    keyRevoked: false,
    signedByGitHub: true,
    signerLogin: 'Github',
    signerAvatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
    signatureType: 'GpgSignature' as const,
    signatureVerificationReason: 'just because',
  },
  verifiedStatus: 'verified' as const,
  onBehalfOf: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
    displayName: 'GitHub',
    login: 'github',
    path: '/github',
  },
}

export const deferredData: DeferredData = {
  deferredCommits: [
    deferredCommit,
    deferredPartiallyVerifiedCommit,
    deferredUnverifiedCommit,
    deferredOnBehalfOfCommit,
  ],
  renameHistory: {
    historyUrl: 'https://github.localhost/repos-org/maximum-effort/commits/blah.py',
    hasRenameCommits: true,
    oldName: 'this_is_the_old_name.py',
  },
  loading: false,
}

export const deferredAuthorData = {
  authors: [
    {
      login: 'collaborator-1',
      name: null,
      path: '/collaborator-1',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/149?s=80',
    },
    {
      login: 'collaborator-10',
      name: null,
      path: '/collaborator-10',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/158?s=80',
    },
    {
      login: 'collaborator-11',
      name: null,
      path: '/collaborator-11',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/159?s=80',
    },
    {
      login: 'collaborator-12',
      name: null,
      path: '/collaborator-12',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/160?s=80',
    },
    {
      login: 'collaborator-13',
      name: null,
      path: '/collaborator-13',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/161?s=80',
    },
    {
      login: 'collaborator-14',
      name: null,
      path: '/collaborator-14',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/162?s=80',
    },
    {
      login: 'collaborator-15',
      name: null,
      path: '/collaborator-15',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/163?s=80',
    },
    {
      login: 'collaborator-16',
      name: null,
      path: '/collaborator-16',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/164?s=80',
    },
    {
      login: 'collaborator-17',
      name: null,
      path: '/collaborator-17',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/165?s=80',
    },
    {
      login: 'collaborator-18',
      name: null,
      path: '/collaborator-18',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/166?s=80',
    },
    {
      login: 'collaborator-19',
      name: null,
      path: '/collaborator-19',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/167?s=80',
    },
    {
      login: 'collaborator-2',
      name: null,
      path: '/collaborator-2',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/150?s=80',
    },
    {
      login: 'collaborator-20',
      name: null,
      path: '/collaborator-20',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/168?s=80',
    },
    {
      login: 'collaborator-21',
      name: null,
      path: '/collaborator-21',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/169?s=80',
    },
    {
      login: 'collaborator-22',
      name: null,
      path: '/collaborator-22',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/170?s=80',
    },
    {
      login: 'collaborator-23',
      name: null,
      path: '/collaborator-23',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/171?s=80',
    },
    {
      login: 'collaborator-24',
      name: null,
      path: '/collaborator-24',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/172?s=80',
    },
    {
      login: 'collaborator-25',
      name: null,
      path: '/collaborator-25',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/173?s=80',
    },
    {
      login: 'collaborator-26',
      name: null,
      path: '/collaborator-26',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/174?s=80',
    },
    {
      login: 'collaborator-27',
      name: null,
      path: '/collaborator-27',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/175?s=80',
    },
    {
      login: 'collaborator-28',
      name: null,
      path: '/collaborator-28',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/176?s=80',
    },
    {
      login: 'collaborator-29',
      name: null,
      path: '/collaborator-29',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/177?s=80',
    },
    {
      login: 'collaborator-3',
      name: null,
      path: '/collaborator-3',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/151?s=80',
    },
    {
      login: 'collaborator-30',
      name: null,
      path: '/collaborator-30',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/178?s=80',
    },
    {
      login: 'collaborator-4',
      name: null,
      path: '/collaborator-4',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/152?s=80',
    },
    {
      login: 'collaborator-5',
      name: null,
      path: '/collaborator-5',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/153?s=80',
    },
    {
      login: 'collaborator-6',
      name: null,
      path: '/collaborator-6',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/154?s=80',
    },
    {
      login: 'collaborator-7',
      name: null,
      path: '/collaborator-7',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/155?s=80',
    },
    {
      login: 'collaborator-8',
      name: null,
      path: '/collaborator-8',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/156?s=80',
    },
    {
      login: 'collaborator-9',
      name: null,
      path: '/collaborator-9',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/157?s=80',
    },
    {
      login: 'monalisa',
      name: null,
      path: '/monalisa',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/2?s=80',
    },
    {
      login: 'repos-org',
      name: null,
      path: '/repos-org',
      primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/148?s=80',
    },
  ],
}
