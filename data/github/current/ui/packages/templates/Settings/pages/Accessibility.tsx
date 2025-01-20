import {ActionMenu, ActionList, Link, Breadcrumbs, Box} from '@primer/react'
import {useState} from 'react'
import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import SectionHeader from '../components/SectionHeader'
import Section from '../components/Section'
import {ControlGroup} from '@github-ui/control-group'

const Accessibility = () => {
  return (
    <SettingsLayout active="Accessibility">
      <Box sx={{display: ['block', 'none']}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            Accessibility
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <SettingsHeader title="Accessibility" divider />
      <Section>
        <SectionHeader title="Keyboard" />
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title id="characterKeys">Character keys</ControlGroup.Title>
              <ControlGroup.Description>
                Enable{' '}
                <Link inline href="https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts">
                  GitHub shortcuts
                </Link>{' '}
                that don&apos;t use modifier keys in their activation. For example, the <kbd>g</kbd>
                <kbd>n</kbd> shortcut to navigate notifications, or <kbd>?</kbd> to view context relevant shortcuts.
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="characterKeys" />
            </ControlGroup.Item>
            <ControlGroup.LinkItem href="#">
              <ControlGroup.Title>Manage keyboard shortcuts</ControlGroup.Title>
            </ControlGroup.LinkItem>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="Links" />
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title id="underlines">Link underlines</ControlGroup.Title>
              <ControlGroup.Description>Underline links on hover and keyboard focus.</ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="underlines" />
            </ControlGroup.Item>
            <ControlGroup.Item>
              <ControlGroup.Title id="formattedLinks">Formatted links</ControlGroup.Title>
              <ControlGroup.Description>
                Enable to automatically format highlighted text in markdown as a link when pasting a URL with{' '}
                <kbd>⌘</kbd>
                <kbd>⇧</kbd>
                <kbd>v</kbd>. Disable to paste a plain text URL in place.
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="formattedLinks" />
            </ControlGroup.Item>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="Motion" />
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title>Autoplay animated images</ControlGroup.Title>
              <ControlGroup.Custom>
                <MotionActionMenu />
              </ControlGroup.Custom>
            </ControlGroup.Item>
          </ControlGroup>
        </SectionContent>
      </Section>
    </SettingsLayout>
  )
}

export default Accessibility

const MotionActionMenu = () => {
  const options = [
    {
      name: 'Sync with system',
      description: 'Adopt your system preference for reduced motion',
    },
    {
      name: 'Enabled',
      description: 'Automatically play animated images',
    },
    {
      name: 'Disabled',
      description: 'Prevent animated images from playing automatically',
    },
  ]
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedType = options[selectedIndex]

  return (
    <ActionMenu>
      <ActionMenu.Button>{selectedType?.name}</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          {options.map((option, index) => (
            <ActionList.Item key={index} selected={index === selectedIndex} onSelect={() => setSelectedIndex(index)}>
              {option.name}
              <ActionList.Description variant="block">{option.description}</ActionList.Description>
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
