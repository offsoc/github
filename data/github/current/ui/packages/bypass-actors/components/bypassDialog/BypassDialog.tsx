import {useState, useEffect, useCallback, useRef} from 'react'
import {Blankslate, Dialog, type DialogButtonProps} from '@primer/react/experimental'
import {debounce} from '@github/mini-throttle'
import {getBypassSuggestions} from '../../services/api'
import type {BypassActor} from '../../bypass-actors-types'
import {ActorBypassMode} from '../../bypass-actors-types'
import {BypassDialogBody} from './BypassDialogBody'
import {BypassDialogHeader} from './BypassDialogHeader'
import {DismissibleFlashOrToast, type FlashAlert} from '@github-ui/dismissible-flash'
import {Box, FormControl, Text, TextInput, CheckboxGroup} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {BypassDialogRow} from './BypassDialogRow'
import {alreadyAdded} from './alreadyAdded'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

const inputPlaceholder = `Search`

export type BypassDialogProps = {
  onClose: () => void
  baseAvatarUrl: string
  enabledBypassActors: BypassActor[]
  addBypassActor: (
    actorId: BypassActor['actorId'],
    actorType: BypassActor['actorType'],
    name: BypassActor['name'],
    bypassMode: BypassActor['bypassMode'],
    owner: BypassActor['owner'],
  ) => void
  initialSuggestions: BypassActor[]
  suggestionsUrl: string
  addReviewerSubtitle: string
}

export const BypassDialog = ({
  onClose,
  baseAvatarUrl,
  enabledBypassActors,
  addBypassActor,
  initialSuggestions,
  suggestionsUrl,
  addReviewerSubtitle,
}: BypassDialogProps) => {
  const [bypassListFilter, setBypassListFilter] = useState<string>('')
  const [suggestions, setSuggestions] = useState<BypassActor[]>(initialSuggestions)
  const [selected, setSelected] = useState<BypassActor[]>([])
  const [flashAlert, setFlashAlert] = useState<FlashAlert>({message: '', variant: 'default'})

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceBypassSuggestions = useCallback(
    debounce(async (newFilter: string) => {
      if (newFilter === '') {
        setSuggestions(initialSuggestions)
      } else {
        try {
          const response = await getBypassSuggestions(suggestionsUrl, newFilter)
          setSuggestions(response)
        } catch (e) {
          setFlashAlert({
            variant: 'danger',
            message: 'Failed to fetch suggestions',
          })
        }
      }
    }, 200),
    [suggestionsUrl, setSuggestions],
  )

  useEffect(() => {
    debounceBypassSuggestions(bypassListFilter)
  }, [bypassListFilter, debounceBypassSuggestions])

  const onBypassListSelected = () => {
    for (const item of selected) {
      if (
        enabledBypassActors.some(({actorId, actorType}) => actorId === item.actorId && actorType === item.actorType)
      ) {
        setFlashAlert({
          variant: 'danger',
          message: 'Actor is already added',
        })
        return
      }
      if (item.actorId !== 'Organization admin') {
        addBypassActor(item.actorId, item.actorType, item.name, ActorBypassMode.ALWAYS, item.owner)
      }
    }
    onClose()
  }

  const footerButtons: DialogButtonProps[] = [
    {content: 'Cancel', onClick: onClose, buttonType: 'normal'},
    {
      content: 'Add selected',
      onClick: onBypassListSelected,
      buttonType: 'primary',
    },
  ]

  function DialogHeader(dialogLabelId: string) {
    return (
      <BypassDialogHeader
        onClose={onClose}
        bypassListFilter={bypassListFilter}
        setBypassListFilter={setBypassListFilter}
        dialogLabelId={dialogLabelId}
        flashAlert={flashAlert}
        setFlashAlert={setFlashAlert}
        addReviewerSubtitle={addReviewerSubtitle}
      />
    )
  }

  const flashRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    flashRef.current?.focus()
  }, [flashAlert, flashRef])

  const newSuggestions = suggestions.filter(s => !alreadyAdded(s.actorId, s.actorType, enabledBypassActors))

  const a11yAddBypassDialog = useFeatureFlag('a11y_add_bypass_dialog')

  if (a11yAddBypassDialog) {
    return (
      <Dialog title="Add bypass" height="auto" width="xlarge" footerButtons={footerButtons} onClose={onClose}>
        <Dialog.Body sx={{padding: 0}}>
          <Box sx={{marginBottom: 3, display: 'flex', flexDirection: 'column'}}>
            <DismissibleFlashOrToast flashAlert={flashAlert} setFlashAlert={setFlashAlert} ref={flashRef} />
            <FormControl sx={{marginTop: 1}}>
              <FormControl.Label sx={{fontWeight: 'normal'}}>{addReviewerSubtitle}</FormControl.Label>
              <TextInput
                block={false}
                sx={{width: '100%', fontWeight: 'normal'}}
                leadingVisual={SearchIcon}
                placeholder={inputPlaceholder}
                onChange={e => setBypassListFilter(e.target.value)}
                value={bypassListFilter}
              />
            </FormControl>
          </Box>
          <Box sx={{display: 'flex', marginBottom: 1}}>
            <Text id="suggestionsHeading" sx={{fontWeight: 'semibold'}}>
              Suggestions
            </Text>
          </Box>
          <Box sx={{height: 175}}>
            {newSuggestions.length > 0 ? (
              <CheckboxGroup aria-labelledby="suggestionsHeading" sx={{paddingBottom: 4}}>
                {newSuggestions.map(s => {
                  return (
                    <BypassDialogRow
                      key={`${s.actorId}-${s.actorType}`}
                      actorId={s.actorId}
                      actorType={s.actorType}
                      name={s.name}
                      owner={s.owner}
                      selected={selected}
                      setSelected={setSelected}
                      baseAvatarUrl={baseAvatarUrl}
                      enabledBypassActors={enabledBypassActors}
                    />
                  )
                })}
              </CheckboxGroup>
            ) : (
              <Blankslate>
                <Blankslate.Heading>No suggestions</Blankslate.Heading>
              </Blankslate>
            )}
          </Box>
        </Dialog.Body>
      </Dialog>
    )
  } else {
    return (
      <Dialog
        renderHeader={({dialogLabelId}) => DialogHeader(dialogLabelId)}
        height="auto"
        width="xlarge"
        footerButtons={footerButtons}
        onClose={onClose}
      >
        <BypassDialogBody
          suggestions={suggestions}
          selected={selected}
          setSelected={setSelected}
          baseAvatarUrl={baseAvatarUrl}
          enabledBypassActors={enabledBypassActors}
        />
      </Dialog>
    )
  }
}
