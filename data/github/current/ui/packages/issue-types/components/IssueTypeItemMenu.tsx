import type {FC} from 'react'
import {ActionList, ActionMenu, IconButton} from '@primer/react'
import {graphql, useFragment} from 'react-relay'
import type {IssueTypeItemMenuItem$key} from './__generated__/IssueTypeItemMenuItem.graphql'
import {Resources} from '../constants/strings'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {KebabHorizontalIcon} from '@primer/octicons-react'

type IssueTypeItemMenuProps = {
  issueType: IssueTypeItemMenuItem$key
  owner?: string
  toggleIssueType: () => void
  handleDelete: () => void
}

export const IssueTypeItemMenu: FC<IssueTypeItemMenuProps> = ({issueType, owner, toggleIssueType, handleDelete}) => {
  const data = useFragment<IssueTypeItemMenuItem$key>(
    graphql`
      fragment IssueTypeItemMenuItem on IssueType {
        id
        isEnabled
        name
      }
    `,
    issueType,
  )

  const handleSelect = () => {
    if (ssrSafeWindow) ssrSafeWindow.location.href = `/organizations/${owner}/settings/issue-types/${data.id}`
  }

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          data-testid="overflow-menu-anchor"
          aria-label={`open type options for ${data.name}`}
          variant="invisible"
          sx={{color: 'fg.muted'}}
          icon={KebabHorizontalIcon}
          unsafeDisableTooltip={true}
        />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.Item onSelect={handleSelect}>{Resources.editButton}</ActionList.Item>
          <ActionList.Item data-testid={`menu-enable-option-${data.id}`} onSelect={toggleIssueType}>
            {data.isEnabled ? Resources.disableButton : Resources.enableButton}
          </ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item data-testid={`menu-delete-option-${data.id}`} onSelect={handleDelete} variant="danger">
            {Resources.deleteButton}
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
