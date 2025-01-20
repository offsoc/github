import {IssueTypePicker, type IssueType, DefaultIssueTypeAnchor} from '@github-ui/item-picker/IssueTypePicker'
import {useIssueCreateDataContext} from './contexts/IssueCreateDataContext'
import {Suspense, useCallback, useRef, useState} from 'react'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {Button, FormControl, Tooltip} from '@primer/react'
import {LABELS} from './constants/labels'
import {IssueTypePermissionDialog} from './dialog/IssueTypePermissionDialog'

type IssueTypeSelectorProps = {
  repo: string
  owner: string
  canIssueType: boolean
}

export const IssueTypeSelector = ({repo, owner, canIssueType}: IssueTypeSelectorProps) => {
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const permissionDialogRef = useRef(null)
  const {issueType, setIssueType} = useIssueCreateDataContext()

  const {optionConfig} = useIssueCreateConfigContext()
  const sharedConfigProps = {
    insidePortal: optionConfig.insidePortal,
    shortcutEnabled: optionConfig.singleKeyShortcutsEnabled,
  }
  // The preselected issue type name is used for displaying the type name on the picker.
  // It is not actually used to preselect the issue type, since this is coming from memex,
  // and we rely on the addItemToMemex functionality to add the type to the new issue.
  const {scopedIssueType} = optionConfig

  const setIssueTypeCallback = useCallback(
    (issueTypes: IssueType[] | null) => {
      setIssueType(issueTypes?.[0] || null)
    },
    [setIssueType],
  )

  if (!canIssueType) {
    if (issueType === null) return null

    const children = (
      <>
        <Button ref={permissionDialogRef} inactive={true} onClick={() => setIsPermissionDialogOpen(true)} sx={{mt: 1}}>
          {issueType.name}
        </Button>
        <IssueTypePermissionDialog
          isOpen={isPermissionDialogOpen}
          setIsOpen={setIsPermissionDialogOpen}
          permissionDialogRef={permissionDialogRef}
        />
      </>
    )

    return (
      <FormControl>
        <FormControl.Label as="span" id={LABELS.selectIssueTypeLabel}>
          {LABELS.typePickerLabel}
        </FormControl.Label>
        {isPermissionDialogOpen ? children : <Tooltip text={LABELS.issueTypeReadOnly}>{children}</Tooltip>}
      </FormControl>
    )
  }

  return (
    <Suspense>
      <FormControl>
        <FormControl.Label as="span" id={LABELS.selectIssueTypeLabel}>
          {LABELS.typePickerLabel}
        </FormControl.Label>

        <IssueTypePicker
          repo={repo}
          owner={owner}
          readonly={false}
          activeIssueType={issueType}
          onSelectionChange={setIssueTypeCallback}
          anchorElement={anchorProps => (
            <DefaultIssueTypeAnchor
              readonly={Boolean(scopedIssueType)}
              activeIssueType={issueType}
              anchorProps={anchorProps}
              preselectedIssueTypeName={scopedIssueType}
              {...sharedConfigProps}
            />
          )}
          ariaLabelledBy={LABELS.selectIssueTypeLabel}
          {...sharedConfigProps}
        />
      </FormControl>
    </Suspense>
  )
}
