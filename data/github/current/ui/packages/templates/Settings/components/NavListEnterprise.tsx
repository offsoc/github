import type React from 'react'
import {NavList} from '@primer/react'
import {
  MegaphoneIcon,
  QuestionIcon,
  GearIcon,
  CodeIcon,
  CreditCardIcon,
  ShieldLockIcon,
  GlobeIcon,
  CodespacesIcon,
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
      {Icon: GearIcon, title: 'Profile'},
      {Icon: GlobeIcon, title: 'Enterprise licensing'},
      {Icon: CreditCardIcon, title: 'Billing and plans'},
      {Icon: ShieldLockIcon, title: 'Security'},
      {Icon: CodeIcon, title: 'Verified & approved domains'},
      {Icon: LogIcon, title: 'Audit log'},
      {Icon: CodeIcon, title: 'Hooks'},
      {Icon: CodespacesIcon, title: 'Hosted compute networking'},
      {Icon: MegaphoneIcon, title: 'Announcement'},
      {Icon: QuestionIcon, title: 'Support'},
    ],
  },
]

type NavListEnterpriseProps = {
  active?: string
}

const NavListEnterprise = ({active = 'General settings'}: NavListEnterpriseProps) => {
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

export default NavListEnterprise
