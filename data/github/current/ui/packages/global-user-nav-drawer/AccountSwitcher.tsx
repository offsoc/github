import {ActionMenu, ActionList, IconButton, Spinner} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {ArrowSwitchIcon, PersonAddIcon, SignOutIcon} from '@primer/octicons-react'
import {Tooltip} from '@primer/react/next'
import {useId, useState, useMemo} from 'react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useLocation} from 'react-router-dom'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import type {SetError} from './ErrorDialog'

export interface StashedAccount {
  login: string
  name: string
  avatarUrl: string
  userSessionId: number | null
}

type ActiveAccount = StashedAccount & {userSessionId: number}

export interface AccountSwitcherProps {
  addAccountPath: string
  canAddAccount: boolean
  switchAccountPath: string
  loginAccountPath: string
  stashedAccounts: StashedAccount[] | null
  setError: SetError
}

export function AccountSwitcher({
  addAccountPath,
  canAddAccount,
  switchAccountPath,
  stashedAccounts,
  loginAccountPath,
  setError,
}: AccountSwitcherProps) {
  const toolTipId = `account-switcher-tooltip-id-${useId()}`
  const [isOpen, setIsOpen] = useState(false)
  const isLoading = stashedAccounts === null
  const hasAccounts = !isLoading && stashedAccounts.length > 0

  return (
    <ActionMenu open={isOpen} onOpenChange={setIsOpen}>
      <ActionMenu.Anchor>
        <Tooltip text="Account switcher" type="label" id={toolTipId}>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={ArrowSwitchIcon}
            aria-labelledby={toolTipId}
            variant="invisible"
          />
        </Tooltip>
      </ActionMenu.Anchor>
      {isLoading ? (
        <AccountSwitcherOverlayLoading />
      ) : hasAccounts ? (
        <AccountSwitcherOverlayHasAccounts
          stashedAccounts={stashedAccounts}
          canAddAccount={canAddAccount}
          addAccountPath={addAccountPath}
          switchAccountPath={switchAccountPath}
          loginAccountPath={loginAccountPath}
          setError={setError}
        />
      ) : (
        <AccountSwitcherOverlayEmpty addAccountPath={addAccountPath} />
      )}
    </ActionMenu>
  )
}

function AccountSwitcherOverlayLoading() {
  return (
    <ActionMenu.Overlay align="end">
      <ActionList>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <Spinner size="small" />
          </ActionList.LeadingVisual>
          Loading...
        </ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  )
}

function AccountSwitcherOverlayEmpty({addAccountPath}: {addAccountPath: string}) {
  return (
    <ActionMenu.Overlay align="end">
      <ActionList>
        <AddAccountLinkItem href={addAccountPath} />
      </ActionList>
    </ActionMenu.Overlay>
  )
}

function AddAccountLinkItem({href, inactive}: {href?: string; inactive?: string}) {
  return (
    <ActionList.LinkItem href={href || undefined} inactiveText={inactive || undefined}>
      <ActionList.LeadingVisual>
        <PersonAddIcon />
      </ActionList.LeadingVisual>
      Add account
    </ActionList.LinkItem>
  )
}

function AccountSwitcherOverlayHasAccounts({
  addAccountPath,
  canAddAccount,
  switchAccountPath,
  stashedAccounts,
  loginAccountPath,
  setError,
}: AccountSwitcherProps & {stashedAccounts: NonNullable<AccountSwitcherProps['stashedAccounts']>}) {
  return (
    <ActionMenu.Overlay align="end" width="small">
      <ActionList>
        <ActionList.Group>
          <ActionList.GroupHeading>Switch account</ActionList.GroupHeading>
          {stashedAccounts.map(account =>
            isActiveAccount(account) ? (
              <StashedAccountItem
                switchAccountPath={switchAccountPath}
                account={account}
                setError={setError}
                key={account.login}
              />
            ) : (
              <InactiveStashedAccountItem loginAccountPath={loginAccountPath} account={account} key={account.login} />
            ),
          )}
          <ActionList.Divider />
        </ActionList.Group>
        <AddAccountLinkItem
          href={canAddAccount ? addAccountPath : undefined}
          inactive={canAddAccount ? undefined : 'Maximum accounts reached'}
        />
        <ActionList.LinkItem href="/logout">
          <ActionList.LeadingVisual>
            <SignOutIcon />
          </ActionList.LeadingVisual>
          Sign out...
        </ActionList.LinkItem>
      </ActionList>
    </ActionMenu.Overlay>
  )
}

function isActiveAccount(account: StashedAccount): account is ActiveAccount {
  return typeof account.userSessionId === 'number'
}

function StashedAccountItem({
  account,
  switchAccountPath,
  setError,
}: {
  account: ActiveAccount
  switchAccountPath: string
  setError: SetError
}) {
  return (
    <>
      <ActionList.Item onSelect={() => switchAccount(switchAccountPath, account.userSessionId, setError)}>
        <ActionList.LeadingVisual>
          <GitHubAvatar src={account.avatarUrl} size={20} />
        </ActionList.LeadingVisual>
        {account.login}
        <ActionList.Description>{account.name}</ActionList.Description>
      </ActionList.Item>
    </>
  )
}

function InactiveStashedAccountItem({account, loginAccountPath}: {account: StashedAccount; loginAccountPath: string}) {
  const location = useLocation()
  const href = useMemo(() => {
    const url = new URL(loginAccountPath, ssrSafeLocation.toString())
    url.searchParams.set('login', account.login)
    url.searchParams.set('return_to', ssrSafeLocation.toString())
    return url.toString()
    // I want the location.key here in order to recompute on location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginAccountPath, account.login, location.key])

  return (
    <ActionList.LinkItem href={href}>
      <ActionList.LeadingVisual>
        <GitHubAvatar src={account.avatarUrl} size={20} className="inactive-user-avatar" />
      </ActionList.LeadingVisual>
      {account.login}
      <ActionList.Description>{account.name}</ActionList.Description>
    </ActionList.LinkItem>
  )
}

async function switchAccount(switchAccountPath: string, userSessionId: number, setError: SetError) {
  try {
    const body = new FormData()
    body.append('user_session_id', String(userSessionId))
    body.append('from', 'nav_panel')
    const response = await verifiedFetch(switchAccountPath, {
      method: 'POST',
      body,
      headers: {
        Accept: 'application/json',
      },
    })
    if (response.ok) {
      window.location.reload()
    } else {
      const {error, reason} = await response.json()
      setError(errorProps(error, reason))
    }
  } catch (error) {
    setError(errorProps('An error occurred while switching accounts. Please try again.'))
  }
}

function errorProps(error: string, reason?: string): Parameters<SetError>[0] {
  const msg =
    reason === 'enterprise access denied' ? (
      <Blankslate.Description>{error}</Blankslate.Description>
    ) : (
      <>
        <Blankslate.Heading>Unable to switch to the selected account.</Blankslate.Heading>
        <Blankslate.Description>
          Please try again. If the issue persists, try adding the account again.
        </Blankslate.Description>
      </>
    )
  return {
    title: 'Switch account',
    error: msg,
  }
}
