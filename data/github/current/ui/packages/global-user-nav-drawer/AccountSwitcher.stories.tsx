import {useState} from 'react'
import type {Meta, StoryObj, StoryFn, StoryContext} from '@storybook/react'
import {within} from '@storybook/test'
import {expect} from '@storybook/jest'
import {AccountSwitcher, type AccountSwitcherProps} from './AccountSwitcher'
import {Stack} from '@primer/react/experimental'
import {
  stashedAccounts,
  getUserNavDrawerProps,
  enterpriseAccessVerificationMessage,
  enterpriseAccessReason,
} from './test-utils/mock-data'
import {storyWrapper} from '@github-ui/react-core/test-utils'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import {type ErrorDialogProps, ErrorDialog} from './ErrorDialog'

type Story = StoryObj<typeof AccountSwitcher>

const {addAccountPath, switchAccountPath, loginAccountPath} = getUserNavDrawerProps()

const args = {
  stashedAccounts: [],
  addAccountPath,
  canAddAccount: true,
  switchAccountPath,
  loginAccountPath,
} satisfies Omit<AccountSwitcherProps, 'setError'>

const playOpenMenu: Story['play'] = async ({canvasElement, step}) => {
  const canvas = within(canvasElement)

  await step('open the menu', async () => {
    const menuButton = canvas.getByRole('button', {name: 'Account switcher'})
    expect(menuButton).toBeInTheDocument()
    // TODO: Fix bug and use `userEvent` https://github.com/github/core-ux/issues/248
    await menuButton.click()
    expect(await canvas.findByRole('menu', {name: 'Account switcher'})).toBeInTheDocument()
  })
}

function ErrorDialogDecorator(Story: StoryFn, context: StoryContext<AccountSwitcherProps>) {
  const [error, setError] = useState<ErrorDialogProps | null>(null)
  return (
    <>
      {error && <ErrorDialog {...error} onClose={() => setError(null)} />}
      <Story args={{...context.args, setError}} />
    </>
  )
}

const meta = {
  title: 'Apps/Global Nav/User Nav Drawer/AccountSwitcher',
  component: AccountSwitcher,
  args,
  decorators: [
    Story => (
      <Stack align="center">
        <Story />
      </Stack>
    ),
    ErrorDialogDecorator,
    storyWrapper(),
  ],
  play: playOpenMenu,
} satisfies Meta<typeof AccountSwitcher>

export default meta

export const WithNoStashedAccounts = {
  play: async context => {
    const {canvasElement, step} = context
    await playOpenMenu(context)
    const canvas = within(canvasElement)

    await step('shows no accounts', async () => {
      expect(await canvas.findByRole('menuitem', {name: 'Add account'})).toHaveAttribute('href', args.addAccountPath)
      expect(canvas.queryByRole('menuitem', {name: 'Sign out...'})).not.toBeInTheDocument()
    })
  },
} satisfies Story

export const Loading = {
  args: {
    ...args,
    stashedAccounts: null,
  },
  play: async context => {
    const {canvasElement, step} = context
    await playOpenMenu(context)
    const canvas = within(canvasElement)

    await step('shows loading state', async () => {
      expect(await canvas.findByRole('menuitem', {name: 'Loading...'})).toBeInTheDocument()
    })
  },
} satisfies Story

export const WithStashedAccounts = {
  args: {
    ...args,
    stashedAccounts: stashedAccounts.slice(0, 3),
  },
  play: async context => {
    const {canvasElement, step} = context
    await playOpenMenu(context)
    const canvas = within(canvasElement)

    await step('shows all accounts', async () => {
      for (const account of stashedAccounts.slice(0, 3)) {
        const {login, name} = account
        const accountItem = await canvas.findByRole('menuitem', {name: `${login} ${name}`})
        expect(accountItem).toBeInTheDocument()
        if (account.userSessionId === null) {
          const url = new URL(loginAccountPath, window.location.href)
          url.searchParams.set('login', account.login)
          url.searchParams.set('return_to', window.location.href)
          expect(accountItem).toHaveAttribute('href', url.href)
        }
      }

      expect(canvas.getByRole('menuitem', {name: 'Add account'})).toHaveAttribute('href', args.addAccountPath)
      expect(canvas.getByRole('menuitem', {name: 'Sign out...'})).toHaveAttribute('href', '/logout')
    })
  },
} satisfies Story

export const WithMaximumStashedAccounts = {
  args: {
    ...args,
    canAddAccount: false,
    stashedAccounts,
  },
  play: async context => {
    const {canvasElement, step} = context
    await playOpenMenu(context)
    const canvas = within(canvasElement)

    await step('shows all accounts', async () => {
      for (const account of stashedAccounts) {
        const {login, name} = account
        const accountItem = await canvas.findByRole('menuitem', {name: `${login} ${name}`})
        expect(accountItem).toBeInTheDocument()
        if (account.userSessionId === null) {
          const url = new URL(loginAccountPath, window.location.href)
          url.searchParams.set('login', account.login)
          url.searchParams.set('return_to', window.location.href)
          expect(accountItem).toHaveAttribute('href', url.href)
        }
      }

      expect(canvas.getByRole('menuitem', {name: 'Add account'})).toBeInTheDocument()
      expect(canvas.getByText('Maximum accounts reached')).toBeInTheDocument()
      expect(canvas.getByRole('menuitem', {name: 'Sign out...'})).toHaveAttribute('href', '/logout')
    })
  },
} satisfies Story

export const WithErrorSwitchingAccount = {
  args: {
    ...args,
    stashedAccounts,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(switchAccountPath, async () => {
          return HttpResponse.json(
            {
              error: 'Some error',
            },
            {status: 400},
          )
        }),
      ],
    },
  },
  play: async context => {
    const {canvasElement, step} = context
    await WithStashedAccounts.play(context)
    const canvas = within(canvasElement)

    await step('Attempt to switch accounts with error response', async () => {
      const account = stashedAccounts[0]!
      const accountItem = await canvas.findByRole('menuitem', {name: `${account.login} ${account.name}`})
      await accountItem.click()
      expect(await canvas.findByRole('dialog', {name: 'Switch account'})).toBeInTheDocument()
      expect(canvas.getByText('Unable to switch to the selected account.')).toBeInTheDocument()
    })
  },
} satisfies Story

export const WithEnterpriseAccessErrorSwitchingAccount = {
  args: {
    ...args,
    stashedAccounts,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(switchAccountPath, async () => {
          return HttpResponse.json(
            {
              error: enterpriseAccessVerificationMessage,
              reason: enterpriseAccessReason,
            },
            {status: 403},
          )
        }),
      ],
    },
  },
  play: async context => {
    const {canvasElement, step} = context
    await WithStashedAccounts.play(context)
    const canvas = within(canvasElement)

    await step('Attempt to switch accounts with error response', async () => {
      const account = stashedAccounts[0]!
      const accountItem = await canvas.findByRole('menuitem', {name: `${account.login} ${account.name}`})
      await accountItem.click()
      expect(await canvas.findByRole('dialog', {name: 'Switch account'})).toBeInTheDocument()
      expect(canvas.getByText(enterpriseAccessVerificationMessage)).toBeInTheDocument()
    })
  },
} satisfies Story
