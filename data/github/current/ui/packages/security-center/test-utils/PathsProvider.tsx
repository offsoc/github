import type {ReactNode} from 'react'

import {EnterprisePaths, OrgPaths, PathsContext} from '../common/contexts/Paths'

export function PathsProvider({
  children,
  scope,
}: {
  children?: ReactNode | undefined
  scope?: {type: 'org' | 'biz'; slug: string}
}): JSX.Element {
  scope = scope ?? {type: 'org', slug: 'my-org'}
  let paths
  if (scope.type === 'org') {
    paths = new OrgPaths(scope.slug)
  } else {
    paths = new EnterprisePaths(scope.slug)
  }

  return <PathsContext.Provider value={paths}>{children}</PathsContext.Provider>
}
