import {NavList, Octicon} from '@primer/react'
import {FlameIcon, CopilotIcon, AppsIcon, PlayIcon} from '@primer/octicons-react'

const MENU_ITEMS = [
  {label: 'Featured', icon: FlameIcon},
  {label: 'Copilot plugins', icon: CopilotIcon},
  {label: 'Apps', icon: AppsIcon},
  {label: 'Actions', icon: PlayIcon},
]

export default function Categories() {
  return (
    <NavList aria-label="Categories">
      {MENU_ITEMS.map((item, index) => {
        return (
          <NavList.Item key={item.label} href="#" aria-current={index === 0 && 'page'}>
            <NavList.LeadingVisual>
              <Octicon icon={item.icon} size={16} />
            </NavList.LeadingVisual>
            {item.label}
          </NavList.Item>
        )
      })}
    </NavList>
  )
}
