import type {FC} from 'react'
import {useState} from 'react'
import type {Repository} from '@github-ui/current-repository'
import {RefSelector} from '@github-ui/ref-selector'
import {mapRefType, qualifyRef, unqualifyRef} from '@github-ui/ref-utils'
import type {RefType} from '@github-ui/ref-utils'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'

export const BranchSelector: FC<{gitRef?: string; repo: Repository; branchListCacheKey: string}> = ({
  gitRef,
  repo,
  branchListCacheKey,
}) => {
  const {pathname, navigate} = useRelativeNavigation()
  const [refType, setRefType] = useState<RefType>(() => 'branch')

  return (
    <RefSelector
      currentCommitish={unqualifyRef(gitRef) ?? `All`}
      defaultBranch={repo.defaultBranch}
      owner={repo.ownerLogin}
      repo={repo.name}
      canCreate={false}
      cacheKey={branchListCacheKey}
      selectedRefType={mapRefType(gitRef)}
      onSelectItem={newRef => navigate(pathname, `ref=${qualifyRef(newRef, refType)}`)}
      onRefTypeChanged={newRefType => {
        setRefType(newRefType)
      }}
      types={['branch', 'tag']}
      hideShowAll
      customFooterItemProps={{
        text: 'View all rules',
        onClick: () => {
          navigate(pathname, 'ref=')
        },
        sx: {alignItems: 'center', display: 'flex', justifyContent: 'center'},
      }}
    />
  )
}
