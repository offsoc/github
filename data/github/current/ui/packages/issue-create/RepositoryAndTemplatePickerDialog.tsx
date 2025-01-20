import {RepositoryPicker} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'

import {Suspense, useId} from 'react'
import {graphql, type PreloadedQuery} from 'react-relay'
import {TemplateListPane} from './TemplateListPane'
import type {IssueCreatePayload} from './utils/model'
import {TemplateListLoading} from './TemplateList'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'

export const RepositoryTemplates = graphql`
  query RepositoryAndTemplatePickerDialogQuery($id: ID!) {
    node(id: $id) {
      ... on Repository {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads This will be fixed once the itempickers are not using @inline
        ...RepositoryPickerRepositoryIssueTemplates
      }
    }
  }
`

export type RepositoryAndTemplatePickerDialogProps = {
  repository: Repository | undefined
  setRepository: (repository: Repository | undefined) => void
  topReposQueryRef: PreloadedQuery<RepositoryPickerTopRepositoriesQuery>
  organization?: string
  onTemplateSelected: (template: IssueCreatePayload) => void
}

export function RepositoryAndTemplatePickerDialog({
  repository,
  setRepository,
  topReposQueryRef,
  organization,
  onTemplateSelected,
}: RepositoryAndTemplatePickerDialogProps) {
  const {optionConfig} = useIssueCreateConfigContext()
  const descriptionId = useId()
  const repoLeftMargin = optionConfig.insidePortal ? `ml-3` : `ml-0`

  return (
    <div className={optionConfig.insidePortal ? 'pt-2' : ''}>
      <Field className={repoLeftMargin} name="Repository" />
      <div className={`${optionConfig.insidePortal ? `mb-2` : `mb-3`} ${repoLeftMargin}`}>
        <RepositoryPicker
          aria-describedby={descriptionId}
          initialRepository={repository}
          onSelect={setRepository}
          organization={organization}
          topReposQueryRef={topReposQueryRef}
          focusRepositoryPicker={true}
          enforceAtleastOneSelected={true}
          options={{hasIssuesEnabled: true}}
        />
      </div>
      <Suspense fallback={<TemplateListLoading />}>
        {repository && (
          <TemplateListPane
            repository={repository}
            onTemplateSelected={onTemplateSelected}
            descriptionId={descriptionId}
          />
        )}
      </Suspense>
    </div>
  )
}

function Field({name, className}: {name: string; className?: string}) {
  return (
    <div className={`pt-1 pb-1 ${className}`}>
      <span className={'text-bold'}>{name}</span>
      <span className={'ml-1 mb-1 fgColor-danger'}>*</span>
    </div>
  )
}
