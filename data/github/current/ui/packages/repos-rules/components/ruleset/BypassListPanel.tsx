import type {FC, RefObject} from 'react'
import {useRef, useMemo, useState} from 'react'
import {Box, Button, Heading, Text} from '@primer/react'
import {PlusIcon} from '@primer/octicons-react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Blankslate} from '../Blankslate'
import {type BypassActor, ActorBypassMode, OrgAdminBypassMode} from '@github-ui/bypass-actors/types'
import {BypassDialog} from '@github-ui/bypass-actors/BypassDialog'
import {BypassList} from '@github-ui/bypass-actors/BypassList'
import {BypassSelectPanel} from '@github-ui/bypass-actors/BypassSelectPanel'
import type {RulesetRoutePayload, RulesetTarget} from '../../types/rules-types'
import {getBypassSuggestions} from '../../services/api'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'
import {ListView} from '@github-ui/list-view'
import type {FlashAlert} from '@github-ui/dismissible-flash'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

import {DEPLOY_KEY_BYPASS_ACTOR, ORGANIZATION_ADMIN_ROLE} from '@github-ui/bypass-actors/constants'
import {capitalize} from '../../helpers/string'

export type BypassListPanelProps = {
  readOnly?: boolean
  bypassActors: BypassActor[]
  setBypassActors: (bypassActors: BypassActor[]) => void
  addBypassActor: (
    actorId: BypassActor['actorId'],
    actorType: BypassActor['actorType'],
    name: BypassActor['name'],
    bypassMode: BypassActor['bypassMode'],
    owner: BypassActor['owner'],
  ) => void
  rulesetTarget: RulesetTarget
  removeBypassActor: (bypassActor: BypassActor) => void
  updateBypassActor: (bypassActor: BypassActor) => void
  orgAdminBypassMode: OrgAdminBypassMode
  setFlashAlert: (flashAlert: FlashAlert) => void
  deployKeyBypass: boolean
}

export const BypassListPanel: FC<BypassListPanelProps> = ({
  readOnly,
  bypassActors,
  addBypassActor,
  removeBypassActor,
  rulesetTarget,
  orgAdminBypassMode,
  deployKeyBypass,
  updateBypassActor,
  setFlashAlert,
}: BypassListPanelProps) => {
  const {baseAvatarUrl, sourceType} = useRoutePayload<RulesetRoutePayload>()
  const {resolvePath} = useRelativeNavigation()
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false)

  const [showBypassDialog, setShowBypassDialog] = useState(false)
  const [initialSuggestions, setInitialSuggestions] = useState<BypassActor[]>([])

  const isBypassModeEnabled = rulesetTarget === 'branch'
  const bypassSuggestionsUrl = resolvePath('bypass_suggestions')

  const enabledBypassActors = useMemo(() => {
    let actors: BypassActor[] = []
    if (
      orgAdminBypassMode === OrgAdminBypassMode.OrgBypassAny ||
      orgAdminBypassMode === OrgAdminBypassMode.OrgBypassPRsOnly
    ) {
      actors = [
        ...actors,
        {
          ...ORGANIZATION_ADMIN_ROLE,
          bypassMode:
            orgAdminBypassMode === OrgAdminBypassMode.OrgBypassAny ? ActorBypassMode.ALWAYS : ActorBypassMode.PRS_ONLY,
        },
      ]
    }
    if (deployKeyBypass) {
      actors = [...actors, DEPLOY_KEY_BYPASS_ACTOR]
    }
    return [
      ...actors,
      ...bypassActors
        .filter(({_enabled}) => _enabled)
        .sort(a => (a.name === 'admin' && a.actorType === 'RepositoryRole' ? -1 : 0)),
    ]
  }, [bypassActors, deployKeyBypass, orgAdminBypassMode])

  async function prepopulateSuggestions() {
    try {
      setIsLoadingSuggestions(true)
      const bypassSuggestions = await getBypassSuggestions(bypassSuggestionsUrl, '')
      setIsLoadingSuggestions(false)
      setInitialSuggestions(bypassSuggestions)
    } catch (e) {
      setFlashAlert({
        variant: 'danger',
        message: 'Failed to fetch suggestions',
      })
    }
  }

  function orgAdminInBypassList() {
    return (
      orgAdminBypassMode === OrgAdminBypassMode.OrgBypassAny ||
      orgAdminBypassMode === OrgAdminBypassMode.OrgBypassPRsOnly
    )
  }

  const focusReturnRef = useRef<HTMLButtonElement>(null)

  function onClose() {
    setShowBypassDialog(false)

    setTimeout(() => {
      focusReturnRef.current?.focus()
    })
  }

  const listName = rulesetTarget === 'member_privilege' ? 'allow list' : 'bypass list'

  let subtext = `Exempt roles${
    sourceType === 'repository' ? ', teams, or apps' : ' or teams'
  } from this ruleset by adding
    them to the ${listName}.`

  const pushRulesetDelegatedBypass = useFeatureFlag('push_ruleset_delegated_bypass')
  if (rulesetTarget === 'push' && pushRulesetDelegatedBypass) {
    subtext = `Select the roles and teams that can bypass and also approve bypass requests. Add the bots that can bypass this ruleset.`
  }

  const primerBypassSelectPanel = useFeatureFlag('add_bypass_dialog_select_panel_v1')
  return (
    <>
      <Box
        className="Box"
        sx={{
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
          borderRadius: 0,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Heading as="h2" sx={{fontSize: 4, fontWeight: 'normal'}}>
          {capitalize(listName)}
        </Heading>
        {primerBypassSelectPanel ? (
          !readOnly && (
            <BypassSelectPanel
              baseAvatarUrl={baseAvatarUrl}
              enabledBypassActors={enabledBypassActors}
              addBypassActor={addBypassActor}
              removeBypassActor={removeBypassActor}
              suggestionsUrl={bypassSuggestionsUrl}
              addReviewerSubtitle={'Choose which roles, teams, and apps can bypass this ruleset'}
            />
          )
        ) : (
          <>
            <AddBypassButton
              readOnly={readOnly}
              prepopulateSuggestions={prepopulateSuggestions}
              setShowBypassDialog={setShowBypassDialog}
              isLoadingSuggestions={isLoadingSuggestions}
              focusReturnRef={focusReturnRef}
            />
            {!readOnly && showBypassDialog && (
              <BypassDialog
                onClose={onClose}
                baseAvatarUrl={baseAvatarUrl}
                enabledBypassActors={enabledBypassActors}
                addBypassActor={addBypassActor}
                initialSuggestions={initialSuggestions}
                suggestionsUrl={bypassSuggestionsUrl}
                addReviewerSubtitle={'Choose which roles, teams, and apps can bypass this ruleset'}
              />
            )}
          </>
        )}
      </Box>
      <Text sx={{mt: 2, mb: 3, color: 'fg.muted'}}>{subtext}</Text>
      <div className="Box">
        {enabledBypassActors.length > 0 || orgAdminInBypassList() ? (
          <ListView title={capitalize(listName)}>
            <BypassList
              readOnly={readOnly}
              removeBypassActor={removeBypassActor}
              isBypassModeEnabled={isBypassModeEnabled}
              orgAdminBypassMode={orgAdminBypassMode}
              updateBypassActor={updateBypassActor}
              enabledBypassActors={enabledBypassActors}
              baseAvatarUrl={baseAvatarUrl}
            />
          </ListView>
        ) : (
          <Blankslate heading={`${capitalize(listName)} is empty`} />
        )}
      </div>
    </>
  )
}

type AddBypassButtonProps = {
  readOnly?: boolean
  prepopulateSuggestions: () => void
  setShowBypassDialog: (bypassDialog: boolean) => void
  isLoadingSuggestions: boolean
  focusReturnRef: RefObject<HTMLButtonElement>
}

const AddBypassButton: FC<AddBypassButtonProps> = ({
  readOnly,
  prepopulateSuggestions,
  setShowBypassDialog,
  isLoadingSuggestions,
  focusReturnRef,
}: AddBypassButtonProps) => {
  return (
    <>
      {!readOnly ? (
        <div className="d-flex flex-items-center">
          <Button
            ref={focusReturnRef}
            aria-label="Add bypass"
            onClick={async () => {
              await prepopulateSuggestions()
              setShowBypassDialog(true)
            }}
            disabled={isLoadingSuggestions}
          >
            <PlusIcon /> Add bypass
          </Button>
        </div>
      ) : null}
    </>
  )
}
