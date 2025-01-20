import {useFilesPageInfo} from '../contexts/FilesPageInfoContext'
import type {DirectoryItem} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath, type RepositoryTreePathAction} from '@github-ui/paths'
import {useClientValue} from '@github-ui/use-client-value'
import React from 'react'

interface UrlOptions {
  absolute?: boolean
  action?: RepositoryTreePathAction
  commitish?: string
  params?: string
  path?: string
  hash?: string
}

export function useUrlCreator() {
  const repo = useCurrentRepository()
  const {path, action, refInfo} = useFilesPageInfo()
  const [isSSR] = useClientValue(() => false, true, [])

  const getItemUrl = React.useCallback(
    (item: DirectoryItem) => {
      return repositoryTreePath({
        repo,
        commitish: refInfo.name,
        action: item.contentType === 'directory' ? 'tree' : 'blob',
        path: item.path,
      })
    },
    // repo is recalculated on every soft nav, we only need to update the callback if the name or ownerLogin change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repo.ownerLogin, repo.name, refInfo.name],
  )

  function getTail({params, hash}: UrlOptions) {
    return getUrlParams(params) + getHash(hash)
  }

  function getUrlParams(params: string | undefined) {
    return params ? `?${params}` : ''
  }

  function getHash(hash: string | undefined) {
    if (isSSR) return ''
    if (hash === undefined) {
      return window.location.hash
    }
    return hash ? `#${hash}` : ''
  }

  return {
    getItemUrl,

    getUrl(options: UrlOptions = {}) {
      const url =
        repositoryTreePath({
          repo,
          commitish: options.commitish || refInfo.name,
          action: options.action || action,
          path: options.path || path,
        }) + getTail(options)

      if (options.absolute) {
        return new URL(url, window.location.origin).href
      } else {
        return url
      }
    },

    createPermalink(options: UrlOptions = {}) {
      const url =
        repositoryTreePath({
          repo,
          commitish: refInfo.currentOid,
          action: options.action || action,

          path: options.path || path,
        }) + getTail(options)

      if (options.absolute) {
        return new URL(url, window.location.origin).href
      } else {
        return url
      }
    },

    isCurrentPagePermalink() {
      if (isSSR) return false
      // ancestry references have an OID name
      // check if the OID is in the path to see if it's a permalink
      return refInfo.name === refInfo.currentOid && window.location.pathname.includes(refInfo.currentOid)
    },
  }
}
