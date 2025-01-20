import {type PreloadedQuery, readInlineData, usePreloadedQuery, useQueryLoader} from 'react-relay'
import TemplatePickerRepositoryTemplatesRequest, {
  type RepositoryAndTemplatePickerDialogQuery,
} from './__generated__/RepositoryAndTemplatePickerDialogQuery.graphql'
import type {
  RepositoryPickerRepositoryIssueTemplates$key,
  RepositoryPickerRepositoryIssueTemplates$data as Templates,
} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import {RepositoryIssueTemplatesFragment} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import {useEffect} from 'react'
import {NoTemplates, TemplateList, TemplateListLoading, type TemplateListSelectedProp} from './TemplateList'
import {TemplateListPaneFooter} from './TemplateListPaneFooter'
import {InfoIcon} from '@primer/octicons-react'
import {LABELS} from './constants/labels'
import {RepositoryTemplates} from './RepositoryAndTemplatePickerDialog'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {useIssueCreateDataContext} from './contexts/IssueCreateDataContext'
import styles from './TemplateListPane.module.css'

type TemplateListPaneProps = {
  templates?: Templates
} & TemplateListPaneSharedProps

type TemplateListPaneFromQueryProps = {
  queryRef: PreloadedQuery<RepositoryAndTemplatePickerDialogQuery>
} & TemplateListPaneSharedProps

type TemplateListPaneInternalProps = {
  templates: Templates
} & TemplateListPaneSharedProps

type TemplateListPaneSharedProps = {
  repository: Repository
  /** Id to use on validation messages
   *
   * `TemplateListPane` might be used with a repository that has issues disabled or has no templates available.
   * When this is the case, a message is shown and rendered with the id passed in this property.
   *
   * Consumers can then use this id in conjuction with an `aria-describedby` to ensure their control is properly
   * described with the message and accessible.
   */
  descriptionId?: string
} & TemplateListSelectedProp

export function TemplateListPane({templates, ...props}: TemplateListPaneProps) {
  if (templates) {
    return <TemplateListInternal templates={templates} {...props} />
  }

  return <TemplateListPaneFromRepo {...props} />
}

function TemplateListPaneFromRepo({repository, ...props}: TemplateListPaneSharedProps) {
  const [queryRef, loadTemplates] = useQueryLoader<RepositoryAndTemplatePickerDialogQuery>(
    TemplatePickerRepositoryTemplatesRequest,
  )

  useEffect(() => {
    if (repository) {
      loadTemplates({id: repository.id})
    }
  }, [loadTemplates, repository])

  if (!queryRef) return <TemplateListLoading />

  return <TemplateListPaneFromQuery repository={repository} queryRef={queryRef} {...props} />
}

function TemplateListPaneFromQuery({queryRef, ...props}: TemplateListPaneFromQueryProps) {
  const preloadedData = usePreloadedQuery<RepositoryAndTemplatePickerDialogQuery>(RepositoryTemplates, queryRef)
  const {setTemplates} = useIssueCreateDataContext()

  const templates =
    preloadedData.node !== undefined
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<RepositoryPickerRepositoryIssueTemplates$key>(
          RepositoryIssueTemplatesFragment,
          preloadedData.node,
        )
      : null

  useEffect(() => {
    setTemplates(templates ?? undefined)
  }, [setTemplates, templates])

  if (!templates) {
    return <NoTemplates id={props.descriptionId} />
  }

  return <TemplateListInternal templates={templates} {...props} />
}

function TemplateListInternal({repository, templates, descriptionId, ...props}: TemplateListPaneInternalProps) {
  const {optionConfig} = useIssueCreateConfigContext()
  const {insidePortal} = optionConfig

  return (
    <div>
      {!repository.hasIssuesEnabled && (
        <div className={`${styles.disabledStateGap} d-flex flex-row flex-items-center m-3`}>
          <InfoIcon />
          <span id={descriptionId}>{LABELS.issuesDisabledForRepo}</span>
        </div>
      )}
      {repository.hasIssuesEnabled && (
        <>
          <TemplateList
            templates={templates}
            {...props}
            className={`${
              !insidePortal
                ? `border borderColor-muted rounded-2 overflow-hidden
                  ${optionConfig.showRepositoryPicker ? 'pt-0 mt-0' : 'py-2 mt-2'}`
                : ``
            }`}
          />
          {!insidePortal && <TemplateListPaneFooter repository={repository} templates={templates} />}
        </>
      )}
    </div>
  )
}
