import {announce} from '@github-ui/aria-live'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Heading, Spinner, useConfirm} from '@primer/react'
import debounce from 'lodash-es/debounce'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {partition} from '../../../../../utils/partition'
import {type Collaborator, CollaboratorRole, type Role} from '../../../../api/common-contracts'
import useToasts, {ToastType} from '../../../../components/toasts/use-toasts'
import {getInitialState} from '../../../../helpers/initial-state'
import {CommitState} from '../../../../hooks/use-autosave'
import {
  useAllCollaborators,
  useRemoveCollaboratorsOptimistically,
  useUpdateCollaboratorsOptimistically,
} from '../../../../queries/collaborators'
import {actorIdentifier, getCollaboratorDisplayValue} from '../../../../queries/organization-access'
import {CollaboratorsTableResources} from '../../../../strings'
import {useCollaboratorsFilter} from './collaborators-filter'
import {CollaboratorsListItem} from './collaborators-list-item'
import {CollaboratorsTableHeader} from './collaborators-table-header'

const useSelectedCollaborators = ({
  allCollaboratorActorIdentifiers,
}: {
  allCollaboratorActorIdentifiers: Set<string>
}) => {
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState(() => new Set<string>())

  const nextSelectedCollaboratorIds = new Set<string>(selectedCollaboratorIds)
  for (const id of selectedCollaboratorIds) {
    if (!allCollaboratorActorIdentifiers.has(id)) {
      nextSelectedCollaboratorIds.delete(id)
    }
  }
  if (nextSelectedCollaboratorIds.size !== selectedCollaboratorIds.size) {
    setSelectedCollaboratorIds(nextSelectedCollaboratorIds)
  }

  return [selectedCollaboratorIds, setSelectedCollaboratorIds] as const
}

const roleImportance = {
  [CollaboratorRole.Admin]: 3,
  [CollaboratorRole.Writer]: 2,
  [CollaboratorRole.Reader]: 1,
  [CollaboratorRole.None]: 0,
} as const

function sortCollaboratorsByRole(items: Array<Collaborator>) {
  return items.slice().sort((a, b) => {
    const roleSort = roleImportance[b.role] - roleImportance[a.role]
    if (roleSort !== 0) return roleSort

    const displayValueA = getCollaboratorDisplayValue(a)
    const displayValueB = getCollaboratorDisplayValue(b)
    return displayValueA.localeCompare(displayValueB)
  })
}

const defaultCollaborators = {collaborators: new Array<Collaborator>()}
const CollaboratorsTableComponent = () => {
  const {data: allCollaborators = defaultCollaborators, isLoading, isError} = useAllCollaborators()
  const allCollaboratorActorIdentifiers = useMemo(
    () => new Set(allCollaborators.collaborators.map(actorIdentifier)),
    [allCollaborators],
  )
  const {mutateAsync: removeCollaboratorsMutateAsync} = useRemoveCollaboratorsOptimistically()
  const {mutateAsync: updateCollaboratorsMutateAsync} = useUpdateCollaboratorsOptimistically()
  const confirm = useConfirm()
  const [headerActionRequestState, setHeaderActionRequestState] = useState<CommitState>(CommitState.None)
  const {query, match} = useCollaboratorsFilter()
  const firstRender = useRef(true)

  const filteredCollaborators = useMemo(() => {
    return allCollaborators.collaborators.filter(match)
  }, [match, allCollaborators])

  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useSelectedCollaborators({
    allCollaboratorActorIdentifiers,
  })

  const dangerAction = useCallback(
    async (
      args: {actorIds: Set<string>; role?: Role},
      action: (actionArgs: {collaborators: Array<string>; role?: Role}) => Promise<{failed: Array<string>}>,
    ) => {
      const {actorIds, role} = args
      const {loggedInUser} = getInitialState()
      const loggedInActorId = `user/${loggedInUser?.id}`
      let isLoggedInUser = false

      if (loggedInUser?.id) {
        isLoggedInUser = actorIds.has(loggedInActorId)
      }
      if (isLoggedInUser) {
        if (
          await confirm({
            title: `Remove yourself as admin?`,
            content: `Are you sure you want to remove yourself as Admin? You will lose access to Settings`,
            confirmButtonContent: 'Remove',
            confirmButtonType: 'danger',
          })
        ) {
          const {failed} = await action({collaborators: Array.from(actorIds), role})
          if (failed.length > 0 && actorIds.size > 1 && failed.includes(loggedInActorId)) {
            setHeaderActionRequestState(CommitState.Failed)
          } else {
            const projectPath = window.location.pathname.substring(0, window.location.pathname.indexOf('/settings'))
            window.location.assign(projectPath)
          }
        }
      } else {
        const {failed} = await action({role, collaborators: Array.from(actorIds)})
        if (failed.length > 0 && actorIds.size > 1) {
          setHeaderActionRequestState(CommitState.Failed)
        }
      }
    },
    [confirm],
  )

  const onRemoveButtonClick = async (actorIds: Set<string>) => {
    setHeaderActionRequestState(CommitState.None)
    await dangerAction({actorIds}, args => {
      return removeCollaboratorsMutateAsync(args, {
        onError: error => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: ToastType.error,
            message:
              error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
                ? error.message
                : 'Failed to remove collaborators',
          })
        },
      })
    })
  }
  const {addToast} = useToasts()
  const onRoleDropDownItemClick = async (role: Role, actorIds: Set<string>) => {
    setHeaderActionRequestState(CommitState.None)
    await dangerAction({role, actorIds}, async ({collaborators: collabs, role: updatedRole}) => {
      if (!updatedRole) {
        throw new Error('you must specify a Role to assign to the selected collaborators')
      }
      return updateCollaboratorsMutateAsync(
        {collaborators: collabs, role: updatedRole},
        {
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
    })
  }

  const onHeaderDropDownButtonClick = () => {
    setHeaderActionRequestState(CommitState.None)
  }

  // this callback is reacting on choosing a collaborator via checkbox in collaborators list
  const onSingleCheckboxChange = useCallback(
    ({target: {name: actor, checked}}: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedCollaboratorIds(currentSelectedIds => {
        const checkedActors = new Set(currentSelectedIds)
        if (checked && allCollaboratorActorIdentifiers.has(actor) !== undefined) {
          checkedActors.add(actor)
        } else {
          checkedActors.delete(actor)
        }
        return checkedActors
      })
    },
    [allCollaboratorActorIdentifiers, setSelectedCollaboratorIds],
  )

  // this callback is reacting on choosing all collaborators via checkbox in the table header
  const onBulkCheckboxChange = useCallback(
    (checkbox: React.ChangeEvent<HTMLInputElement>) => {
      if (checkbox.target.checked) {
        setSelectedCollaboratorIds(new Set(filteredCollaborators.map(actorIdentifier)))
      } else {
        setSelectedCollaboratorIds(new Set())
      }
    },
    [filteredCollaborators, setSelectedCollaboratorIds],
  )

  const [{length: userCount}, {length: teamCount}] = useMemo(
    () => partition(allCollaborators.collaborators, item => item.actor_type === 'user'),
    [allCollaborators.collaborators],
  )

  const rows = sortCollaboratorsByRole(filteredCollaborators).map((collaborator, index) => (
    <CollaboratorsListItem
      key={`collaborator-row-${collaborator.id}-${collaborator.role}`}
      collaborator={collaborator}
      isLastItem={index === filteredCollaborators.length - 1}
      isSelected={selectedCollaboratorIds.has(actorIdentifier(collaborator))}
      onCheckboxChange={onSingleCheckboxChange}
      onDropDownClick={onRoleDropDownItemClick}
      onRemoveButtonClick={onRemoveButtonClick}
    />
  ))

  const debounceAnnouncement = debounce((announcement: string) => {
    announce(announcement, {assertive: true})
  }, 100)

  useEffect(() => {
    // Ensure we don't announce on first render
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    if (isLoading) return

    if (isError) {
      debounceAnnouncement(CollaboratorsTableResources.error)
      return
    }

    // Announce when there are no collaborators to match the blankslate message
    if (allCollaborators.collaborators.length === 0 && query.length === 0) {
      debounceAnnouncement(CollaboratorsTableResources.noCollaborators)
      return
    }

    if (rows.length === 0) {
      debounceAnnouncement(CollaboratorsTableResources.filtering)
    } else {
      debounceAnnouncement(CollaboratorsTableResources.collaboratorsFound(rows.length))
    }
    // We only want to run this effect when the user's query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <>
      <Heading as="h3" sx={{mb: 2, fontSize: 4, fontWeight: 'normal'}}>
        Manage access
      </Heading>
      <Box
        {...testIdProps('collaborators-table')}
        sx={{borderRadius: 2, border: '1px solid', borderColor: 'border.subtle', bg: 'canvas.default'}}
        data-team-hovercards-enabled
      >
        <CollaboratorsTableHeader
          userCount={userCount}
          teamCount={teamCount}
          selectedCollaboratorIds={selectedCollaboratorIds}
          showError={headerActionRequestState === CommitState.Failed}
          onCheckBoxChange={onBulkCheckboxChange}
          onDropDownItemClick={onRoleDropDownItemClick}
          onRemoveButtonClick={onRemoveButtonClick}
          onDropDownButtonClick={onHeaderDropDownButtonClick}
        />
        {isLoading ? (
          <Box sx={{justifyContent: 'center', my: 4, display: 'flex'}}>
            <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
              <Box sx={{mb: 2}}>
                <Spinner size="medium" />
              </Box>
              <span>Loading collaborators...</span>
            </Box>
          </Box>
        ) : isError ? (
          <BlankSlateMessage type={CollaboratorsTableBlankslate.Error} />
        ) : rows.length === 0 ? (
          query.length > 0 ? (
            <BlankSlateMessage type={CollaboratorsTableBlankslate.Filtering} />
          ) : (
            <BlankSlateMessage type={CollaboratorsTableBlankslate.NoCollaborators} />
          )
        ) : (
          rows
        )}
      </Box>
    </>
  )
}

const CollaboratorsTableBlankslate = {
  Error: 'error',
  NoCollaborators: 'no-collaborators',
  Filtering: 'filtering',
} as const
type CollaboratorsTableBlankslate = ObjectValues<typeof CollaboratorsTableBlankslate>

const blankslates = new Map([
  [CollaboratorsTableBlankslate.Error, {title: CollaboratorsTableResources.error, message: 'Please try again later.'}],
  [
    CollaboratorsTableBlankslate.NoCollaborators,
    {title: CollaboratorsTableResources.noCollaborators, message: 'Add a collaborator to see them here.'},
  ],
  [
    CollaboratorsTableBlankslate.Filtering,
    {title: CollaboratorsTableResources.filtering, message: 'Try to change or remove some filters to see results.'},
  ],
])

function BlankSlateMessage({type}: {type: CollaboratorsTableBlankslate}) {
  const blankslate = blankslates.get(type)
  if (!blankslate) throw new Error('invalid blankslate type')
  return (
    <div className="blankslate" {...testIdProps(`collaborators-table-blankslate-${type}`)}>
      <h3 {...testIdProps('collaborators-table-empty-title')}>{blankslate.title}</h3>
      <p {...testIdProps('collaborators-table-empty-message')}>{blankslate.message}</p>
    </div>
  )
}

export const CollaboratorsTable = memo(CollaboratorsTableComponent)
