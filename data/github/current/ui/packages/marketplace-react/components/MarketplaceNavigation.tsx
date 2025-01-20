import {useMemo, useState} from 'react'

import styles from '../marketplace.module.css'

import {Button, NavList} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {AppsIcon, CopilotIcon, FlameIcon, PlayIcon, PlusIcon} from '@primer/octicons-react'
import type {Category} from '../types'
import {useFilterContext} from '../contexts/FilterContext'
import {useLocation} from 'react-router-dom'

type Props = {
  categories: {
    apps: Category[]
    actions: Category[]
  }
}

function Menu({categories}: Props) {
  const {type, copilotApp, category} = useFilterContext()
  const location = useLocation()

  const currentNavItem = useMemo(() => {
    if (location.pathname.includes('/marketplace/models')) {
      return 'models'
    } else if (!type && !category && !copilotApp) {
      return 'featured'
    } else if (type === 'apps' && copilotApp === 'true') {
      return 'copilot'
    } else if (category) {
      return category || ''
    }
    return ''
  }, [location.pathname, category, copilotApp, type])

  const currentType = useMemo(() => {
    if (type && !copilotApp) {
      if (type === 'apps') {
        return 'apps'
      } else if (type === 'actions') {
        return 'actions'
      }
    }
    return ''
  }, [copilotApp, type])

  return (
    <NavList>
      <NavList.Item href="/marketplace" {...(currentNavItem === 'featured' ? {'aria-current': 'page'} : {})}>
        <NavList.LeadingVisual>
          <FlameIcon />
        </NavList.LeadingVisual>
        Featured
      </NavList.Item>
      <NavList.Item
        href="/marketplace?type=apps&copilot_app=true"
        {...(currentNavItem === 'copilot' ? {'aria-current': 'page'} : {})}
      >
        <NavList.LeadingVisual>
          <CopilotIcon />
        </NavList.LeadingVisual>
        Copilot
      </NavList.Item>
      <NavList.Item href="/marketplace/models" {...(currentNavItem === 'models' ? {'aria-current': 'page'} : {})}>
        <NavList.LeadingVisual>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-label="AI Model icon"
            fill="var(--fgColor-muted, var(--color-muted-fg))"
          >
            <path d="M10.628 7.25a2.25 2.25 0 1 1 0 1.5H8.622a2.25 2.25 0 0 1-2.513 1.466L5.03 12.124a2.25 2.25 0 1 1-1.262-.814l1.035-1.832A2.245 2.245 0 0 1 4.25 8c0-.566.209-1.082.553-1.478L3.768 4.69a2.25 2.25 0 1 1 1.262-.814l1.079 1.908A2.25 2.25 0 0 1 8.622 7.25ZM2.5 2.5a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm4 4.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm6.25 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-9.5 5.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
          </svg>
        </NavList.LeadingVisual>
        Models
      </NavList.Item>
      <NavList.Item defaultOpen={currentType === 'apps'}>
        <NavList.LeadingVisual>
          <AppsIcon />
        </NavList.LeadingVisual>
        Apps
        <NavList.SubNav>
          <NavList.Item
            href={`/marketplace?type=apps`}
            {...(currentType === 'apps' && currentNavItem === '' ? {'aria-current': 'page'} : {})}
          >
            All apps
          </NavList.Item>
          {categories?.apps?.map(cat => (
            <NavList.Item
              key={`apps-category-${cat.slug}`}
              href={`/marketplace?type=apps&category=${cat.slug}`}
              {...(currentType === 'apps' && currentNavItem === cat.slug ? {'aria-current': 'page'} : {})}
            >
              {cat.name}
            </NavList.Item>
          ))}
        </NavList.SubNav>
      </NavList.Item>
      <NavList.Item defaultOpen={currentType === 'actions'}>
        <NavList.LeadingVisual>
          <PlayIcon />
        </NavList.LeadingVisual>
        Actions
        <NavList.SubNav>
          <NavList.Item
            href={`/marketplace?type=actions`}
            {...(currentType === 'actions' && currentNavItem === '' ? {'aria-current': 'page'} : {})}
          >
            All actions
          </NavList.Item>
          {categories?.actions?.map(cat => (
            <NavList.Item
              key={`actions-category-${cat.slug}`}
              href={`/marketplace?type=actions&category=${cat.slug}`}
              {...(currentType === 'actions' && currentNavItem === cat.slug ? {'aria-current': 'page'} : {})}
            >
              {cat.name}
            </NavList.Item>
          ))}
        </NavList.SubNav>
      </NavList.Item>
      <NavList.Divider />
      <NavList.Item href="/marketplace/new">
        <NavList.LeadingVisual>
          <PlusIcon />
        </NavList.LeadingVisual>
        Create a new extension
      </NavList.Item>
    </NavList>
  )
}

export default function MarketplaceNavigation({categories}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const onMenuClose = () => setIsMenuOpen(false)

  return (
    <>
      <div className="hide-sm hide-md">
        <Menu categories={categories} />
      </div>

      <Button block className="hide-lg hide-xl" onClick={() => setIsMenuOpen(true)}>
        Menu
      </Button>
      {isMenuOpen && (
        <Dialog title="Menu" onClose={onMenuClose} position={{narrow: 'bottom'}}>
          <div className={styles['negative-margin']}>
            <Menu categories={categories} />
          </div>
        </Dialog>
      )}
    </>
  )
}
