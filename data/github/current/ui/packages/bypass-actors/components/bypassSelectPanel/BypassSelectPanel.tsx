import {useCallback, useMemo, useState} from 'react'
import {Button, SelectPanel} from '@primer/react'
import {PlusIcon, TriangleDownIcon} from '@primer/octicons-react'
import {debounce} from '@github/mini-throttle'
import {BypassAvatar} from '../BypassAvatar'
import {getBypassSuggestions} from '../../services/api'
import {alreadyAdded, getEnabledBypassActor} from '../bypassDialog/alreadyAdded'
import {actorTypeString} from '../ActorType'
import type {BypassActor} from '../../bypass-actors-types'
import {ActorBypassMode} from '../../bypass-actors-types'

const calculateDescription = (b: BypassActor) => {
  let description = `${actorTypeString(b.actorType)}`
  if (b.actorType === 'Team') {
    description = `${description} • @${b.name}`
  } else if (b.actorType === 'Integration' && b.owner) {
    description = `${description} • ${b.owner}`
  }
  return description
}

export type BypassSelectPanelProps = {
  baseAvatarUrl: string
  enabledBypassActors: BypassActor[]
  addBypassActor: (
    actorId: BypassActor['actorId'],
    actorType: BypassActor['actorType'],
    name: BypassActor['name'],
    bypassMode: BypassActor['bypassMode'],
    owner: BypassActor['owner'],
  ) => void
  removeBypassActor: (bypassActor: BypassActor) => void
  suggestionsUrl: string
  addReviewerSubtitle: string
}

export const BypassSelectPanel = ({
  baseAvatarUrl,
  enabledBypassActors,
  addBypassActor,
  removeBypassActor,
  suggestionsUrl,
  addReviewerSubtitle,
}: BypassSelectPanelProps) => {
  const [suggestions, setSuggestions] = useState<BypassActor[]>([])
  const suggestionItems = useMemo(() => {
    const mappedSuggestions = suggestions.map(s => ({
      text: s.name,
      description: calculateDescription(s),
      id: JSON.stringify(s),
      leadingVisual: () => <BypassAvatar baseUrl={baseAvatarUrl} id={s.actorId} name={s.name} type={s.actorType} />,
      onAction: () => {
        const bypassActorToRemove = getEnabledBypassActor(s.actorId, s.actorType, enabledBypassActors)
        if (bypassActorToRemove) {
          removeBypassActor(bypassActorToRemove)
        } else {
          addBypassActor(s.actorId, s.actorType, s.name, ActorBypassMode.ALWAYS, s.owner)
        }
      },
    }))
    return mappedSuggestions
  }, [suggestions, baseAvatarUrl, enabledBypassActors, addBypassActor, removeBypassActor])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const onOpen = async () => {
    if (!open) {
      setOpen(true)
      setIsLoading(true)
      setSuggestions(await getBypassSuggestions(suggestionsUrl, ''))
      setIsLoading(false)
    } else {
      setOpen(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceBypassSuggestions = useCallback(
    debounce(async (newFilter: string) => {
      if (newFilter === '') {
        setSuggestions(await getBypassSuggestions(suggestionsUrl, ''))
      } else {
        setSuggestions(await getBypassSuggestions(suggestionsUrl, newFilter))
      }
    }, 200),
    [suggestionsUrl, setSuggestions],
  )

  return (
    <SelectPanel
      loading={isLoading}
      title="Add bypass"
      subtitle={addReviewerSubtitle}
      renderAnchor={({'aria-labelledby': ariaLabelledBy, ...anchorProps}) => (
        <Button
          leadingVisual={PlusIcon}
          trailingVisual={TriangleDownIcon}
          aria-labelledby={` ${ariaLabelledBy}`}
          {...anchorProps}
          aria-haspopup="dialog"
        >
          Add bypass
        </Button>
      )}
      open={open}
      onOpenChange={onOpen}
      items={suggestionItems}
      selected={suggestionItems.filter(item => {
        if (typeof item.id === 'string') {
          const s = JSON.parse(item.id)
          return alreadyAdded(s.actorId, s.actorType, enabledBypassActors)
        }
      })}
      /* This is a no-op because we fetch bypass suggestions from the server as the user types.
      We instead handle this with each item's onAction prop. */
      onSelectedChange={() => {}}
      placeholderText="Filter bypass actors"
      filterValue={filter}
      onFilterChange={f => {
        setFilter(f)
        debounceBypassSuggestions(f)
      }}
      overlayProps={{
        width: 'medium',
        height: 'medium',
      }}
    />
  )
}
