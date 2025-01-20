import type {Commit} from '@github-ui/repos-types'
import type {SafeHTMLString} from '@github-ui/safe-html'

export const latestCommitData: Commit = {
  oid: '1234sha',
  url: '',
  date: new Date().toISOString(),
  // eslint-disable-next-line github/unescaped-html-literal
  shortMessageHtmlLink: `<a href="commit-message">Short last commit message</a>` as SafeHTMLString,
  bodyMessageHtml: 'This is the message of the latest commit' as SafeHTMLString,
  author: {
    displayName: 'Carlos A',
    login: 'jchuerva',
    avatarUrl: '/UserLatestCommit',
    path: '/jchuerva',
  },
}

export const latestCommitDataWithMultipleLinks: Commit = {
  oid: '1234sha',
  url: '',
  date: new Date().toISOString(),
  shortMessageHtmlLink:
    // eslint-disable-next-line github/unescaped-html-literal
    `<a href="commit-message">Short last commit message </a><a data-hovercard-url=string>#123</a>` as SafeHTMLString,
  bodyMessageHtml: 'This is the message of the latest commit' as SafeHTMLString,
  author: {
    displayName: 'Carlos A',
    login: 'jchuerva',
    avatarUrl: '/UserLatestCommit',
    path: '/jchuerva',
  },
}
