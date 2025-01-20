import {CopyIcon, GitPullRequestIcon, IssueOpenedIcon, PencilIcon, ThreeBarsIcon} from '@primer/octicons-react'
import {ActionList, IconButton, Link} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {ListView} from '../../ListView/ListView'
import {generateTitle} from '../../ListView/stories/helpers'
import {ListItemActionBar, type ListItemActionBarProps} from '../ActionBar'
import {ListItem} from '../ListItem'
import {ListItemTitle} from '../Title'

const meta: Meta<ListItemActionBarProps> = {
  title: 'Recipes/ListView/ListItem/ActionBar',
  component: ListItemActionBar,
  args: {},
  argTypes: {
    anchorIcon: {
      control: 'select',
      options: ['Default', 'ThreeBars'],
      mapping: {
        Default: undefined,
        ThreeBars: ThreeBarsIcon,
      },
    },
    // disabled controls
    actions: {table: {disable: true}},
    staticMenuActions: {table: {disable: true}},
  },
}

export default meta
type Story = StoryObj<ListItemActionBarProps>

export const Example: Story = {
  name: 'ActionBar',
  render: ({anchorIcon, ...args}) => (
    <>
      {[0, 1, 2].map(index => {
        const title = useMemo(() => generateTitle('Issues', index), [index])
        return (
          <ListItem
            key={index}
            title={<ListItemTitle value={title!} />}
            secondaryActions={
              <ListItemActionBar
                label="sample action bar"
                {...args}
                staticMenuActions={[
                  {
                    key: 'set-label',
                    render: () => <ActionList.Item>Set label</ActionList.Item>,
                  },
                ]}
                actions={[
                  {
                    key: 'navigate-to-code',
                    render: isOverflowMenu => {
                      return isOverflowMenu ? (
                        <ActionList.Item>
                          <ActionList.LeadingVisual>
                            <PencilIcon />
                          </ActionList.LeadingVisual>
                          Navigate to Issue #72
                        </ActionList.Item>
                      ) : (
                        <Link muted aria-label="Navigate to Issue #72" href="#">
                          <IssueOpenedIcon /> {1}
                        </Link>
                      )
                    },
                  },
                  {
                    key: 'navigate-to-pr',
                    render: isOverflowMenu => {
                      return isOverflowMenu ? (
                        <ActionList.Item>
                          <ActionList.LeadingVisual>
                            <PencilIcon />
                          </ActionList.LeadingVisual>
                          Navigate to PR #12345
                        </ActionList.Item>
                      ) : (
                        <Link muted aria-label="Navigate to PR #12345" href="foo/bar">
                          <GitPullRequestIcon /> {1}
                        </Link>
                      )
                    },
                  },
                  {
                    key: 'copy-sha',
                    render: isOverflowMenu => {
                      return isOverflowMenu ? (
                        <ActionList.Item>Copy full SHA</ActionList.Item>
                      ) : (
                        <IconButton
                          size="small"
                          icon={CopyIcon}
                          variant="invisible"
                          aria-label={`Copy full SHA for 3dd0ffe`}
                        />
                      )
                    },
                  },
                ]}
                anchorIcon={anchorIcon}
              />
            }
          />
        )
      })}
    </>
  ),
  decorators: [
    Story => (
      <ListView title="ActionBar list" variant="compact">
        <Story />
      </ListView>
    ),
  ],
}
