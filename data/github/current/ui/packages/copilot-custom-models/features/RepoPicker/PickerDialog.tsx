import {Dialog} from '@primer/react/drafts'
import {useState, useMemo, useEffect} from 'react'
import type {QueryFn, OnSelect} from './types'
import {useQueryForRepos} from './use-query-for-repos'
import {useSelectedRepos} from './SelectedReposProvider'
import {useDebouncedQuery} from '../../hooks/use-debounced-query'
import {sortFn} from './utils'
import {PickerRepoList} from './PickerRepoList'
import {SearchIcon} from '@primer/octicons-react'
import {Box, Spinner, TextInput} from '@primer/react'

interface Props {
  closeDialog: () => void
  queryFn: QueryFn
}

export function PickerDialog({closeDialog, queryFn}: Props) {
  const {isLoadingSelected, selected: initialSelected, setAll} = useSelectedRepos()
  const {onTextInputChange, query, textInputValue} = useDebouncedQuery()
  const {repos: rawRepos, isQuerying} = useQueryForRepos({query, queryFn})
  const repos = useMemo(() => rawRepos.sort(sortFn), [rawRepos])
  const [selected, setSelected] = useState(initialSelected)

  // Covers the use-case of
  // 1. Select a repo and apply
  // 2. In ListDialog, remove that repo
  // 3. Open PickerDialog again, expect to see it not selected
  useEffect(() => {
    setSelected(initialSelected)
  }, [initialSelected])

  const handleApply = () => {
    setAll(selected ?? [])
    closeDialog()
  }

  const handleCancel = () => {
    setAll(initialSelected ?? [])
    closeDialog()
  }

  const handleSelect: OnSelect = (repo, isSelected) => {
    if (isSelected) {
      setSelected(existing => [...(existing ?? []), repo])
    } else {
      setSelected(existing => existing?.filter(r => r.nameWithOwner !== repo.nameWithOwner))
    }
  }

  return (
    <Dialog
      footerButtons={[
        {buttonType: 'normal', content: 'Cancel', onClick: handleCancel},
        {buttonType: 'primary', content: 'Apply', onClick: handleApply},
      ]}
      onClose={handleCancel}
      renderBody={() => (
        <Dialog.Body sx={{padding: 0, display: 'flex', flexDirection: 'column'}}>
          <TextInput
            leadingVisual={SearchIcon}
            sx={{flex: 1, m: 2}}
            placeholder="Search repositories"
            onChange={onTextInputChange}
            value={textInputValue}
            loading={isQuerying}
            loaderPosition="trailing"
          />
          <div>
            {isLoadingSelected ? (
              <Box sx={{alignItems: 'center', display: 'flex', justifyContent: 'center', pb: '8px'}}>
                <Spinner />
              </Box>
            ) : (
              <PickerRepoList onSelect={handleSelect} repos={repos} selected={selected} />
            )}
          </div>
          <span role="status" className="sr-only">
            {repos.length} {repos.length === 1 ? 'result' : 'results'} returned.
          </span>
        </Dialog.Body>
      )}
      renderFooter={({footerButtons}) => {
        return (
          <Dialog.Footer sx={{'@media screen and (max-height: 400px)': {p: 2}}}>
            {footerButtons && <Dialog.Buttons buttons={footerButtons} />}
          </Dialog.Footer>
        )
      }}
      sx={{'@media screen and (max-height: 400px)': {maxHeight: 'calc(100vh - 8px)'}}}
      title="Select repositories"
    />
  )
}
