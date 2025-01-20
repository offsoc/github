import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {CheckIcon, PersonIcon, StopIcon} from '@primer/octicons-react'
import {Box, Button, FormControl, Heading, Octicon, Text} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'

import {type ActorType, Role} from '../../../../api/common-contracts'
import type {SuggestedCollaborator} from '../../../../api/memex/contracts'
import {BorderlessTextInput} from '../../../../components/common/borderless-text-input'
import SuggestionsList from '../../../../components/suggestions-list'
import {ToastType} from '../../../../components/toasts/types'
import useToasts from '../../../../components/toasts/use-toasts'
import {getInitialState} from '../../../../helpers/initial-state'
import {useTimeout} from '../../../../hooks/common/timeouts/use-timeout'
import {CommitState} from '../../../../hooks/use-autosave'
import {useClickOutside} from '../../../../hooks/use-click-outside'
import {useValueDelayedByTimeout} from '../../../../hooks/use-value-delayed-by-timeout'
import {useUpdateCollaboratorsOptimistically} from '../../../../queries/collaborators'
import {actorIdentifier, getCollaboratorDisplayValue} from '../../../../queries/organization-access'
import {useSuggestedCollaborators} from '../../../../queries/suggested-collaborators'
import {ManageAccessResources} from '../../../../strings'
import {CollaboratorPill} from './collaborator-pill'
import {CollaboratorRoleDropDown} from './collaborator-role-drop-down'

/** Component for displaying success after a collaborator has been added */
const AddCollaboratorSuccess = ({
  collaboratorsAddedCount,
  setInvitationRequestState,
}: {
  setInvitationRequestState: React.Dispatch<React.SetStateAction<CommitState>>
  collaboratorsAddedCount: string
}) => {
  const dismissAfterDelay = useTimeout(() => setInvitationRequestState(CommitState.None), 5000)

  useEffect(() => {
    dismissAfterDelay()
  }, [dismissAfterDelay])

  return (
    <div {...testIdProps('success-message')}>
      <Octicon icon={CheckIcon} sx={{ml: 3, color: 'success.fg'}} />
      <span> {collaboratorsAddedCount} successfully added </span>
    </div>
  )
}

/** Component for displaying failure if a collaborator cannot be added */
const AddCollaboratorError = () => {
  return (
    <div {...testIdProps('failure-message')}>
      <Octicon icon={StopIcon} sx={{ml: 3, color: 'danger.fg'}} />
      <span> Unable to add some users </span>
    </div>
  )
}

const FILTER_COLLABORATORS_LIST_ID = 'add-collaborators-suggestions-list'

const defaultEmptyArray: Array<any> = []

const defaultSuggestedCollaborators: Array<SuggestedCollaborator> = []

export const AddCollaborators: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const {projectOwner} = getInitialState()
  const [isInputActive, setIsInputActive] = useState(false)
  const [showCollaboratorSuggestionsList, setShowCollaboratorSuggestionsList] = useState<boolean>(false)
  const [selectedRole, setSelectedRole] = useState<Role>(Role.Write)
  const [selectedCollaborators, setSelectedCollaborators] = useState<Array<SuggestedCollaborator>>(defaultEmptyArray)

  const [invitationRequestState, setInvitationRequestState] = useState<CommitState>(CommitState.None)
  const [collaboratorsAddedCount, setCollaboratorsAddedCount] = useState('')
  const [value, setValue] = useState('')
  const deferredValue = useValueDelayedByTimeout(value.startsWith('@') ? value.trim().slice(1) : value.trim())

  const {data: suggestedCollaborators = defaultSuggestedCollaborators} = useSuggestedCollaborators({
    variables: {query: deferredValue},
  })

  useClickOutside([listRef, inputRef], () => setShowCollaboratorSuggestionsList(false))

  const removeCollaboratorById = useCallback((collab: {id: number; actor_type: ActorType}) => {
    setSelectedCollaborators(previousCollaborators => {
      const newCollaborators = previousCollaborators.filter(
        collaborator => actorIdentifier(collaborator) !== actorIdentifier(collab),
      )
      if (newCollaborators.length === previousCollaborators.length) {
        return previousCollaborators
      }
      return newCollaborators
    })
  }, [])

  const updateInvitationsList = useCallback(
    (failed: Array<string>) => {
      const failedMap = new Set(failed)
      setSelectedCollaborators(previousSelectedCollaborators => {
        const failedCollaborators = new Array<SuggestedCollaborator>()
        for (const collab of previousSelectedCollaborators) {
          if (failedMap.has(`${actorIdentifier(collab)}`)) {
            failedCollaborators.push(collab)
          }
        }
        return failedCollaborators
      })
    },
    [setSelectedCollaborators],
  )

  const selectCollaboratorById = (identifier: string) => {
    const collaboratorToSelect = suggestedCollaborators.find(
      suggestedCollaborator => actorIdentifier(suggestedCollaborator) === identifier,
    )
    if (!collaboratorToSelect) return
    setSelectedCollaborators(previousSelectedCollaborators => {
      const collaboratorAlreadySelected = previousSelectedCollaborators.some(
        selectedCollaborator => actorIdentifier(selectedCollaborator) === actorIdentifier(collaboratorToSelect),
      )
      if (collaboratorAlreadySelected) {
        return previousSelectedCollaborators
      }
      return [...previousSelectedCollaborators, collaboratorToSelect]
    })
  }

  const onSuggestionSelect = (suggestion: SuggestedCollaborator) => {
    if (suggestion.isCollaborator) {
      return
    }

    setShowCollaboratorSuggestionsList(false)
    setValue('')
    selectCollaboratorById(actorIdentifier(suggestion))

    inputRef.current?.focus()
  }

  const onChange = useCallback(({target}: React.ChangeEvent<HTMLInputElement>) => {
    setValue(target.value)
  }, [])

  const onFocus = useCallback(() => {
    setShowCollaboratorSuggestionsList(true)
    setIsInputActive(true)
  }, [setShowCollaboratorSuggestionsList, setIsInputActive])

  const onBlur = useCallback(() => {
    setIsInputActive(false)
  }, [setIsInputActive])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (event.key) {
        case 'Backspace': {
          if (value === '') {
            if (selectedCollaborators.length > 0) {
              const lastCollab = selectedCollaborators[selectedCollaborators.length - 1]
              if (lastCollab) {
                removeCollaboratorById(lastCollab)
              }
            }
          }
          break
        }
      }

      if (invitationRequestState !== CommitState.None) {
        setInvitationRequestState(CommitState.None)
        setCollaboratorsAddedCount('')
      }
    },
    [invitationRequestState, value, selectedCollaborators, removeCollaboratorById],
  )
  const {addToast} = useToasts()

  const {mutate: updateCollaboratorsMutate} = useUpdateCollaboratorsOptimistically()
  const onSubmit = useCallback(() => {
    if (selectedCollaborators.length === 0) {
      return
    }

    return updateCollaboratorsMutate(
      {
        role: selectedRole,
        collaborators: selectedCollaborators.map(i => actorIdentifier(i)),
      },
      {
        onSuccess: ({failed}) => {
          if (failed.length > 0) {
            setInvitationRequestState(CommitState.Failed)
            updateInvitationsList(failed)
          } else {
            setValue('')
            const count = selectedCollaborators.length
            setCollaboratorsAddedCount(`${count} ${count === 1 ? 'user' : 'users'}`)
            setInvitationRequestState(CommitState.Successful)
            setSelectedCollaborators(defaultEmptyArray)
          }
        },
        onError: error => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: ToastType.error,
            message:
              error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
                ? error.message
                : 'Failed to update collaborators',
          })
        },
      },
    )
  }, [addToast, selectedCollaborators, selectedRole, updateCollaboratorsMutate, updateInvitationsList])

  useLayoutEffect(() => {
    const normalizedValue = deferredValue.startsWith('@')
      ? deferredValue.substring(1, deferredValue.length)
      : deferredValue
    const hasNormalizedValue = normalizedValue.length > 0

    setShowCollaboratorSuggestionsList(hasNormalizedValue)
  }, [deferredValue])

  const onPillRemoved = useCallback(
    (collab: {id: number; actor_type: ActorType}) => {
      removeCollaboratorById(collab)
      if (invitationRequestState !== CommitState.None) {
        setInvitationRequestState(CommitState.None)
      }
    },
    [setInvitationRequestState, invitationRequestState, removeCollaboratorById],
  )

  const addCollaboratorsLabel =
    projectOwner && projectOwner.type === 'organization'
      ? ManageAccessResources.addCollaboratorPlaceholderOrgProject
      : ManageAccessResources.addCollaboratorPlaceholderUserProject

  const isSuggestedCollaboratorsListVisible =
    suggestedCollaborators.length > 0 && deferredValue.length > 0 && showCollaboratorSuggestionsList

  return (
    <Box sx={{flexDirection: 'column', flexGrow: 1, display: 'flex'}} {...testIdProps('add-collaborators')}>
      <FormControl sx={{mb: 5, alignItems: 'stretch'}}>
        <FormControl.Label visuallyHidden>Add Collaborators</FormControl.Label>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            my: 2,
          }}
        >
          <Heading as="h3" sx={{fontSize: 4, fontWeight: 'normal'}}>
            Invite collaborators
          </Heading>
          <div>
            <div aria-live="polite">
              {invitationRequestState === CommitState.Successful && (
                <AddCollaboratorSuccess
                  setInvitationRequestState={setInvitationRequestState}
                  collaboratorsAddedCount={collaboratorsAddedCount}
                />
              )}
              {invitationRequestState === CommitState.Failed && <AddCollaboratorError />}
            </div>
          </div>
        </Box>
        <Box sx={{flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'nowrap', display: 'flex'}}>
          <Box
            ref={containerRef}
            onClick={() => inputRef.current?.focus()}
            sx={{
              flex: 1,
              width: '100%',
              display: 'flex',
              boxShadow: isInputActive ? theme => `0 0 0 2px ${theme.colors.accent.fg}` : undefined,
              flexDirection: 'row',
              borderRadius: 2,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: isInputActive ? 'accent.emphasis' : 'border.default',
            }}
          >
            <Octicon icon={PersonIcon} sx={{m: 2, color: 'fg.muted'}} />
            <Box
              sx={{
                flexDirection: 'row',
                display: 'flex',
                flex: 1,
                flexWrap: 'wrap',
                cursor: 'text',
              }}
            >
              {selectedCollaborators.map(collaborator => {
                const id = actorIdentifier(collaborator)
                return (
                  <CollaboratorPill
                    key={id}
                    avatarUrl={collaborator.avatarUrl}
                    login={getCollaboratorDisplayValue(collaborator)}
                    id={id}
                    onRemove={() => onPillRemoved(collaborator)}
                  />
                )
              })}
              <BorderlessTextInput
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isSuggestedCollaboratorsListVisible}
                aria-autocomplete="list"
                aria-controls={FILTER_COLLABORATORS_LIST_ID}
                aria-label={addCollaboratorsLabel}
                style={{
                  flex: 1,
                  width: 'auto',
                  display: 'inline',
                }}
                autoComplete="off"
                value={value}
                ref={inputRef}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                placeholder={addCollaboratorsLabel}
                id="add-collaborators-input"
                {...testIdProps('add-collaborators-input')}
              />

              {isSuggestedCollaboratorsListVisible && (
                <SuggestionsList
                  testId={FILTER_COLLABORATORS_LIST_ID}
                  listRef={listRef}
                  controllingElementRef={inputRef}
                  xOriginEdgeAlign="left"
                  style={{width: '400px'}}
                  items={suggestedCollaborators.map(collaborator => {
                    return {
                      renderItem: () => <CollabSuggestionItem suggestion={collaborator} />,
                      key: collaborator.id,
                      value: getCollaboratorDisplayValue(collaborator),
                      asHTML: true,
                      onSelect: () => onSuggestionSelect(collaborator),
                      testId: `collaborator-suggestion-item-${getCollaboratorDisplayValue(collaborator)}`,
                    }
                  })}
                />
              )}
            </Box>
          </Box>
          <Box sx={{mx: 2}}>
            <CollaboratorRoleDropDown selectedRoles={[selectedRole]} handleOnClick={setSelectedRole} />
          </Box>
          <Button variant="primary" onClick={onSubmit} {...testIdProps('add-collaborators-invite-button')}>
            Invite
          </Button>
        </Box>
      </FormControl>
    </Box>
  )
}

function CollabSuggestionItem({suggestion}: {suggestion: SuggestedCollaborator}) {
  const displayValue = getCollaboratorDisplayValue(suggestion)
  return (
    <span>
      <GitHubAvatar loading="lazy" alt={displayValue} src={suggestion.avatarUrl} sx={{mr: 1}} />
      <Text sx={{color: suggestion.isCollaborator ? 'fg.muted' : 'fg.default'}}>
        {suggestion.name} <Text sx={{color: 'fg.subtle', mx: 1}}>{displayValue}</Text>
      </Text>
      {suggestion.isCollaborator && <Text sx={{color: 'fg.subtle', fontSize: 12}}>&#183; Already a collaborator</Text>}
    </span>
  )
}
