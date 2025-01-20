import memoize from '@github/memoize'
import {useCurrentRepository} from '@github-ui/current-repository'
import {treeListPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

async function fetchJSON(url: string): Promise<{paths: string[]; directories: string[]} | undefined> {
  const response = await verifiedFetchJSON(url)
  if (response.ok) {
    return await response.json()
  } else {
    return undefined
  }
}

// We need to memoize to prevent fetching it more than once when the component is unmounted
// and mounted again because user filters, then get back to the tree and then filters again.
const memoizeCache = new Map()
const memoizedFetch = memoize<[string], Promise<{paths: string[]; directories: string[]} | undefined>, unknown>(
  fetchJSON,
  {cache: memoizeCache},
)

export function resetTreeListMemoizeFetch() {
  memoizeCache.clear()
}

interface TreeListState {
  list: string[]
  directories: string[]
  loading?: boolean
  error?: boolean
}

export function useTreeList(commitOid: string, load: boolean, excludeDirectories?: boolean) {
  const repo = useCurrentRepository()
  const [state, setState] = useState<TreeListState>({list: [], directories: [], loading: true})

  const treeListUrl = treeListPath({repo, commitOid, includeDirectories: !excludeDirectories})

  useEffect(() => {
    let cancelled = false
    const update = async () => {
      setState({list: [], directories: [], loading: true})
      const data = await memoizedFetch(treeListUrl)

      if (cancelled) {
        return
      }

      const files = data?.paths || []
      const directories = data?.directories || []
      const list = files.concat(directories).sort()

      setState({list, directories, error: !data})
    }

    load && update()

    return function cancel() {
      cancelled = true
    }
  }, [treeListUrl, load, excludeDirectories])

  return state
}
