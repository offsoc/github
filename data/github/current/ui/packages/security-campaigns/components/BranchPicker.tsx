import {
  BranchPickerInternal,
  BranchPickerRepositoryBranchesGraphqlQuery,
  BranchPickerRepositoryBranchRefsFragment,
} from '@github-ui/item-picker/BranchPicker'
import {readInlineData, useLazyLoadQuery} from 'react-relay'
import type {Repository} from '@github-ui/security-campaigns-shared/types/repository'
import type {BranchPickerRepositoryBranchesQuery} from '@github-ui/item-picker/BranchPickerRepositoryBranchesQuery.graphql'
import type {BranchPickerRepositoryBranchRefs$key} from '@github-ui/item-picker/BranchPickerRepositoryBranchRefs.graphql'
import {useCallback, useState} from 'react'
import type {BranchPickerRef$data} from '@github-ui/item-picker/BranchPickerRef.graphql'

interface BranchPickerProps {
  repository: Repository
  onSelect: (branchName: string) => void
}

export function BranchPicker({repository, onSelect}: BranchPickerProps) {
  const [selectedSourceBranch, setSelectedSourceBranch] = useState<BranchPickerRef$data | null>(null)

  const onSelectedSourceBranch = useCallback(
    (branch?: BranchPickerRef$data) => {
      if (branch) {
        setSelectedSourceBranch(branch)
        onSelect(branch.name)
      }
    },
    [onSelect],
  )

  const branches = useLazyLoadQuery<BranchPickerRepositoryBranchesQuery>(BranchPickerRepositoryBranchesGraphqlQuery, {
    name: repository.name,
    owner: repository.ownerLogin,
  })
  const repoBranchRefs =
    branches.repository &&
    // eslint-disable-next-line no-restricted-syntax
    readInlineData<BranchPickerRepositoryBranchRefs$key>(BranchPickerRepositoryBranchRefsFragment, branches.repository)

  const branchesKey = repoBranchRefs?.refs ?? null

  return (
    <BranchPickerInternal
      initialBranch={selectedSourceBranch}
      defaultBranchId={undefined}
      branchesKey={branchesKey}
      owner={repository.ownerLogin}
      repo={repository.name}
      onSelect={onSelectedSourceBranch}
      title={'Select a branch'}
    />
  )
}
