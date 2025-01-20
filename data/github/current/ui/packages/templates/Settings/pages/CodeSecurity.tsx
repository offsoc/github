import {Box, Breadcrumbs, IconButton} from '@primer/react'
import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import SectionHeader from '../components/SectionHeader'
import Section from '../components/Section'
import {ControlGroup} from '@github-ui/control-group'
import {DataTable, Table} from '@primer/react/drafts'
import {KebabHorizontalIcon} from '@primer/octicons-react'

const CodeSecurity = () => {
  return (
    <SettingsLayout active="Security" nav="user">
      <Box sx={{display: ['block', 'none']}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            Code security
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <SettingsHeader
        title="Code security"
        description="Code security features help keep your repository secure and updated. By enabling these features, you're granting us permission to perform read-only analysis on your repository."
      />
      <Section>
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title as="h2" id="dependencyGraph">
                Dependency graph
              </ControlGroup.Title>
              <ControlGroup.Description>
                Display license information and vulnerability severity for your dependencies
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="dependencyGraph" />
            </ControlGroup.Item>
            <ControlGroup.LinkItem href="#" value="Off">
              <ControlGroup.Title as="h2">Dependabot alerts</ControlGroup.Title>
              <ControlGroup.Description>
                Configure alerts, vulnerability exposure analysis, rules, security updates, and more
              </ControlGroup.Description>
            </ControlGroup.LinkItem>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="Advanced security" />
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title id="advancedSecurity">GitHub Advanced Security</ControlGroup.Title>
              <ControlGroup.Description>
                Advanced Security features are free for public repositories and billed per active committer in private
                and internal repositories.
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="advancedSecurity" />
            </ControlGroup.Item>
            <ControlGroup.LinkItem href="#" value="Off">
              <ControlGroup.Title>Secret scanning alerts</ControlGroup.Title>
              <ControlGroup.Description>
                Set alerts, validity checking, push protection and more features
              </ControlGroup.Description>
            </ControlGroup.LinkItem>
            <ControlGroup.LinkItem href="#" value="Off">
              <ControlGroup.Title>Code scanning alerts</ControlGroup.Title>
              <ControlGroup.Description>
                Set alerts, validity checking, push protection and more features
              </ControlGroup.Description>
            </ControlGroup.LinkItem>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader
          title="Access to alerts"
          description="Dependabot and secret scanning alerts are only visible to people and teams that are given access by admins. These users will be notified when a new vulnerability is found in one of this repository's dependencies and when a secret or key is checked in. They will also see additional details when viewing Dependabot security updates. Individuals can manage how they receive these alerts in their notification settings."
        />
        <AccessTable />
      </Section>
    </SettingsLayout>
  )
}

export default CodeSecurity

interface AccessData {
  id: number
  name: string
  description: string
  action: string
}

const data: AccessData[] = [
  {id: 1, name: 'Tyler Benning', description: 'Disabled gateway test', action: 'Edit'},
  {id: 2, name: 'Maxime De Greve', description: 'Disabled All staff', action: 'Edit'},
  {id: 3, name: 'Rachel Cohen', description: 'Disabled lptp-test ipv6', action: 'Edit'},
  {id: 4, name: 'Hemant Kumar', description: 'ghes test', action: 'Edit'},
]

const AccessTable: React.FC = () => (
  <Table.Container>
    <DataTable
      aria-labelledby="ip-addresses"
      aria-describedby="ip-addresses-subtitle"
      data={data}
      columns={[
        {
          header: 'Name',
          field: 'name',
          rowHeader: true,
        },
        {
          header: 'Description',
          field: 'description',
        },
        {
          header: 'Action',
          rowHeader: false,
          field: 'action',
          width: 'auto',
          align: 'end',
          renderCell: row => {
            // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
            return <IconButton unsafeDisableTooltip={true} icon={KebabHorizontalIcon} aria-label={row.action} />
          },
        },
      ]}
    />
  </Table.Container>
)
