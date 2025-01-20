import {useCallback, useEffect, useRef, useState} from 'react'
import {ActionList, ActionMenu, Button, Heading, IconButton, Label} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {XIcon} from '@primer/octicons-react'
import type {FieldComponentProps, Team} from '../../types'
import {useFormField} from '../../hooks/use-form-field'
import {useBasePath} from '../../contexts/BasePathContext'

import {GitHubAvatar} from '@github-ui/github-avatar'
import {BypassDialog} from '@github-ui/bypass-actors/BypassDialog'
import {useBaseAvatarUrl} from '../../contexts/BaseAvatarUrlContext'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

const roles = ['read', 'triage', 'write', 'maintain', 'admin']

type AccessPermissionsFieldProps = FieldComponentProps<Team[]> & {
  inheritedTeams?: Team[]
}

export function AccessPermissionsField({
  initialValue = [],
  inheritedTeams = [],
  inherited = false,
}: AccessPermissionsFieldProps) {
  const basePath = useBasePath()
  const baseAvatarUrl = useBaseAvatarUrl()
  const field = useFormField('accessPermissions', initialValue)
  const [showDialog, setShowDialog] = useState(false)
  const [initialSuggestions, setInitialSuggestions] = useState([])
  const hasFetchedInitialSuggestions = useRef(false)

  const updateTeam = useCallback(
    ({id, name, role = 'read'}: {id: number; name: string; role: string}) => {
      const teamIndex = field.value.findIndex(team => team.id === id)
      if (teamIndex !== -1) {
        field.update([
          ...field.value.slice(0, teamIndex),
          {
            id,
            name,
            role,
          },
          ...field.value.slice(teamIndex + 1),
        ])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.update, field.value],
  )

  const addTeam = useCallback(
    (actorId: number, actorType: string, name: string) => {
      field.update([
        ...field.value,
        {
          id: actorId,
          name,
          role: 'read',
        },
      ])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.update, field.value],
  )

  const removeTeam = useCallback(
    (id: number) => {
      const teamIndex = field.value.findIndex(team => team.id === id)
      if (teamIndex !== -1) {
        field.update([...field.value.slice(0, teamIndex), ...field.value.slice(teamIndex + 1)])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.update, field.value],
  )

  useEffect(() => {
    if (!hasFetchedInitialSuggestions.current) {
      hasFetchedInitialSuggestions.current = true
      const fetcher = async () => {
        const response = await verifiedFetchJSON(`${basePath}/suggestions/access_permissions`)
        if (response.ok) {
          const suggestions = await response.json()
          setInitialSuggestions(suggestions)
        }
      }
      fetcher()
    }
  }, [basePath, hasFetchedInitialSuggestions])

  const teamCount = field.value.length + inheritedTeams.length

  return (
    <>
      <div className="Box">
        <div className="Box-header py-2">
          <div className="Box-title d-flex flex-justify-between flex-items-center">
            <Heading as="h3" className="f5">
              {teamCount} team{teamCount === 1 ? '' : 's'}
            </Heading>
            {!inherited ? <Button onClick={() => setShowDialog(true)}>Add people or teams</Button> : null}
          </div>
        </div>
        {field.value.length + inheritedTeams.length > 0 ? (
          <ul>
            {inheritedTeams.map(team => (
              <li key={team.id} className="Box-row d-flex flex-justify-between">
                <div className="d-flex flex-row flex-items-center gap-2">
                  <GitHubAvatar alt={team.name} src={`${baseAvatarUrl}/t/${team.id}`} size={32} />
                  {team.name}
                  <Label>Inherited</Label>
                </div>
                <div className="d-flex flex-row flex-items-center mr-2">
                  <Label className="mr-4 p-3">{team.role}</Label>
                </div>
              </li>
            ))}
            {field.value.map(actor => (
              <li key={actor.id} className="Box-row d-flex flex-justify-between">
                <div className="d-flex flex-row flex-items-center gap-2">
                  <GitHubAvatar alt={actor.name} src={`${baseAvatarUrl}/t/${actor.id}`} size={32} />
                  {actor.name}
                </div>
                {!inherited ? (
                  <div className="d-flex flex-row flex-items-center">
                    <ActionMenu>
                      <ActionMenu.Button>
                        <span className="fg-color-muted">Options:</span> {actor.role}
                      </ActionMenu.Button>
                      <ActionMenu.Overlay width="auto">
                        <ActionList selectionVariant="single">
                          {roles.map(role => (
                            <ActionList.Item
                              key={role}
                              selected={role === actor.role}
                              onSelect={() =>
                                updateTeam({
                                  id: actor.id,
                                  name: actor.name,
                                  role,
                                })
                              }
                            >
                              {role}
                            </ActionList.Item>
                          ))}
                        </ActionList>
                      </ActionMenu.Overlay>
                    </ActionMenu>
                    {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                    <IconButton
                      icon={XIcon}
                      aria-label={`Stop managing ${actor.name}`}
                      variant="invisible"
                      onClick={() => removeTeam(actor.id)}
                      unsafeDisableTooltip={true}
                    />
                  </div>
                ) : (
                  <div className="d-flex flex-row flex-items-center mr-2">
                    <Label className="mr-4 p-3">{actor.role}</Label>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Blankslate>
            <Blankslate.Heading as="h3">No teams added</Blankslate.Heading>
          </Blankslate>
        )}
      </div>
      {showDialog && (
        <BypassDialog
          baseAvatarUrl={baseAvatarUrl}
          // @ts-expect-error types aren't fully compat
          enabledBypassActors={field.value}
          initialSuggestions={initialSuggestions}
          onClose={() => setShowDialog(false)}
          // @ts-expect-error types aren't fully compat
          addBypassActor={addTeam}
          suggestionsUrl={`${basePath}/suggestions/access_permissions`}
          addReviewerSubtitle={'Choose which roles and teams can bypass this ruleset'}
        />
      )}
    </>
  )
}
