import type {Meta} from '@storybook/react'
import {ControlGroup} from '../ControlGroup'
import {Text} from '@primer/react'
import ActionMenuItem from './ActionMenuExample'
import {AccessibilityIcon, PaintbrushIcon, PersonIcon} from '@primer/octicons-react'

const meta: Meta = {
  title: 'Recipes/ControlGroup/Examples',
  tags: ['autodocs'],
  component: ControlGroup,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
}

export default meta

export const ControlGroupSection = {
  name: 'Ex 1 Items',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">Character keys</ControlGroup.Title>
        <ControlGroup.Description>
          Enable GitHub shortcuts that don&apos;t use modifier keys in their activation. For example, the g + n shortcut
          to navigate notifications to view context relevant shortcuts.
        </ControlGroup.Description>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>
      <ControlGroup.Item>
        <ControlGroup.Title>Link underlines</ControlGroup.Title>
        <ControlGroup.Description>Show or hide underlines for links within text blocks</ControlGroup.Description>
        <ControlGroup.Button>Manage underlines</ControlGroup.Button>
      </ControlGroup.Item>
      <ControlGroup.Item>
        <ControlGroup.Title>Formatted links</ControlGroup.Title>
        <ControlGroup.Description>
          Turn on to default format highlighted text in markdown as a link when pasting a link and command + shift + V
          to replace highlighted text. Turn off to swap the default.
        </ControlGroup.Description>
        <ControlGroup.InlineEdit value="On" />
      </ControlGroup.Item>
      <ControlGroup.Item>
        <ControlGroup.Title>Autoplay animated images</ControlGroup.Title>
        <ControlGroup.Description>Select whether animated images should play automatically.</ControlGroup.Description>
        <ControlGroup.Custom>
          <ActionMenuItem />
        </ControlGroup.Custom>
      </ControlGroup.Item>
      <ControlGroup.LinkItem href="#">
        <ControlGroup.Title>Dependabot alerts</ControlGroup.Title>
        <ControlGroup.Description>
          Display license information and vulnerability severity for your dependencies
        </ControlGroup.Description>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}

export const NestedControlGroupSection = {
  name: 'Ex 2 Nested Items',
  render: () => (
    <ControlGroup>
      <ControlGroup.Item>
        <ControlGroup.Title id="toggle">GitHub Advanced Security</ControlGroup.Title>
        <ControlGroup.Description>
          Advanced Security features are free for public repositories and billed per active committer in private and
          internal repositories.
        </ControlGroup.Description>
        <ControlGroup.ToggleSwitch aria-labelledby="toggle" />
      </ControlGroup.Item>
      <ControlGroup.Item nestedLevel={1} disabled>
        <ControlGroup.Title>Vulnerability exposure analysis</ControlGroup.Title>
        <ControlGroup.Description>See where your code calls vulnerable functions</ControlGroup.Description>
        <ControlGroup.Custom>
          <Text sx={{color: 'fg.muted'}}>Not set</Text>
        </ControlGroup.Custom>
      </ControlGroup.Item>
      <ControlGroup.Item nestedLevel={1} disabled>
        <ControlGroup.Title>Rules</ControlGroup.Title>
        <ControlGroup.Description>
          Allow Dependabot to open pull requests automatically to resolve alerts. For more specific pull request
          configurations, disable this setting to use Dependabot rules
        </ControlGroup.Description>
        <ControlGroup.Custom>
          <Text sx={{color: 'fg.muted'}}>Not set</Text>
        </ControlGroup.Custom>
      </ControlGroup.Item>
      <ControlGroup.Item nestedLevel={2} disabled>
        <ControlGroup.Title>Grouped security updates</ControlGroup.Title>
        <ControlGroup.Description>
          Allow Dependabot to open pull requests automatically to resolve alerts. For more specific pull request
          configurations, disable this setting to use Dependabot rules
        </ControlGroup.Description>
        <ControlGroup.Custom>
          <Text sx={{color: 'fg.muted'}}>Not set</Text>
        </ControlGroup.Custom>
      </ControlGroup.Item>
      <ControlGroup.LinkItem href="#">
        <ControlGroup.Title>Dependabot alerts</ControlGroup.Title>
        <ControlGroup.Description>
          Configure alerts, vulnerability exposure analysis, rules, security updates, and more
        </ControlGroup.Description>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}

export const LinkSection = {
  name: 'Ex 3 LinkItems',
  render: () => (
    <ControlGroup fullWidth>
      <ControlGroup.LinkItem href="#" leadingIcon={<PersonIcon />}>
        <ControlGroup.Title>Personal information</ControlGroup.Title>
      </ControlGroup.LinkItem>
      <ControlGroup.LinkItem href="#" leadingIcon={<PaintbrushIcon />}>
        <ControlGroup.Title>Appearance</ControlGroup.Title>
      </ControlGroup.LinkItem>
      <ControlGroup.LinkItem href="#" leadingIcon={<AccessibilityIcon />}>
        <ControlGroup.Title>Accessibility</ControlGroup.Title>
      </ControlGroup.LinkItem>
    </ControlGroup>
  ),
}
