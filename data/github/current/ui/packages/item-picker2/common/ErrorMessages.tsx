import {Link} from '@primer/react'
import {SelectPanel, type SelectPanelProps} from '@primer/react/drafts'

type ItemsType =
  | 'assignees'
  | 'labels'
  | 'milestones'
  | 'projects'
  | 'repositories'
  | 'pull requests'
  | 'branches'
  | 'pull requests and branches'

export const ContactSupportMessage = () => (
  <>
    Try again or if the problem persists,{' '}
    <Link inline href="/support">
      contact support
    </Link>
  </>
)

export const ItemPickerDoesNotExistErrorFullMessage = ({itemsType}: {itemsType: ItemsType}) => (
  <SelectPanel.Message variant="error" size="full" title={`One or more ${itemsType} do not exist.`}>
    <ContactSupportMessage />
  </SelectPanel.Message>
)

export const ItemPickerErrorLoadingFullMessage = ({itemsType}: {itemsType: ItemsType}) => (
  <SelectPanel.Message variant="error" size="full" title={`We couldn't load the ${itemsType}.`}>
    <ContactSupportMessage />
  </SelectPanel.Message>
)

export const ItemPickerErrorLoadingInlineMessage = ({itemsType}: {itemsType: ItemsType}) => (
  <SelectPanel.Message variant="error" size="inline">
    {`We couldn't load the ${itemsType}. `}
    <ContactSupportMessage />
  </SelectPanel.Message>
)

export const SelectPanelWithErrorMessage = ({
  title,
  itemsType,
  ...props
}: {title: string; itemsType: ItemsType} & Omit<SelectPanelProps, 'children'>) => (
  <SelectPanel open title={title} {...props}>
    <ItemPickerErrorLoadingFullMessage itemsType={itemsType} />
  </SelectPanel>
)
