import {Box, CheckboxGroup} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import type {BypassActor} from '../../bypass-actors-types'
import {BypassDialogRow} from './BypassDialogRow'
import {alreadyAdded} from './alreadyAdded'

type DialogBodyProps = {
  suggestions: BypassActor[]
  selected: BypassActor[]
  setSelected: (selected: BypassActor[]) => void
  baseAvatarUrl: string
  enabledBypassActors: BypassActor[]
}

export function BypassDialogBody({
  suggestions,
  selected,
  setSelected,
  baseAvatarUrl,
  enabledBypassActors,
}: DialogBodyProps) {
  const newSuggestions = suggestions.filter(s => !alreadyAdded(s.actorId, s.actorType, enabledBypassActors))
  return (
    <Box sx={{height: 175}}>
      {newSuggestions.length > 0 ? (
        <CheckboxGroup aria-labelledby="suggestionsHeading" sx={{paddingBottom: 4}}>
          <ul className="list-style-none">
            {newSuggestions.map(s => {
              return (
                <li key={`${s.actorId}-${s.actorType}`}>
                  <BypassDialogRow
                    actorId={s.actorId}
                    actorType={s.actorType}
                    name={s.name}
                    owner={s.owner}
                    selected={selected}
                    setSelected={setSelected}
                    baseAvatarUrl={baseAvatarUrl}
                    enabledBypassActors={enabledBypassActors}
                  />
                </li>
              )
            })}
          </ul>
        </CheckboxGroup>
      ) : (
        <Box sx={{py: '6%'}}>
          <Box sx={{textAlign: 'center'}}>
            <Blankslate>
              <Blankslate.Heading as="h3">No suggestions</Blankslate.Heading>
            </Blankslate>
          </Box>
        </Box>
      )}
    </Box>
  )
}
