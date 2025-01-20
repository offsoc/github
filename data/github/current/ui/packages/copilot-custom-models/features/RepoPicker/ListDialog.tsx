import {Box, Spinner} from '@primer/react'
import {useSelectedRepos} from './SelectedReposProvider'
import type {BaseRepo} from './types'
import {Dialog} from '@primer/react/drafts'
import {useMemo} from 'react'
import {sortFn} from './utils'
import {ListRepoList} from './ListRepoList'

interface Props {
  closeDialog: () => void
}

export function ListDialog({closeDialog}: Props) {
  const {isLoadingSelected, remove, selected} = useSelectedRepos()

  const handleRemove = (repo: BaseRepo) => {
    const isLast = (selected ?? []).length === 1

    remove(repo)
    if (isLast) closeDialog()
  }

  const repos = useMemo(() => (selected ?? []).sort(sortFn), [selected])

  return (
    <Dialog
      onClose={closeDialog}
      renderBody={() => (
        <Box sx={{px: '8px', py: '16px'}}>
          {isLoadingSelected ? (
            <Box sx={{alignItems: 'center', display: 'flex', justifyContent: 'center'}}>
              <Spinner />
            </Box>
          ) : (
            <ListRepoList onRemove={handleRemove} repos={repos} />
          )}
        </Box>
      )}
      title="Selected repositories"
    />
  )
}
