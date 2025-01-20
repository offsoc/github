import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import Section from '../components/Section'
import {Button, Breadcrumbs, FormControl, TextInput, Box, Select, Textarea, Checkbox, Link} from '@primer/react'
import {LinkIcon} from '@primer/octicons-react'
import SettingsFormFooter from '../components/SettingsFormFooter'
import SectionDivider from '../components/SectionDivider'

const EditProfile = () => {
  const formMinWidth = ['100%', '500px']
  return (
    <SettingsLayout active="General settings">
      {/* Render this for non-mobile breadcrumbs */}
      <Box sx={{display: ['none', 'block']}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">General</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            Personal information
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      {/* Render this for mobile breadcrumbs */}
      <Box sx={{display: ['block', 'none']}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">General</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            Personal information
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <SettingsHeader title="Personal information" divider />
      <Section>
        <SectionContent variant="form">
          <FormControl>
            <FormControl.Label>Name</FormControl.Label>
            <TextInput sx={{minWidth: formMinWidth}} />
            <FormControl.Caption id="TODO">
              Your name may appear around GitHub where you contribute or are mentioned. You can remove it at any time.
            </FormControl.Caption>
          </FormControl>
          <FormControl>
            <FormControl.Label>Public emails</FormControl.Label>
            <Select>
              <Select.Option value="0">Select a verified email to display</Select.Option>
              <Select.Option value="tbenning27@gmail.com">tbenning27@gmail.com</Select.Option>
              <Select.Option value="tbenning@github.com">tbenning@github.com</Select.Option>
            </Select>
            <FormControl.Caption id="TODO">
              You can manage verified email addresses in your email settings
            </FormControl.Caption>
          </FormControl>
          <FormControl>
            <FormControl.Label>Bio</FormControl.Label>
            <Textarea sx={{minWidth: formMinWidth, height: 100}} />
            <FormControl.Caption id="TODO">
              You can @mention other users and organizations to link to them.
            </FormControl.Caption>
          </FormControl>

          <FormControl>
            <FormControl.Label>URL</FormControl.Label>
            <TextInput sx={{minWidth: formMinWidth}} />
          </FormControl>

          <Box sx={{display: 'grid', gap: 2}}>
            <FormControl>
              <FormControl.Label>Social accounts</FormControl.Label>
              <TextInput leadingVisual={LinkIcon} placeholder="Link to social profile" sx={{minWidth: formMinWidth}} />
            </FormControl>
            <FormControl>
              <TextInput leadingVisual={LinkIcon} placeholder="Link to social profile" sx={{minWidth: formMinWidth}} />
            </FormControl>
            <FormControl>
              <TextInput leadingVisual={LinkIcon} placeholder="Link to social profile" sx={{minWidth: formMinWidth}} />
            </FormControl>
            <FormControl>
              <TextInput leadingVisual={LinkIcon} placeholder="Link to social profile" sx={{minWidth: formMinWidth}} />
            </FormControl>
          </Box>
          <SectionDivider />
          <FormControl>
            <FormControl.Label>Company</FormControl.Label>
            <TextInput sx={{minWidth: formMinWidth}} />
            <FormControl.Caption id="TODO">
              You can @mention your company’s GitHub organization to link it.
            </FormControl.Caption>
          </FormControl>
          <FormControl>
            <FormControl.Label>Location</FormControl.Label>
            <TextInput sx={{minWidth: formMinWidth}} />
          </FormControl>
          <FormControl>
            <FormControl.Label>Display current local time</FormControl.Label>
            <FormControl.Caption>Other users will see the time difference from their local time.</FormControl.Caption>
            <Checkbox />
          </FormControl>
        </SectionContent>
      </Section>
      <span>
        All of the fields on this page are optional and can be deleted at any time, and by filling them out, you&apos;re
        giving us consent to share this data wherever your user profile appears. Please see our{' '}
        <Link inline href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement">
          privacy statement
        </Link>{' '}
        to learn more about how we use this information.
      </span>
      <SettingsFormFooter>
        <Button variant="primary">Save profile</Button>
        <Button variant="default">Cancel</Button>
      </SettingsFormFooter>
    </SettingsLayout>
  )
}

export default EditProfile
