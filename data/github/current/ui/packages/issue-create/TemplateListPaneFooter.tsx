import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerRepositoryIssueTemplates$data as Templates} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import styles from './TemplateListPaneFooter.module.css'
import {Link} from '@primer/react'
import {LABELS} from './constants/labels'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {repoHasAvailableTemplates} from './utils/model'
import {clsx} from 'clsx'

type TemplateListPaneFooterProps = {
  repository: Repository
  templates: Templates
}

export const TemplateListPaneFooter = ({repository, templates}: TemplateListPaneFooterProps) => {
  const {optionConfig} = useIssueCreateConfigContext()
  const canIssueType =
    repository.viewerIssueCreationPermissions.typeable && repository.viewerIssueCreationPermissions.triageable

  if (!repoHasAvailableTemplates(templates)) {
    return null
  }

  const hyperlinkText = repository.viewerCanPush ? LABELS.editTemplates : LABELS.viewTemplates

  return (
    <div className={clsx({[styles.fullscreen]: !optionConfig.insidePortal})}>
      {canIssueType && <span>You can now add issue types to your forms and templates! </span>}
      <Link href={templates.templateTreeUrl} className={styles.link}>
        {hyperlinkText}
      </Link>
    </div>
  )
}
