import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import Section from '../components/Section'
import {Box, Breadcrumbs, Button, IconButton, Tooltip} from '@primer/react'
import {ListView} from '@github-ui/list-view'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItem} from '@github-ui/list-view/ListItem'
import {GearIcon, TrashIcon} from '@primer/octicons-react'

const DeveloperTokens = () => {
  return (
    <SettingsLayout active="Developer settings">
      <Breadcrumbs>
        <Breadcrumbs.Item href="#">Developer</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#" selected>
          Personal access tokens
        </Breadcrumbs.Item>
      </Breadcrumbs>
      <SettingsHeader
        title="Personal access tokens"
        divider
        trailingAction={<Button variant="primary">Generate new token</Button>}
      />
      <span>
        Personal access tokens (classic) function like ordinary OAuth access tokens. They can be used instead of a
        password for Git over HTTPS, or can be used to authenticate to the API over Basic Authentication.
      </span>
      <Section>
        <SectionContent>
          <List />
        </SectionContent>
      </Section>
    </SettingsLayout>
  )
}

export default DeveloperTokens

const List = () => {
  const rulesetHistoryItems = [
    {
      name: 'DevPortal',
      permissions: 'repo, write:packages',
      expired: false,
    },
    {
      name: 'Personal project',
      permissions: 'repo, write:packages',
      expired: false,
    },
    {
      name: 'Insights charts',
      permissions: 'repo, write:packages',
      expired: true,
    },
    {
      name: 'All contributors',
      permissions: 'repo, write:packages',
      expired: true,
    },
  ]
  return (
    <Box sx={{border: '1px solid', borderColor: 'border.default', borderRadius: 2}}>
      <ListView title="Tokens">
        {rulesetHistoryItems.map(item => (
          <ListItem
            key={item.name}
            title={<ListItemTitle value={item.name} />}
            metadata={
              <>
                <ListItemMetadata alignment="right" sx={{display: 'flex', gap: 2}}>
                  <Tooltip aria-label="Configure SSO">
                    {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                    <IconButton
                      unsafeDisableTooltip={true}
                      size="small"
                      icon={GearIcon}
                      aria-label="Configure SSO"
                      variant="invisible"
                    />
                  </Tooltip>
                  <Tooltip aria-label="Delete">
                    {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                    <IconButton
                      unsafeDisableTooltip={true}
                      icon={TrashIcon}
                      size="small"
                      aria-label={`Delete ${item.name}`}
                      variant="invisible"
                      sx={{color: 'danger.fg'}}
                    />
                  </Tooltip>
                </ListItemMetadata>
              </>
            }
          >
            <ListItemMainContent>
              <ListItemDescription>{item.permissions} · Last used 2 days ago</ListItemDescription>
              {item.expired && (
                <ListItemDescription sx={{color: 'attention.fg'}}>Expired Sep 23 2023</ListItemDescription>
              )}
            </ListItemMainContent>
          </ListItem>
        ))}
      </ListView>
    </Box>
  )
}
