import type {FC} from 'react'
import {ActionList, ActionMenu} from '@primer/react'
import {CalendarIcon, RowsIcon} from '@primer/octicons-react'
import {useViewPreferenceContext} from '../contexts'
import {NotificationViewPreferenceEnum} from '../notifications/constants/settings'

const InboxViewPreferenceToggle: FC = () => {
  const {viewPreference, updateViewPreference} = useViewPreferenceContext()
  return (
    <ActionMenu>
      <ActionMenu.Button
        leadingVisual={viewPreference === NotificationViewPreferenceEnum.DATE ? CalendarIcon : RowsIcon}
      >
        {viewPreference === NotificationViewPreferenceEnum.DATE ? 'Date' : 'Repository'}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          <ActionList.Item
            onSelect={() => updateViewPreference(NotificationViewPreferenceEnum.DATE)}
            selected={viewPreference === NotificationViewPreferenceEnum.DATE}
          >
            <ActionList.LeadingVisual>
              <CalendarIcon />
            </ActionList.LeadingVisual>
            Group by date
          </ActionList.Item>
          <ActionList.Item
            onSelect={() => updateViewPreference(NotificationViewPreferenceEnum.GROUP_BY_REPO)}
            selected={viewPreference === NotificationViewPreferenceEnum.GROUP_BY_REPO}
          >
            <ActionList.LeadingVisual>
              <RowsIcon />
            </ActionList.LeadingVisual>
            Group by repository
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

export default InboxViewPreferenceToggle
