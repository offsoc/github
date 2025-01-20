import {MergeMethodContextProvider} from '@github-ui/mergebox'
import type {MergeMethod} from '@github-ui/mergebox/types'
import {useHideFooter} from '@github-ui/use-hide-footer'
import {SplitPageLayout} from '@primer/react'
import {Suspense, useEffect} from 'react'
import {useLocation} from 'react-router-dom'

import {PendingSuggestedChangesBatchContextProvider} from '../contexts/PendingSuggestedChangesBatchContext'
import type {PullRequestPageLayoutQueries} from '../types'
import type {ItemIdentifier} from '../types/pull-request'
import {PullRequestHeaderWrapper} from './header/PullRequestHeaderWrapper'
import {PullRequestMainContentArea} from './PullRequestMainContentArea'

type PullRequestLayoutProps = PullRequestPageLayoutQueries & {
  refListCacheKey: string
  body: JSX.Element
  filePath?: string
  showFileTree?: boolean
  defaultMergeMethod: MergeMethod
  loadingComponent?: JSX.Element
  itemIdentifier: ItemIdentifier
  headRefOid: string
}

/**
 *  Layout renders the header and main content area for a pull request
 *  When creating a new pull request page for PRX, it should use this layout
 *  @param queries - The queries to use for the header and main content area
 */
export function PullRequestLayout({
  queries,
  refListCacheKey,
  body,
  showFileTree = true,
  defaultMergeMethod,
  loadingComponent,
  itemIdentifier,
  headRefOid,
}: PullRequestLayoutProps) {
  const {headerQuery, mainContentAreaQuery} = queries
  const {pathname} = useLocation()

  // While this component is mounted, hide the standard footer. The reason we
  // must do this in javascript is because the footer is retained across Turbo
  // navigations, so if we omit it in the controller, it may still be present
  // under some circumstances.
  useHideFooter(true)

  useEffect(() => {
    // scroll header to be top of screen on navigation within the app
    if (!window.location.hash && window.scrollY > 0) {
      const prHeader = document.getElementById('pull-request-view-header')
      const prMeta = document.getElementById('pull-request-view-header-meta')
      if (!prHeader || !prMeta) return

      // if prHeader is out of view, scroll to the y of the sticky header, otherwise scroll prHeader into view
      if (prHeader.getBoundingClientRect().top < 0) {
        window.scrollTo({
          top: prHeader.getBoundingClientRect().bottom + window.scrollY,
        })
      } else {
        prHeader.scrollIntoView()
      }
    }
  }, [pathname])

  return (
    // Suspends while header or main content area data is loading
    <PendingSuggestedChangesBatchContextProvider {...itemIdentifier} headRefOid={headRefOid}>
      <MergeMethodContextProvider defaultMergeMethod={defaultMergeMethod}>
        <Suspense fallback={loadingComponent}>
          <PullRequestHeaderWrapper queryRef={headerQuery} refListCacheKey={refListCacheKey} />
          <SplitPageLayout
            sx={{
              height: '100%',
              '> div': {
                height: '100%',
              },
            }}
          >
            <PullRequestMainContentArea body={body} queryRef={mainContentAreaQuery} showFileTree={showFileTree} />
          </SplitPageLayout>
        </Suspense>
      </MergeMethodContextProvider>
    </PendingSuggestedChangesBatchContextProvider>
  )
}
