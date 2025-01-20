import {CurrentRepository, RepositoryIssueTemplatesFragment} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'

import type {RepositoryPickerRepositoryIssueTemplates$key} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import {ActionList, ActionMenu} from '@primer/react'
import {type PreloadedQuery, readInlineData, usePreloadedQuery} from 'react-relay'
import {BlankIssueItem} from './IssueTemplateItem'
import {getBlankIssue} from './utils/model'
import {TemplateList, type TemplateListSelectedProp} from './TemplateList'

type IssueTemplatePickerProps = {
  currentRepoQueryRef: PreloadedQuery<RepositoryPickerCurrentRepoQuery> | null | undefined
} & TemplateListSelectedProp

export const IssueTemplatePicker = ({
  currentRepoQueryRef,
  onTemplateSelected,
}: IssueTemplatePickerProps): JSX.Element => {
  if (!currentRepoQueryRef) return <BlankIssueTemplatePicker onTemplateSelected={onTemplateSelected} />
  return (
    <IssueTemplateInternalPicker currentRepoQueryRef={currentRepoQueryRef} onTemplateSelected={onTemplateSelected} />
  )
}

const IssueTemplateInternalPicker = ({
  currentRepoQueryRef,
  onTemplateSelected,
}: IssueTemplatePickerProps): JSX.Element => {
  const preloadedData = usePreloadedQuery<RepositoryPickerCurrentRepoQuery>(CurrentRepository, currentRepoQueryRef!)

  const templates =
    preloadedData.repository !== undefined
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<RepositoryPickerRepositoryIssueTemplates$key>(
          RepositoryIssueTemplatesFragment,
          preloadedData.repository,
        )
      : null

  if (!templates) {
    return <BlankIssueTemplatePicker onTemplateSelected={onTemplateSelected} />
  }

  return (
    <ActionMenu.Overlay width="medium" align="end">
      <TemplateList templates={templates} onTemplateSelected={onTemplateSelected} />
    </ActionMenu.Overlay>
  )
}

const BlankIssueTemplatePicker = ({
  onTemplateSelected,
}: Pick<IssueTemplatePickerProps, 'onTemplateSelected'>): JSX.Element => {
  return (
    <ActionMenu.Overlay width="medium" align="end">
      <ActionList>
        <BlankIssueItem key={'blank-issue'} onTemplateSelected={() => onTemplateSelected(getBlankIssue())} />
      </ActionList>
    </ActionMenu.Overlay>
  )
}
