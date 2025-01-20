import {sendEvent} from '@github-ui/hydro-analytics'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionMenu, ActionList} from '@primer/react'

export interface Ecosystems {
  [key: string]: {label: string}
}

export interface EcosystemsFilterProps {
  ecosystems: Ecosystems
  ecosystemsFilter: string[]
  setEcosystemsFilter: (ecosystems: string[]) => void
}

export function EcosystemsFilter({ecosystems, ecosystemsFilter, setEcosystemsFilter}: EcosystemsFilterProps) {
  const allEcosystems = 'all-ecosystems'

  const getLabel = () => {
    const pluralized = ecosystemsFilter.length === 1 ? 'ecosystem' : 'ecosystems'
    return ecosystemsFilter.length === 0 ? `All ${pluralized}` : `${ecosystemsFilter.length} ${pluralized}`
  }

  const updatedEcosystems = (selected: string) => {
    if (selected === allEcosystems) {
      return []
    } else {
      return ecosystemsFilter.includes(selected)
        ? ecosystemsFilter.filter(v => v !== selected)
        : [...ecosystemsFilter, selected]
    }
  }

  const sendEcosystemClickEvent = (ecosystem: string, enabled: boolean) => {
    sendEvent('sponsors.explore_filter_change', {enabled, filter_option: ecosystem})
  }

  const onEcosystemChange = (event: React.UIEvent, ecosystem: string) => {
    event.preventDefault()
    const selectedEcosystems = updatedEcosystems(ecosystem)
    setEcosystemsFilter(selectedEcosystems)
    sendEcosystemClickEvent(ecosystem, selectedEcosystems.includes(ecosystem))
  }

  return (
    <ActionMenu>
      <ActionMenu.Button aria-label={`Ecosystems: ${getLabel()}`} {...testIdProps('ecosystems-button')}>
        {getLabel()}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="multiple" role="listbox">
          <ActionList.Item
            key={allEcosystems}
            role="option"
            selected={ecosystemsFilter.length === 0}
            aria-selected={ecosystemsFilter.length === 0}
            onSelect={event => {
              onEcosystemChange(event, allEcosystems)
            }}
            {...testIdProps(`ecosystem-${allEcosystems}`)}
          >
            All ecosystems
          </ActionList.Item>
          {Object.entries(ecosystems).map(([k, ecosystem]) => (
            <ActionList.Item
              key={k}
              role="option"
              selected={ecosystemsFilter.includes(k)}
              aria-selected={ecosystemsFilter.includes(k)}
              onSelect={event => {
                onEcosystemChange(event, k)
              }}
              {...testIdProps(`ecosystems-${k}`)}
            >
              {ecosystem.label}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
