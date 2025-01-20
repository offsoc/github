import {
  ArchiveIcon,
  HomeIcon,
  type Icon,
  LinkIcon,
  OrganizationIcon,
  RepoForkedIcon,
  RepoIcon,
  RepoLockedIcon,
  RepoTemplateIcon,
  TriangleDownIcon,
} from '@primer/octicons-react'
import {Box, Button, NavList} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useRef, useState} from 'react'

import type {TypeFilter} from '../types/repos-list-types'

interface SidebarCollapsedButtonProps extends SidebarProps {
  listTitle: string
}

export function SidebarCollapsedButton({listTitle, onQueryChanged, ...rest}: SidebarCollapsedButtonProps) {
  const [isDialogOpen, showDialog] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Button
        ref={buttonRef}
        variant="invisible"
        onClick={() => showDialog(true)}
        trailingVisual={TriangleDownIcon}
        aria-describedby="types-collapsed-button-description"
        sx={{ml: -2, mb: 2}}
      >
        <Box as="h1" sx={{fontSize: 3}}>
          {`${listTitle} repositories`}
        </Box>
      </Button>
      <span className="sr-only" id="types-collapsed-button-description" aria-live="polite">
        Change the repository type filter
      </span>
      {isDialogOpen && (
        <Dialog onClose={() => showDialog(false)} title="Types" width="small" returnFocusRef={buttonRef}>
          <Sidebar
            onQueryChanged={q => {
              onQueryChanged(q)
              showDialog(false)
            }}
            {...rest}
          />
        </Dialog>
      )}
    </>
  )
}

interface SidebarProps {
  onQueryChanged: (query: string) => void
  type: string
  types: TypeFilter[]
}

export function Sidebar({onQueryChanged, type, types}: SidebarProps) {
  return (
    <NavList>
      {types.map(({id, text}) => (
        <NavList.Item
          aria-current={type === id && 'page'}
          key={id}
          href={`?q=${getQueryFromType(id)}`}
          onClick={(event: React.MouseEvent) => {
            if (canSoftNavigate(event)) {
              onQueryChanged(getQueryFromType(id))
              event.preventDefault()
            }
          }}
        >
          <NavList.LeadingVisual>{getTypeIcon(id)}</NavList.LeadingVisual>
          {text}
        </NavList.Item>
      ))}
    </NavList>
  )
}

export function getTypeFromQuery(query: string, types: TypeFilter[]) {
  return types.find(({id}) => phraseByType[id] === query.trim())?.id || ''
}

export function getQueryFromType(type: string) {
  return phraseByType[type] || ''
}

const phraseByType: Record<string, string> = {
  all: '',
  public: 'visibility:public archived:false',
  internal: 'visibility:internal archived:false',
  private: 'visibility:private archived:false',
  source: 'mirror:false fork:false archived:false',
  fork: 'fork:true archived:false',
  template: 'template:true archived:false',
  archived: 'archived:true',
}

const iconClassByType: Record<string, Icon> = {
  all: HomeIcon,
  public: RepoIcon,
  internal: OrganizationIcon,
  private: RepoLockedIcon,
  source: LinkIcon,
  fork: RepoForkedIcon,
  template: RepoTemplateIcon,
  archived: ArchiveIcon,
}

function getTypeIcon(type: string) {
  const IconComponent = iconClassByType[type]!
  return <IconComponent />
}

function canSoftNavigate(event: React.MouseEvent) {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic -- Handle locally unless user is opening on a new tab
  return !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0
}
