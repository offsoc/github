import {useCallback, useMemo, useState} from 'react'
import {Button, SelectPanel} from '@primer/react'
import {OrganizationIcon, TriangleDownIcon} from '@primer/octicons-react'
import {debounce} from '@github/mini-throttle'
import {GitHubAvatar} from '@github-ui/github-avatar'

type Organization = {
  id: number
  nodeId: string
  name: string
}

function alreadySelected(nodeId: string, selectedOrgs: Organization[]) {
  return selectedOrgs.some(({nodeId: matchingNodeId}) => matchingNodeId === nodeId)
}

function getSelectedOrg(nodeId: string, selectedOrgs: Organization[]) {
  return selectedOrgs.find(({nodeId: matchingNodeId}) => matchingNodeId === nodeId)
}

export type OrgSelectorProps = {
  baseAvatarUrl: string
  selectedOrgs: Organization[]
  selectOrg: (id: Organization['id'], nodeId: Organization['nodeId'], name: Organization['name']) => void
  removeOrg: (nodeId: Organization['nodeId']) => void
  orgLoader: (q: string) => Promise<Organization[]>
}

export const OrgSelector = ({baseAvatarUrl, selectedOrgs, selectOrg, removeOrg, orgLoader}: OrgSelectorProps) => {
  const [suggestions, setSuggestions] = useState<Organization[]>([])
  const suggestionItems = useMemo(() => {
    const mappedSuggestions = suggestions.map(s => ({
      text: s.name,
      id: JSON.stringify(s),
      leadingVisual: () => <GitHubAvatar alt={s.name} src={`${baseAvatarUrl}/u/${s.id}`} />,
      onAction: () => {
        const orgToRemove = getSelectedOrg(s.nodeId, selectedOrgs)
        if (orgToRemove) {
          removeOrg(orgToRemove.nodeId)
        } else {
          selectOrg(s.id, s.nodeId, s.name)
        }
      },
    }))
    return mappedSuggestions
  }, [suggestions, selectedOrgs, selectOrg, removeOrg, baseAvatarUrl])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const onOpen = async () => {
    if (!open) {
      setOpen(true)
      setIsLoading(true)
      setSuggestions(await orgLoader(''))
      setIsLoading(false)
    } else {
      setOpen(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceOrgSuggestions = useCallback(
    debounce(async (newFilter: string) => {
      if (newFilter === '') {
        setSuggestions(await orgLoader(''))
      } else {
        setSuggestions(await orgLoader(newFilter))
      }
    }, 200),
    [orgLoader, setSuggestions],
  )

  return (
    <SelectPanel
      loading={isLoading}
      title="Select organizations"
      renderAnchor={({'aria-labelledby': ariaLabelledBy, ...anchorProps}) => (
        <Button
          leadingVisual={OrganizationIcon}
          trailingVisual={TriangleDownIcon}
          aria-labelledby={` ${ariaLabelledBy}`}
          {...anchorProps}
          aria-haspopup="dialog"
        >
          Select organizations
        </Button>
      )}
      open={open}
      onOpenChange={onOpen}
      items={suggestionItems}
      selected={suggestionItems.filter(item => {
        if (typeof item.id === 'string') {
          const s = JSON.parse(item.id)
          return alreadySelected(s.nodeId, selectedOrgs)
        }
      })}
      /* This is a no-op because we fetch org suggestions from the server as the user types.
       We instead handle this with each item's onAction prop. */
      onSelectedChange={() => {}}
      placeholderText="Filter organizations"
      filterValue={filter}
      onFilterChange={f => {
        setFilter(f)
        debounceOrgSuggestions(f)
      }}
      overlayProps={{
        width: 'medium',
        height: 'medium',
      }}
    />
  )
}
