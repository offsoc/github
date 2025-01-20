import {CopyIcon, GitPullRequestIcon, IssueOpenedIcon, PencilIcon, ThreeBarsIcon} from '@primer/octicons-react'
import {ActionList, IconButton, Link} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateTitle} from '../../stories/helpers'
import {NestedListItemActionBar, type NestedListItemActionBarProps} from '../ActionBar'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta<NestedListItemActionBarProps> = {
  title: 'Recipes/NestedListView/NestedListItem/ActionBar',
  component: NestedListItemActionBar,
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
type Story = StoryObj<NestedListItemActionBarProps>

export const Example: Story = {
  render: ({anchorIcon, ...args}) => (
    <>
      {[0, 1, 2].map(index => {
        const title = useMemo(() => generateTitle('Issues', index), [index])
        return (
          <NestedListItem
            key={index}
            title={<NestedListItemTitle value={title} />}
            secondaryActions={
              <NestedListItemActionBar
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
      <NestedListView title="Storybook action bar">
        <Story />
      </NestedListView>
    ),
  ],
}
Example.storyName = 'ActionBar'
