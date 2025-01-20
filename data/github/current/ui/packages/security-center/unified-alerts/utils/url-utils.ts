import {useEffect} from 'react'

export function useUpdateUrl(submittedQuery: string, queryWasChanged: boolean, groupKey: string): void {
  useEffect(() => {
    const url = new URL(window.location.href, window.location.origin)
    const nextParams = url.searchParams

    if (queryWasChanged) {
      nextParams.set('query', submittedQuery)
    } else {
      nextParams.delete('query')
    }

    groupKey !== 'none' ? nextParams.set('groupKey', groupKey) : nextParams.delete('groupKey')

    history.pushState(null, '', `${url.pathname}${url.search}`)
  }, [submittedQuery, queryWasChanged, groupKey])
}
