import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionMenu, ActionList} from '@primer/react'

export interface Accounts {
  [login: string]: {
    avatarUrl: string
    isOrganization: boolean
  }
}

export interface AccountFilterProps {
  accounts: Accounts
  accountFilter: string
  setAccountFilter: (account: string) => void
}

export function AccountFilter({accounts, accountFilter, setAccountFilter}: AccountFilterProps) {
  const onAccountChange = (event: React.UIEvent, account: string) => {
    setAccountFilter(account)
  }

  return (
    <ActionMenu>
      <ActionMenu.Button aria-label={`Explore as: ${accountFilter}`} {...testIdProps('account-button')}>
        <GitHubAvatar src={accounts[accountFilter]?.avatarUrl || ''} />
        <span className="pl-2">{accountFilter}</span>
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single" role="listbox">
          {Object.entries(accounts).map(([k]) => (
            <ActionList.Item
              key={k}
              role="option"
              selected={k === accountFilter}
              aria-selected={k === accountFilter}
              onSelect={event => {
                onAccountChange(event, k)
              }}
              {...testIdProps(`account-${k}`)}
            >
              <GitHubAvatar src={accounts[k]?.avatarUrl || ''} />
              <span className="pl-2">{k}</span>
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
