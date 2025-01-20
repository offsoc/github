import {ActionList, type SxProp} from '@primer/react'
import {BlankIssueItem, IssueTemplateItem, ExternalLinkTemplateItem, SecurityPolicyItem} from './IssueTemplateItem'
import type {RepositoryPickerRepositoryIssueTemplates$data as Templates} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import {getBlankIssue, getIssueTemplate, repoHasAvailableTemplates, type IssueCreatePayload} from './utils/model'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {LABELS} from './constants/labels'
import {TEST_IDS} from './constants/test-ids'
import {newTemplateAbsolutePath} from './utils/urls'
import {useIssueCreateDataContext} from './contexts/IssueCreateDataContext'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {DisplayMode} from './utils/display-mode'
import styles from './TemplateList.module.css'

type TemplateListProps = {
  templates: Templates
  className?: string
} & TemplateListSelectedProp &
  SxProp

export type TemplateListSelectedProp = {
  onTemplateSelected: (template: IssueCreatePayload) => void
}

export function TemplateList({templates, onTemplateSelected, className}: TemplateListProps) {
  const {repositoryAbsolutePath} = useIssueCreateDataContext()
  const {optionConfig, displayMode} = useIssueCreateConfigContext()

  if (!repoHasAvailableTemplates(templates) && !templates.isBlankIssuesEnabled) {
    return <NoTemplates />
  }

  const templateContent = (
    <>
      {templates.issueForms &&
        templates.issueForms.map(form => (
          <IssueTemplateItem
            id={form.__id}
            link={newTemplateAbsolutePath({repositoryAbsolutePath, fileName: form.filename})}
            key={`issue_forms.${form.name}`}
            onTemplateSelected={() => onTemplateSelected(getIssueTemplate(form))}
            name={form.name}
            about={form.description}
          />
        ))}
      {templates.issueTemplates &&
        templates.issueTemplates.map(template => (
          <IssueTemplateItem
            id={template.__id}
            link={newTemplateAbsolutePath({repositoryAbsolutePath, fileName: template.filename})}
            key={`issue_templates.${template.name}`}
            onTemplateSelected={() => onTemplateSelected(getIssueTemplate(template))}
            name={template.name}
            about={template.about}
          />
        ))}
      {templates.isBlankIssuesEnabled && (
        <BlankIssueItem key="blank_issue" onTemplateSelected={() => onTemplateSelected(getBlankIssue())} />
      )}
      {templates.isSecurityPolicyEnabled && (
        <SecurityPolicyItem key="security_policy" link={templates.securityPolicyUrl} />
      )}
      {templates.contactLinks &&
        templates.contactLinks.map(link => (
          <ExternalLinkTemplateItem
            id={link.__id}
            key={`contact_links.${link.name}`}
            name={link.name}
            about={link.about}
            link={link.url}
          />
        ))}
    </>
  )

  return (
    <ActionList className={className} data-testid={TEST_IDS.templateList} showDividers variant={'inset'}>
      {optionConfig.showRepositoryPicker && displayMode === DisplayMode.TemplatePicker ? (
        <ActionList.Group>
          <ActionList.GroupHeading
            as={'h2'}
            variant="filled"
            className={`position-sticky top-0 x ${!optionConfig.insidePortal && 'border-top-0'} ${
              styles.templateHeader
            }`}
          >
            {LABELS.templatesFormsTitle}
          </ActionList.GroupHeading>
          {templateContent}
        </ActionList.Group>
      ) : (
        templateContent
      )}
    </ActionList>
  )
}

export function TemplateListLoading() {
  const loadingSkeletonWidths = ['220px', '250px', '290px', '210px']
  const {optionConfig} = useIssueCreateConfigContext()

  return (
    <div className={`${styles.skeletonContainer} ${optionConfig.insidePortal && 'ml-3'}`}>
      {loadingSkeletonWidths.map((width, index) => (
        <LoadingSkeleton key={index} variant="rounded" height="xl" width={width} />
      ))}
    </div>
  )
}

export function NoTemplates({id}: {id?: string}) {
  return <span id={id}>{LABELS.noTemplates}</span>
}
