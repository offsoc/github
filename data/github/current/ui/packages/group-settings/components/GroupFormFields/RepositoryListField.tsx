import {useCallback, useMemo} from 'react'
import {Blankslate} from '@primer/react/experimental'
import {ReposSelector} from '@github-ui/repos-selector'
import {useFormField} from '../../hooks/use-form-field'
import type {FieldComponentProps, Group, Repository} from '../../types'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {useGroupTreeContext} from '../../contexts/GroupTreeContext'
import {RecursiveGroup} from '../RecursiveGroup'
import {useBasePath} from '../../contexts/BasePathContext'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {clsx} from 'clsx'
import styles from './RepositoryListField.module.css'

type RepositoryListFieldProps = FieldComponentProps<Repository[]> & {
  group?: Group
}

export function RepositoryListField({initialValue, group}: RepositoryListFieldProps) {
  const basePath = useBasePath()
  const field = useFormField('repositories', initialValue || [])
  const {walkTree} = useGroupTreeContext()
  const subTree = useMemo(() => {
    if (!group) {
      return {
        repos: field.value,
      }
    }
    return {
      ...walkTree(group.id),
      repos: field.value,
    }
  }, [group, walkTree, field.value])

  const queryForRepos = useCallback(
    async (query: string) => {
      const response = await verifiedFetchJSON(`${basePath}/suggestions/repositories?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        return (await response).json()
      }
      return []
    },
    [basePath],
  )

  const addRepositories = useCallback(
    (repos?: Repository[]) => {
      if (repos) {
        field.update(repos)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.update, field.value],
  )

  const removeRepository = useCallback(
    (id: number) => {
      const repoIndex = field.value.findIndex(repo => repo.id === id)
      if (repoIndex !== -1) {
        field.update([...field.value.slice(0, repoIndex), ...field.value.slice(repoIndex + 1)])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.update, field.value],
  )

  const totalCount = (subTree?.total_count || 0) - (initialValue?.length || 0) + (subTree?.repos.length || 0)
  const title = subTree ? `${totalCount} repositor${totalCount === 1 ? 'y' : 'ies'}` : 'Repositories'

  return (
    <div className={styles.listViewWrapper}>
      <ListView
        title="List of repositories"
        variant="default"
        pluralUnits="repositories"
        singularUnits="repository"
        itemsListClassName={styles.listViewItems}
        metadata={
          <ListViewMetadata title={<span className="text-bold">{title}</span>}>
            <ReposSelector<Repository>
              currentSelection={field.value}
              repositoryLoader={queryForRepos}
              selectionVariant="multiple"
              selectAllOption={false}
              onSelect={addRepositories}
              buttonText="Add repositories"
            />
          </ListViewMetadata>
        }
        totalCount={field.value.length}
      >
        {subTree.repos.length > 0 ? (
          <RecursiveGroup
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            tree={subTree}
            collapse
            hideGroupActions
            showTopLevelRepos
            onRemoveRepository={removeRepository}
          />
        ) : (
          <li className={clsx('Box-body', styles.blankslate)}>
            <Blankslate>
              <Blankslate.Heading as="h3">No repositories in this group</Blankslate.Heading>
            </Blankslate>
          </li>
        )}
      </ListView>
    </div>
  )
}
