import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import {PencilIcon, RepoIcon} from '@primer/octicons-react'
import {Button, Text} from '@primer/react'
import type {IssueCreatePayload} from './utils/model'
import {useEffect, useRef} from 'react'
import {LABELS} from './constants/labels'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {DisplayMode} from './utils/display-mode'

export type TemplatePickerButtonProps = {
  repository: Repository | undefined
  template: IssueCreatePayload | undefined
}

export function TemplatePickerButton({repository, template}: TemplatePickerButtonProps) {
  const {setDisplayMode} = useIssueCreateConfigContext()
  const templateText = template ? template.name : LABELS.blankIssueName
  const templatePickerButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    templatePickerButtonRef.current?.focus()
  }, [])

  return (
    <div>
      <Button
        onClick={() => setDisplayMode(DisplayMode.TemplatePicker)}
        leadingVisual={RepoIcon}
        trailingVisual={PencilIcon}
        ref={templatePickerButtonRef}
      >
        {repository && (
          <span>
            {templateText} <Text sx={{fontWeight: 'light'}}>in</Text> {repository.owner.login}/{repository.name}
          </span>
        )}
        {!repository && <>Select a repository</>}
      </Button>
    </div>
  )
}
