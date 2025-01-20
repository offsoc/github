import {announce} from '@github-ui/aria-live'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {PaginationProps} from '@primer/react'
import {Pagination, Spinner} from '@primer/react'
import {useEffect, useState} from 'react'

export interface SecurityCenterPaginationProps extends PaginationProps {
  pageCountsUrl?: string
}

type DataStateKind = 'loading' | 'error' | 'ready'

type PageCountsResponse = {
  data?: {
    activeCount: number
    archivedCount: number
    totalEntries: number
    totalPages: number
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await verifiedFetchJSON(url)

  if (!response.ok) {
    return Promise.reject(new Error(`Request failed with status ${response.status}`))
  }

  // If the SSO token expires, we will get an HTML response instead of json
  if (!response.headers.get('Content-Type')?.includes('application/json')) {
    return Promise.reject(new Error('Response is not JSON'))
  }

  return response.json() as Promise<T>
}

function changePage(page: number): string {
  // Add or modify a page query param to page number
  // and return the new url

  const url = new URL(window.location.href, window.location.origin)
  const params = new URLSearchParams(url.search)
  params.set('page', page.toString())
  return `${url.pathname}?${params.toString()}`
}

export function SecurityCenterPagination(props: SecurityCenterPaginationProps): JSX.Element | null {
  const [pageCount, setPageCount] = useState(props.pageCount)
  const [dataState, setDataState] = useState<DataStateKind>(props.pageCountsUrl ? 'loading' : 'ready')

  useEffect(() => {
    async function fetchData(url: string): Promise<void> {
      const activeCountEl = document.getElementsByClassName('js-table-active-count')?.[0]
      const archivedCountEl = document.getElementsByClassName('js-table-archived-count')?.[0]
      const totalCountEl = document.getElementsByClassName('js-table-total-count')?.[0]
      const tableItemSelectionEl = document.getElementsByTagName('table-item-selection')?.[0]

      let data: PageCountsResponse | null
      try {
        data = await fetchJson<PageCountsResponse>(url)
      } catch {
        data = null
      }

      if (data?.data == null) {
        // If we can't load the page counts, just remove the counts from the list header.
        // This leaves the links looking like tabs without counts. Less useful, but not broken.
        activeCountEl?.remove()
        archivedCountEl?.remove()

        setDataState('error')
        return
      }

      const {activeCount, archivedCount, totalEntries} = data.data

      // If we did load the page counts, set them in the list header.
      // This reaches outside the React root, but keeps from needing to fetch counts multiple times.
      if (activeCountEl) {
        activeCountEl.textContent = activeCount.toLocaleString()
      }
      if (archivedCountEl) {
        archivedCountEl.textContent = archivedCount.toLocaleString()
      }
      if (totalCountEl) {
        totalCountEl.textContent = `Select all ${totalEntries} repositories`
      }
      if (tableItemSelectionEl) {
        tableItemSelectionEl.setAttribute('data-all-for-filter-count', totalEntries.toString())
      }

      // For screen readers, focus takes precedence over ARIA Live Region updates.
      // However, if the ARIA Live Region update is delayed, the ARIA Live Region update will be announced.
      setTimeout(() => {
        const ariaLiveMessage = `${activeCount} active and ${archivedCount} archived repositories found`
        announce(ariaLiveMessage)
      }, 1000)

      setPageCount(data.data.totalPages)
      setDataState('ready')
    }

    if (props.pageCountsUrl) {
      fetchData(props.pageCountsUrl)
    }
  }, [props.pageCountsUrl])

  if (dataState === 'loading') {
    return <Spinner />
  }

  if (dataState === 'error') {
    // If we failed to load the page counts, then render a simpler pagination to still be usable.
    // Lie about the number of available pages just to make it render the next button.
    return (
      <Pagination
        currentPage={props.currentPage}
        pageCount={props.currentPage + 1}
        showPages={false}
        hrefBuilder={changePage}
      />
    )
  }

  if (pageCount <= 1) {
    return null
  }

  return <Pagination currentPage={props.currentPage} pageCount={pageCount} hrefBuilder={changePage} />
}
