import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import SectionHeader from '../components/SectionHeader'
import Section from '../components/Section'
import {ControlGroup} from '@github-ui/control-group'
import ActionMenuItem from '../utils/ActionMenuExample'
import {Box, Breadcrumbs, Link} from '@primer/react'

const DefaultPage = () => {
  return (
    <SettingsLayout active="General settings">
      <Box sx={{display: ['block', 'none']}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            General
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <SettingsHeader title="General settings" />
      <Section>
        <SectionContent>
          <ControlGroup fullWidth>
            <ControlGroup.LinkItem href="#">
              <ControlGroup.Title as="h2">Personal information</ControlGroup.Title>
              <ControlGroup.Description>
                Name, public email, bio, pronouns, URL, social accounts, company, location
              </ControlGroup.Description>
            </ControlGroup.LinkItem>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="Contributions & activity" />
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title id="profile">Make profile private and hide activity</ControlGroup.Title>
              <ControlGroup.Description>
                Enabling this will hide your contributions and activity from your GitHub profile and from social
                features like followers, stars, feeds, leaderboards and releases.
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="profile" />
            </ControlGroup.Item>
            <ControlGroup.Item>
              <ControlGroup.Title id="contributions">Include private contributions on my profile</ControlGroup.Title>
              <ControlGroup.Description>
                Your contribution graph, achievements, and activity overview will show your private contributions
                without revealing any repository or organization information. Read more.
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="contributions" />
            </ControlGroup.Item>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="Profile display options" />
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title id="achievements">Display achievements</ControlGroup.Title>
              <ControlGroup.ToggleSwitch aria-labelledby="achievements" />
            </ControlGroup.Item>
            <ControlGroup.Item>
              <ControlGroup.Title id="staffBadge">Display staff badge on my public profile</ControlGroup.Title>
              <ControlGroup.ToggleSwitch aria-labelledby="staffBadge" />
            </ControlGroup.Item>
            <ControlGroup.Item>
              <ControlGroup.Title id="hireable">Available for hire</ControlGroup.Title>
              <ControlGroup.Description>
                This will be shown on your{' '}
                <Link inline href="#">
                  jobs profile
                </Link>
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="hireable" />
            </ControlGroup.Item>
          </ControlGroup>
        </SectionContent>
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title>Preferred spoken language for trending page</ControlGroup.Title>
              <ControlGroup.Description>
                We&apos;ll use this language preference to filter the trending repository lists on Explore our Trending
                Repositories page.
              </ControlGroup.Description>
              <ControlGroup.Custom>
                <ActionMenuItem />
              </ControlGroup.Custom>
            </ControlGroup.Item>
          </ControlGroup>
        </SectionContent>
      </Section>
    </SettingsLayout>
  )
}

export default DefaultPage
