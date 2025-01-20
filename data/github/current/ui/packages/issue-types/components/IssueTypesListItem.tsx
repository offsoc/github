import {Label} from '@primer/react'
import {type FC, useCallback, useRef, useState} from 'react'
import {IssueTypeItemMenu} from './IssueTypeItemMenu'
import {graphql, useFragment} from 'react-relay'
import type {IssueTypesListItem$key} from './__generated__/IssueTypesListItem.graphql'
import {DisableOrganizationConfirmationDialog} from './DisableOrganizationConfirmationDialog'
import {DeletionConfirmationDialog} from './DeletionConfirmationDialog'
import {useEnableDisableIssueType} from '../hooks/use-enable-disable-issue-type'
import {useIssueTypesAnalytics} from '../hooks/use-issue-types-analytics'
import {Resources} from '../constants/strings'
import styles from './IssueTypesListItem.module.css'
import {IssueTypeToken} from '@github-ui/issue-type-token'

type IssueTypesListItemProps = {
  issueType: IssueTypesListItem$key
  hasActions: boolean
  owner: string
  repositoryId?: string
}

export const IssueTypesListItem: FC<IssueTypesListItemProps> = ({issueType, hasActions, owner}) => {
  const data = useFragment<IssueTypesListItem$key>(
    graphql`
      fragment IssueTypesListItem on IssueType {
        id
        name
        isEnabled
        isPrivate
        description
        color
        ...DisableOrganizationConfirmationDialogIssueType
        ...DeletionConfirmationDialogIssueType
        ...IssueTypeItemMenuItem
      }
    `,
    issueType,
  )

  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState<boolean>(false)
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState<boolean>(false)
  const {enableOrganizationIssueType} = useEnableDisableIssueType()
  const {sendIssueTypesAnalyticsEvent} = useIssueTypesAnalytics()
  const anchorIconRef = useRef<HTMLButtonElement>(null)

  const getTypeTokenTooltipText = (isTruncated: boolean) => (isTruncated ? data.name : undefined)

  const onToggleClick = useCallback(() => {
    if (data.isEnabled) {
      setIsDisableDialogOpen(true)
    } else {
      sendIssueTypesAnalyticsEvent('org_issue_type.enable', 'ORG_ISSUE_TYPE_LIST_ITEM_MENU_OPTION', {
        issueTypeId: data.id,
      })
      enableOrganizationIssueType(data.id)
    }
  }, [data.id, data.isEnabled, enableOrganizationIssueType, sendIssueTypesAnalyticsEvent])

  return (
    <li
      data-testid={data.id}
      className={`${styles.itemContainer} flex-md-nowrap`}
      aria-label={Resources.ariaLabel.issueTypeListItem(data.name)}
    >
      <div className={styles.itemTokenWrapper}>
        <IssueTypeToken
          name={data.name}
          color={data.color}
          getTooltipText={getTypeTokenTooltipText}
          href={`/organizations/${owner}/settings/issue-types/${data.id}`}
        />
      </div>
      {data.description && (
        <span className={`${styles.itemDescription} ${(!data.isEnabled || data.isPrivate) && styles.spacer}`}>
          {data.description}
        </span>
      )}
      {(!data.isEnabled || data.isPrivate) && (
        <div className={styles.itemMetadataWrapper}>
          <>
            {!data.isEnabled && <Label>Disabled</Label>}
            {data.isPrivate && <Label>Private</Label>}
          </>
        </div>
      )}
      <div className={styles.actionsWrapper}>
        {hasActions && (
          <IssueTypeItemMenu
            issueType={data}
            toggleIssueType={onToggleClick}
            handleDelete={() => setIsDeletionDialogOpen(true)}
            owner={owner || ''}
          />
        )}
      </div>
      {isDisableDialogOpen && (
        <DisableOrganizationConfirmationDialog
          closeDialog={() => setIsDisableDialogOpen(false)}
          issueType={data}
          returnFocusRefDisable={anchorIconRef}
        />
      )}
      {owner && isDeletionDialogOpen && (
        <DeletionConfirmationDialog
          owner={owner}
          closeDialog={() => setIsDeletionDialogOpen(false)}
          issueType={data}
          returnFocusRefDeletion={anchorIconRef}
        />
      )}
    </li>
  )
}
