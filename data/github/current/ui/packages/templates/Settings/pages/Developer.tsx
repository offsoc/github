import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import SectionHeader from '../components/SectionHeader'
import Section from '../components/Section'
import {ControlGroup} from '@github-ui/control-group'
import {AppsIcon, KeyIcon, PersonIcon} from '@primer/octicons-react'
import {Box, Breadcrumbs} from '@primer/react'

const Developer = () => {
  return (
    <SettingsLayout active="Developer settings">
      <Box sx={{display: ['block', 'none']}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            Developer
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <SettingsHeader title="Developer settings" />
      <Section>
        <SectionContent>
          <ControlGroup fullWidth>
            <ControlGroup.LinkItem href="#" leadingIcon={<AppsIcon />}>
              <ControlGroup.Title as="h2">GitHub apps</ControlGroup.Title>
              <ControlGroup.Description>Create new, manage existing</ControlGroup.Description>
            </ControlGroup.LinkItem>
            <ControlGroup.LinkItem href="#" leadingIcon={<PersonIcon />}>
              <ControlGroup.Title as="h2">OAuth apps</ControlGroup.Title>
              <ControlGroup.Description>Create new, manage existing</ControlGroup.Description>
            </ControlGroup.LinkItem>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="Personal access tokens" />
        <SectionContent>
          <ControlGroup fullWidth>
            <ControlGroup.LinkItem href="#" leadingIcon={<KeyIcon />}>
              <ControlGroup.Title>Classic tokens</ControlGroup.Title>
            </ControlGroup.LinkItem>
            <ControlGroup.LinkItem href="#" leadingIcon={<KeyIcon />}>
              <ControlGroup.Title>Fine-grained tokens</ControlGroup.Title>
            </ControlGroup.LinkItem>
          </ControlGroup>
        </SectionContent>
      </Section>
    </SettingsLayout>
  )
}

export default Developer
