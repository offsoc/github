import type {Meta, StoryObj} from '@storybook/react'
import {within} from '@storybook/test'
import {expect} from '@storybook/jest'
import {storyWrapper} from '@github-ui/react-core/test-utils'
import {
  GlobalUserNavDrawer,
  type GlobalUserNavDrawerProps,
  type LazyLoadItemDataAttributes,
} from './GlobalUserNavDrawer'
import {getUserNavDrawerProps, stashedAccounts} from './test-utils/mock-data'
import {HttpResponse, delay, http} from '@github-ui/storybook/msw'
import {useState} from 'react'
import {Button} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'

type Story = StoryObj<typeof GlobalUserNavDrawer>

const defaultProps = getUserNavDrawerProps()

const playOpenMenu: Story['play'] = async ({canvasElement, step}) => {
  const canvas = within(canvasElement)

  await step('open the menu', async () => {
    const menuButton = canvas.getByRole('button', {name: 'Open user account menu'})
    expect(menuButton).toBeInTheDocument()
    // TODO: Fix bug and use `userEvent` https://github.com/github/core-ux/issues/248
    await menuButton.click()
    expect(await canvas.findByRole('dialog', {name: 'User navigation'})).toBeInTheDocument()
  })
}

function UserDrawerWithAnchor(props: GlobalUserNavDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="invisible"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open user account menu"
        className="AppHeader-logo color-bg-transparent p-0"
      >
        <GitHubAvatar src={props.owner.avatarUrl} size={32} />
      </Button>
      {open && <GlobalUserNavDrawer {...props} onClose={() => setOpen(false)} />}
    </>
  )
}

const meta = {
  title: 'Apps/Global Nav/User Nav Drawer',
  component: UserDrawerWithAnchor,
  decorators: [storyWrapper()],
  args: defaultProps,
  parameters: {
    controls: {expanded: true},
  },
} satisfies Meta<typeof GlobalUserNavDrawer>

export default meta

export const UserNavDrawerExample = {
  parameters: {
    msw: {
      handlers: [
        http.get('/_side-panels/user.json', async () => {
          await delay(1000)
          return HttpResponse.json({
            userStatus: {},
            enterpriseTrialUrl: '/enterprise_trial_url',
            hasUnseenFeatures: true,
            stashedAccounts,
          } as LazyLoadItemDataAttributes)
        }),
        http.get(`/users/${defaultProps.owner.login}/feature_previews`, async () => {
          await delay(1000)
          return HttpResponse.text('Feature Preview Dialog Content (from Rails)', {
            headers: {
              'Content-Type': 'text/html',
            },
          })
        }),
        http.get('/users/status', async () => {
          await delay(1000)
          return HttpResponse.text(
            `
          User Status Dialog Content (from Rails)
          <input type="hidden" name="set_status">
        `,
            {
              headers: {
                'Content-Type': 'text/fragment+html',
              },
            },
          )
        }),
        http.post('/users/status', async ({request: req}) => {
          // Request to set status
          const requestBody = await req.text()

          // Fake input `set_status` is included if Set Status button is clicked. Otherwise assume clear status
          const response = requestBody.includes('set_status')
            ? {
                messageHtml: "I'm on vacation",
                emojiAttributes: {
                  tag: 'g-emoji',
                  imgPath: 'icons/emoji/unicode/1f334.png',
                  attributes: {
                    alias: 'palm_tree',
                    'fallback-src': '/images/icons/emoji/unicode/1f334.png',
                    class: 'emoji',
                    align: 'absmiddle',
                  },
                  raw: '🌴',
                },
              }
            : {}
          await delay(500)
          return HttpResponse.json(response)
        }),
      ],
    },
  },
  play: playOpenMenu,
}
