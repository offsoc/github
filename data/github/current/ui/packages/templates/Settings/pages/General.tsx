import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import SectionHeader from '../components/SectionHeader'
import Section from '../components/Section'
import {ControlGroup} from '@github-ui/control-group'
import ActionMenuItem from '../utils/ActionMenuExample'
import {Link} from '@primer/react'
import {AccessibilityIcon, BellIcon, GearIcon, PaintbrushIcon, PersonIcon} from '@primer/octicons-react'

const General = () => {
  return (
    <SettingsLayout active="General settings">
      <SettingsHeader title="General settings" />
      <Section>
        <SectionContent>
          <ControlGroup fullWidth>
            <ControlGroup.LinkItem href="#" leadingIcon={<PersonIcon />}>
              <ControlGroup.Title as="h2">Personal information</ControlGroup.Title>
              <ControlGroup.Description>
                Name, public email, bio, pronouns, URL, social accounts, company, location
              </ControlGroup.Description>
            </ControlGroup.LinkItem>
            <ControlGroup.LinkItem href="#" leadingIcon={<GearIcon />}>
              <ControlGroup.Title as="h2">Account</ControlGroup.Title>
              <ControlGroup.Description>
                Username, Patreon, export data, successor settings, delete account
              </ControlGroup.Description>
            </ControlGroup.LinkItem>

            <ControlGroup.LinkItem href="#" leadingIcon={<PaintbrushIcon />}>
              <ControlGroup.Title as="h2">Appearance</ControlGroup.Title>
              <ControlGroup.Description>Themes, emojis, tab size, markdown settings</ControlGroup.Description>
            </ControlGroup.LinkItem>

            <ControlGroup.LinkItem href="#" leadingIcon={<AccessibilityIcon />}>
              <ControlGroup.Title as="h2">Accessibility</ControlGroup.Title>
              <ControlGroup.Description>Keyboard shortcuts, motion, content, editor settings</ControlGroup.Description>
            </ControlGroup.LinkItem>

            <ControlGroup.LinkItem href="#" leadingIcon={<BellIcon />}>
              <ControlGroup.Title as="h2">Notifications</ControlGroup.Title>
              <ControlGroup.Description>
                Email notifications, subscriptions, system notifications
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

export default General
