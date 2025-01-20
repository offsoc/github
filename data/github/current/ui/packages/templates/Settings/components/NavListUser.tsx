import type React from 'react'
import {NavList} from '@primer/react'
import {
  GearIcon,
  CodeIcon,
  CreditCardIcon,
  MailIcon,
  ShieldLockIcon,
  BroadcastIcon,
  KeyIcon,
  OrganizationIcon,
  GlobeIcon,
  ReportIcon,
  RepoIcon,
  CodespacesIcon,
  PackageIcon,
  CopilotIcon,
  BrowserIcon,
  ReplyIcon,
  AppsIcon,
  ClockIcon,
  LogIcon,
} from '@primer/octicons-react'

type NavItem = {
  Icon: React.ElementType
  title: string
  ariaCurrent?: boolean
}

type NavGroup = {
  title?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    items: [
      {Icon: GearIcon, title: 'General settings'},
      {Icon: CodeIcon, title: 'Developer settings'},
    ],
  },
  {
    title: 'Access',
    items: [
      {Icon: CreditCardIcon, title: 'Billing and plans'},
      {Icon: MailIcon, title: 'Emails'},
      {Icon: ShieldLockIcon, title: 'Password and authentication'},
      {Icon: BroadcastIcon, title: 'Sessions'},
      {Icon: KeyIcon, title: 'SSH and GPG keys'},
      {Icon: OrganizationIcon, title: 'Organizations'},
      {Icon: GlobeIcon, title: 'Enterprises'},
      {Icon: ReportIcon, title: 'Moderation'},
    ],
  },
  {
    title: 'Code, planning, and automation',
    items: [
      {Icon: RepoIcon, title: 'Repositories'},
      {Icon: CodespacesIcon, title: 'Codespaces'},
      {Icon: PackageIcon, title: 'Packages'},
      {Icon: CopilotIcon, title: 'Copilot'},
      {Icon: BrowserIcon, title: 'Pages'},
      {Icon: ReplyIcon, title: 'Saved replies'},
    ],
  },
  {
    title: 'Security',
    items: [{Icon: ShieldLockIcon, title: 'Code security and analysis'}],
  },
  {
    title: 'Integrations',
    items: [
      {Icon: AppsIcon, title: 'Applications'},
      {Icon: ClockIcon, title: 'Scheduled reminders'},
    ],
  },
  {
    title: 'Archives',
    items: [
      {Icon: LogIcon, title: 'Security log'},
      {Icon: LogIcon, title: 'Sponsorship log'},
    ],
  },
]

type UserNavListProps = {
  active?: string
}

const NavListUser = ({active = 'General settings'}: UserNavListProps) => {
  return (
    <NavList aria-labelledby="context-name">
      {navGroups.map((group, groupIndex) => (
        <NavList.Group key={groupIndex} title={group.title}>
          {group.items.map((item, itemIndex) => (
            <NavList.Item key={itemIndex} aria-current={active === item.title ? 'page' : undefined}>
              <NavList.LeadingVisual>
                <item.Icon />
              </NavList.LeadingVisual>
              {item.title}
            </NavList.Item>
          ))}
        </NavList.Group>
      ))}
    </NavList>
  )
}

export default NavListUser
