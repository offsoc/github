import {useCallback, useEffect, useMemo, useState} from 'react'
import {RepoIcon, RepoLockedIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Truncate, type ButtonProps} from '@primer/react'
import {Button} from '@primer/react'
import {debounce} from '@github/mini-throttle'
import {ItemPicker} from '@github-ui/item-picker/ItemPicker'

// A simple repository that only requires a `name` field but can contain additional
// fields to enrich rendering
interface NamedRepository {
  name: string
  enabled?: boolean
  private?: boolean
}

// Internal repo used to represent "All repositories"
interface AllRepo extends NamedRepository {
  _all: true
}

interface SharedProps {
  selectAllOption: boolean
  additionalButtonProps?: Partial<ButtonProps>
  buttonText?: string
}

export interface SingleSelectProps<T> extends SharedProps {
  currentSelection: T | undefined
  repositoryLoader: (q: string) => Promise<T[]>
  onSelect: (repository: T | undefined) => void
  selectionVariant: 'single'
}

export interface MultiSelectProps<T> extends SharedProps {
  currentSelection: T[] | undefined
  repositoryLoader: (q: string) => Promise<T[]>
  onSelect: (repository: T[] | undefined) => void
  selectionVariant: 'multiple'
  selectAllOption: false
  additionalButtonProps?: Partial<ButtonProps>
}

export function ReposSelector<T extends NamedRepository>({
  currentSelection,
  repositoryLoader,
  onSelect,
  selectionVariant,
  selectAllOption,
  additionalButtonProps,
  buttonText: _buttonText = '',
}: SingleSelectProps<T> | MultiSelectProps<T>) {
  const [filterText, setFilterText] = useState('')
  const [filteredRepos, setFilteredRepos] = useState<T[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceRepos = useCallback(
    debounce(async (newFilter: string) => {
      try {
        const response = await repositoryLoader(newFilter)
        setFilteredRepos(response)
      } catch (e) {
        // suppress repo loading errors
      }
      setIsLoadingRepos(false)
    }, 200),
    [repositoryLoader, setFilteredRepos, setIsLoadingRepos],
  )

  useEffect(() => {
    setIsLoadingRepos(true)
    debounceRepos(filterText)
  }, [filterText, debounceRepos, setIsLoadingRepos])

  const selectRepos = useCallback(
    (repos: Array<T | AllRepo>) => {
      if (selectionVariant === 'single') {
        if (!repos[0] || (repos[0] as AllRepo)._all) {
          onSelect(undefined)
        } else {
          onSelect(repos[0] as T)
        }
      } else {
        onSelect(repos as T[])
      }
    },
    [selectionVariant, onSelect],
  )

  const selected = useMemo(() => {
    return selectionVariant === 'multiple' ? currentSelection || [] : currentSelection ? [currentSelection] : []
  }, [selectionVariant, currentSelection])

  const convertToItemProps = useCallback((repo: T | AllRepo) => {
    const truncationCharLimit = 24
    let truncatedRepoName = undefined

    if (repo.name.length > truncationCharLimit) {
      truncatedRepoName = `${repo.name.substring(0, truncationCharLimit)}...`
    }

    if ((repo as AllRepo)._all) {
      return {
        id: repo.name,
        text: 'All repositories',
        source: repo,
        groupId: 'all',
      }
    }
    return {
      id: repo.name,
      text: truncatedRepoName || repo.name,
      source: repo,
      appendOnly: false,
      groupId: 'select',
      disabled: repo.enabled === false,
      leadingVisual: () => {
        if (repo.private) {
          return <RepoLockedIcon size={16} />
        } else {
          return <RepoIcon size={16} />
        }
      },
    }
  }, [])

  const getItemKey = useCallback((repo: T | AllRepo) => repo.name, [])

  const items = useMemo(() => {
    const memoItems: Array<T | AllRepo> = []
    memoItems.push(...filteredRepos)
    const hiddenSelectedItems = selected.filter(item => memoItems.every(memoItem => memoItem.name !== item.name)) || []
    memoItems.push(...hiddenSelectedItems)
    if (selectAllOption) {
      memoItems.push({name: '$all$', _all: true} as AllRepo)
    }
    return memoItems
  }, [filteredRepos, selectAllOption, selected])

  let buttonText = _buttonText
  let buttonIcon = RepoIcon
  if (!buttonText) {
    if (selectionVariant === 'multiple') {
      buttonText =
        selected.length > 0 ? `${selected.length} repositor${selected.length > 1 ? 'ies' : 'y'}` : 'Select repositories'
    } else {
      if (selected.length > 0 && selected[0]) {
        buttonText = selected[0].name
        buttonIcon = selected[0].private ? RepoLockedIcon : RepoIcon
      } else if (selectAllOption) {
        buttonText = 'All repositories'
      } else {
        buttonText = 'Select a repository'
      }
    }
  }

  return (
    <ItemPicker
      renderAnchor={({'aria-labelledby': ariaLabelledBy, ...anchorProps}) => (
        <Button
          leadingVisual={buttonIcon}
          trailingAction={TriangleDownIcon}
          aria-labelledby={` ${ariaLabelledBy}`}
          {...anchorProps}
          {...additionalButtonProps}
        >
          <Truncate title={buttonText} maxWidth={195}>
            {buttonText}
          </Truncate>
        </Button>
      )}
      placeholderText="Repos"
      items={items}
      loading={isLoadingRepos}
      groups={selectAllOption ? [{groupId: 'all'}, {groupId: 'select'}] : []}
      selectionVariant={selectionVariant}
      initialSelectedItems={selected}
      onSelectionChange={selectRepos as (v: unknown[]) => void}
      filterItems={setFilterText}
      getItemKey={getItemKey}
      convertToItemProps={convertToItemProps}
    />
  )
}

export function simpleRepoLoader<T extends NamedRepository>(repos: T[]): (q: string) => Promise<T[]> {
  return async (q: string) => {
    const trimmedFilterText = q.trim().toLowerCase()

    if (!trimmedFilterText) {
      return repos
    }

    return repos.filter(
      repo =>
        repo.name.toLowerCase().includes(trimmedFilterText) || repo.name.toLowerCase().includes(trimmedFilterText),
    )
  }
}
