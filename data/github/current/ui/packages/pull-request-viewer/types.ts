import type {PreloadedQuery} from 'react-relay'

import type {PullRequestActivityViewerContentQuery} from './components/__generated__/PullRequestActivityViewerContentQuery.graphql'
import type {PullRequestCommitsViewerContentQuery} from './components/__generated__/PullRequestCommitsViewerContentQuery.graphql'
import type {PullRequestFilesViewerContentQuery} from './components/__generated__/PullRequestFilesViewerContentQuery.graphql'
import type {PullRequestMainContentAreaQuery} from './components/__generated__/PullRequestMainContentAreaQuery.graphql'
import type {PullRequestSummaryViewerContentQuery} from './components/__generated__/PullRequestSummaryViewerContentQuery.graphql'
import type {PullRequestSummaryViewerSecondaryContentQuery} from './components/__generated__/PullRequestSummaryViewerSecondaryContentQuery.graphql'
import type {DeferredCommitsDataLoaderQuery} from './components/commits/__generated__/DeferredCommitsDataLoaderQuery.graphql'
import type {DetailsPaneQuery} from './components/details-pane/__generated__/DetailsPaneQuery.graphql'
import type {PullRequestHeaderWrapperQuery} from './components/header/__generated__/PullRequestHeaderWrapperQuery.graphql'

export type PullRequestPageLayoutQueries = {
  queries: {
    headerQuery: PreloadedQuery<PullRequestHeaderWrapperQuery>
    mainContentAreaQuery: PreloadedQuery<PullRequestMainContentAreaQuery>
  }
}

type PullRequestPageLayoutProps = {
  headerQuery: PullRequestHeaderWrapperQuery
  mainContentAreaQuery: PullRequestMainContentAreaQuery
}

export type PullRequestSummaryPageProps = PullRequestPageLayoutProps & {
  contentQuery: PullRequestSummaryViewerContentQuery
  detailsPaneQuery: DetailsPaneQuery
  secondaryContentQuery: PullRequestSummaryViewerSecondaryContentQuery
}

export type PullRequestSummaryViewerQueries = {
  queries: {
    detailsPaneQuery: PreloadedQuery<DetailsPaneQuery>
    contentQuery: PreloadedQuery<PullRequestSummaryViewerContentQuery>
    secondaryContentQuery: PreloadedQuery<PullRequestSummaryViewerSecondaryContentQuery>
  }
}

export type PullRequestFilesPageProps = PullRequestPageLayoutProps & {
  contentQuery: PullRequestFilesViewerContentQuery
}

export type PullRequestFilesViewerQueries = {
  queries: {
    contentQuery: PreloadedQuery<PullRequestFilesViewerContentQuery>
  }
}

export type PullRequestActivityPageProps = PullRequestPageLayoutProps & {
  contentQuery: PullRequestActivityViewerContentQuery
}

export type PullRequestActivityViewerQueries = {
  queries: {
    contentQuery: PreloadedQuery<PullRequestActivityViewerContentQuery>
  }
}

export type PullRequestCommitsPageProps = PullRequestPageLayoutProps & {
  contentQuery: PullRequestCommitsViewerContentQuery
  deferredCommitsDataQuery: DeferredCommitsDataLoaderQuery
}

export type PullRequestCommitsViewerQueries = {
  queries: {
    contentQuery: PreloadedQuery<PullRequestCommitsViewerContentQuery>
    deferredCommitsDataQuery: PreloadedQuery<DeferredCommitsDataLoaderQuery>
  }
}
