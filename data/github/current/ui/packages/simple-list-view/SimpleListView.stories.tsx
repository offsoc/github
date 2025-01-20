import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {LockIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, Link, TextInput} from '@primer/react'
import type {Meta} from '@storybook/react'

import {SimpleListItem} from './SimpleListItem'
import {SimpleListView, type SimpleListViewProps} from './SimpleListView'

const meta = {
  title: 'Recipes/SimpleListView',
  component: SimpleListView,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof SimpleListView>

export default meta

const defaultArgs: Partial<SimpleListViewProps> = {
  title: '',
}

export const SimpleListViewExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: SimpleListViewProps) => (
    <SimpleListView {...args}>
      <SimpleListItem
        title="placeholder"
        description="We don't really have an action for this one, but we will populate this description with enough text to test how things look without any actions. For science."
      />
      <SimpleListItem
        title="production"
        description="Does this repo deploy to production?"
        actions={[
          <ActionMenu key="action-list">
            <ActionMenu.Button>high (default)</ActionMenu.Button>
            <ActionMenu.Overlay width="medium">
              <ActionList selectionVariant="single">
                <ActionList.Item key="low" selected={false} disabled={false}>
                  low
                </ActionList.Item>
                <ActionList.Item key="medium" selected={false} disabled={false}>
                  medium
                </ActionList.Item>
                <ActionList.Item key="high" selected={false} disabled={false}>
                  high (default)
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>,
        ]}
      />
      <SimpleListItem
        title="cost_center_id"
        description="The department to which costs may be charged for accounting purposes"
        actions={[
          <TextInput
            sx={{width: '100%', my: 2}}
            aria-label="Cost center ID"
            name="cost-center-id"
            key="key-input"
            placeholder="foo"
            onChange={() => {}}
            onKeyDown={() => {}}
          />,
        ]}
      />
      <SimpleListItem
        title={<ListItemTitle value={'data_sensitivity' as SafeHTMLString} href="https://github.com" />}
        description={
          <>
            <strong>Level of sensitivity</strong> of <em>data</em> processed by this repository once deployed. Refer to
            our data{' '}
            <Link inline href="https://github.com">
              classification policy
            </Link>{' '}
            for details on determining classification levels.
          </>
        }
        actions={[
          <Button
            sx={{p: 3, color: 'fg.subtle', fontSize: '12px', fontWeight: 'normal'}}
            onClick={() => {}}
            size="medium"
            variant="default"
            key="key"
          >
            Update
          </Button>,
        ]}
      />
      <SimpleListItem
        title="vulnerability_check"
        description="Email each time a vulnerability is found"
        actions={[
          <Button
            sx={{p: 2, color: 'fg.subtle', fontSize: '12px', fontWeight: 'normal'}}
            onClick={() => {}}
            leadingVisual={LockIcon}
            size="medium"
            variant="default"
            key="key"
          >
            Disable
          </Button>,
          <TextInput
            sx={{width: '100%', my: 2}}
            aria-label="Vulnerability Check"
            name="vuln--check"
            key="key-input"
            placeholder="Update email"
            onChange={() => {}}
            onKeyDown={() => {}}
          />,
        ]}
      />
    </SimpleListView>
  ),
}
