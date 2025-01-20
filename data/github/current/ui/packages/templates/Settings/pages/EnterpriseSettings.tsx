import {IconButton, Box, Breadcrumbs} from '@primer/react'
import {SettingsLayout} from '../components/SettingsLayout'
import SettingsHeader from '../components/SettingsHeader'
import SectionContent from '../components/SectionContent'
import SectionHeader from '../components/SectionHeader'
import Section from '../components/Section'
import {ControlGroup} from '@github-ui/control-group'
import {DataTable, Table} from '@primer/react/drafts'
import {KebabHorizontalIcon} from '@primer/octicons-react'

const EnterpriseSettings = () => {
  return (
    <SettingsLayout active="Security" nav="enterprise">
      <Box sx={{display: ['block', 'none']}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href="#">Settings</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            Security
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <SettingsHeader title="Security" />
      <Section>
        <SectionContent>
          <ControlGroup>
            <ControlGroup.LinkItem href="#" value="Off">
              <ControlGroup.Title as="h2">Two-factor authentication</ControlGroup.Title>
              <ControlGroup.Description>
                Set up organization-wide two-factor authentication for enterprise administrators, organization members,
                and outside collaborators.
              </ControlGroup.Description>
            </ControlGroup.LinkItem>
            <ControlGroup.LinkItem href="#" value="Off">
              <ControlGroup.Title as="h2">Required SAML Authentication</ControlGroup.Title>
              <ControlGroup.Description>
                Set up SAML single sign-on for your enterprise based on our list of supported identity providers.
              </ControlGroup.Description>
            </ControlGroup.LinkItem>
          </ControlGroup>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="SSH certificate authorities" />
        <SectionContent>
          <span>There are no SSH certificate authorities associated with this enterprise.</span>
        </SectionContent>
      </Section>

      <Section>
        <SectionHeader title="IP allow list" />
        <SectionContent>
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title id="ip-allow-list">Enable IP allow list</ControlGroup.Title>
              <ControlGroup.Description>
                Enabling will allow you to restrict access by IP address to resources owned by this enterprise.
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="ip-allow-list" />
            </ControlGroup.Item>
            <ControlGroup.Item>
              <ControlGroup.Title id="ip-allow-list-gh-apps">
                Enable IP allow list configuration for installed GitHub Apps
              </ControlGroup.Title>
              <ControlGroup.Description>
                Enabling will automatically set up IP allow list entries for GitHub Apps installed on organizations in
                this enterprise.
              </ControlGroup.Description>
              <ControlGroup.ToggleSwitch aria-labelledby="ip-allow-list-gh-apps" />
            </ControlGroup.Item>
          </ControlGroup>
        </SectionContent>

        <SectionContent>
          <IpTable />
        </SectionContent>
      </Section>
    </SettingsLayout>
  )
}

export default EnterpriseSettings

interface IpData {
  id: number
  ip: string
  description: string
  action: string
}

const data: IpData[] = [
  {id: 1, ip: '1.1.1.1', description: 'Disabled gateway test', action: 'Edit'},
  {id: 2, ip: '192.80.254.0/22', description: 'Disabled All staff', action: 'Edit'},
  {id: 3, ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', description: 'Disabled lptp-test ipv6', action: 'Edit'},
  {id: 4, ip: '54.153.4.141', description: 'ghes test', action: 'Edit'},
  {id: 5, ip: '54.183.169.61', description: 'test', action: 'Edit'},
  {id: 6, ip: '54.193.78.141', description: 'AMS testing ghes', action: 'Edit'},
  {id: 7, ip: '67.183.52.212', description: 'Disabled alex mac', action: 'Edit'},
  {id: 8, ip: '86.160.1.97/4', description: 'hubwriter testing IP allow lists for documentation', action: 'Edit'},
]

const IpTable: React.FC = () => (
  <Table.Container>
    <DataTable
      aria-labelledby="ip-addresses"
      aria-describedby="ip-addresses-subtitle"
      data={data}
      columns={[
        {
          header: 'IP Address',
          field: 'ip',
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
