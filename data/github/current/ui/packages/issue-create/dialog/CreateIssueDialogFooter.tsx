import {Dialog, type DialogProps} from '@primer/react/experimental'
import {useIssueCreateConfigContext} from '../contexts/IssueCreateConfigContext'
import {TemplateListPaneFooter} from '../TemplateListPaneFooter'
import {useIssueCreateDataContext} from '../contexts/IssueCreateDataContext'
import {DisplayMode} from '../utils/display-mode'
import {CreateIssueFooter} from '../CreateIssueFooter'
import {repoHasAvailableTemplates} from '../utils/model'

type CreateIssueDialogFooterProps = {
  onClose: () => void
} & DialogProps

export const CreateIssueDialogFooter = ({onClose, ...props}: CreateIssueDialogFooterProps) => {
  const {displayMode} = useIssueCreateConfigContext()
  const {repository, templates} = useIssueCreateDataContext()

  const showTemplateFooter = displayMode === DisplayMode.TemplatePicker && repository && templates
  const showCreateIssueFooter = !showTemplateFooter && displayMode === DisplayMode.IssueCreation

  if (
    (!showTemplateFooter && !showCreateIssueFooter) ||
    (showTemplateFooter && !repoHasAvailableTemplates(templates))
  ) {
    return null
  }

  if (showTemplateFooter) {
    return (
      <Dialog.Footer sx={{justifyContent: 'flex-start'}}>
        <TemplateListPaneFooter repository={repository} templates={templates} />
      </Dialog.Footer>
    )
  } else {
    return (
      <Dialog.Footer>
        <CreateIssueFooter onClose={onClose} {...props} />
      </Dialog.Footer>
    )
  }
}
