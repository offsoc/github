import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useRef, useEffect, useState, useCallback, createRef, type RefObject} from 'react'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Link} from '@github-ui/react-core/link'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {Flash, IconButton, ActionMenu, Button, Label, Box} from '@primer/react'
import {KebabHorizontalIcon, NoEntryIcon} from '@primer/octicons-react'
import {FlashUpsellBanner, UpsellBanner} from '../components/UpsellBanner'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {useIsStafftools} from '../hooks/use-is-stafftools'
import {useRuleset} from '../hooks/use-ruleset'
import {
  type IncludeExcludeParameters,
  type RepositoryIdParameters,
  type OrganizationIdParameters,
  RulesetEnforcement,
  type RulesetRoutePayload,
  type ValidationError,
  type RulesetTarget,
  type Ruleset,
  type UpsellInfo,
  type ParameterSchema,
  type ErrorRef,
} from '../types/rules-types'
import {getRuleset, setRuleset} from '../services/api'
import {GeneralPanel} from '../components/ruleset/GeneralPanel'
import {TargetsPanel} from '../components/ruleset/TargetsPanel'
import {RulesPanel} from '../components/ruleset/RulesPanel'
import {BypassListPanel} from '../components/ruleset/BypassListPanel'
import {DangerConfirmationDialog} from '../components/ruleset/DangerConfirmationDialog'
import sudo from '@github-ui/sudo'
import {RulesetActionMenu} from '../components/RulesetActionMenu'
import {TARGET_OBJECT_BY_TYPE} from '../helpers/constants'
import type {Repository} from '@github-ui/current-repository'
import {isRulesetInherited} from '../helpers/utils'
import {PageHeader} from '@primer/react/drafts'
import {enforcementLabelText} from '../helpers/enforcement-label'
import {DismissibleFlashOrToast, type FlashAlert} from '@github-ui/dismissible-flash'
import {useTargetCount} from '../hooks/use-target-count'
import {humanize} from '../helpers/string'

export function RulesetPage() {
  const rulesHistory = useFeatureFlag('rules_history')
  const rulesImportExport = useFeatureFlag('rules_import_export')
  const isStafftools = useIsStafftools()
  const {
    source,
    sourceType,
    upsellInfo,
    currentName,
    ruleset: initialRuleset,
    ruleSchemas: initialRuleSchemas,
    readOnly = false,
    isHistoryView = false,
    supportedConditionTargetObjects,
    helpUrls,
    isImportedRuleset,
    isRestoredRuleset,
    noRulesets,
    initialErrors,
  } = useRoutePayload<RulesetRoutePayload>()

  const {
    rulesetId,
    rulesetTarget,
    rulesetName,
    rulesetNameError,
    dirtyRulesetName,
    orgAdminBypassMode,
    dirtyOrgAdminBypassMode,
    deployKeyBypass,
    dirtyDeployKeyBypass,
    enforcement,
    dirtyEnforcement,
    rules,
    ruleSchemas,
    dirtyRules,
    conditions,
    dirtyConditions,
    bypassActors,
    setBypassActors,
    dirtyBypassActors,
    initializeRuleset,
    addRule,
    removeRule,
    restoreRule,
    setRuleModalState,
    updateRuleParameters,
    addOrUpdateCondition,
    removeCondition,
    renameRuleset,
    setRulesetEnforcement,
    addBypassActor,
    removeBypassActor,
    updateBypassActor,
    validateForm,
  } = useRuleset(initialRuleset, initialRuleSchemas)

  const [serverRulesets, setServerRulesets] = useState([initialRuleset])

  const {rulesetPreviewCounts, rulesetPreviewSamples, rulesetPreviewErrors} = useTargetCount(
    source,
    sourceType,
    serverRulesets,
  )

  const {navigate, resolvePath} = useRelativeNavigation()

  const form = useRef<HTMLFormElement>(null)
  const rulesetNameRef = useRef<HTMLInputElement>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rulesetToExport, setRulesetToExport] = useState(initialRuleset)
  const [flashAlert, setFlashAlert] = useState<FlashAlert>({message: '', variant: 'default'})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [ruleErrors, setRuleErrors] = useState<Record<string, ValidationError[]>>(initialErrors?.rules || {})
  const [generalErrors, setGeneralErrors] = useState<Record<string, ValidationError[]>>(initialErrors?.general || {})
  const [conditionErrors, setConditionErrors] = useState<Record<string, ValidationError[]>>(
    initialErrors?.conditions || {},
  )
  const [errorRefs, setErrorRefs] = useState<ErrorRef>({})
  const repositoryConditionRef = useRef<HTMLButtonElement | null>(null)
  const refConditionRef = useRef<HTMLButtonElement | null>(null)
  const flashRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Any time the errors change, focus on the first error
    focusOnFirstError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleErrors, generalErrors, conditionErrors, errorMessage])

  // Focus on the first field on initial render
  useEffect(() => {
    rulesetNameRef?.current?.focus()
  }, [])

  useEffect(() => {
    flashRef.current?.focus()
  }, [flashAlert, flashRef])

  const createRefsForRuleSchema = useCallback((parameterSchema: ParameterSchema) => {
    const refs: Record<string, RefObject<HTMLElement>> = {}
    for (const field of parameterSchema.fields) {
      refs[field.name] = createRef<HTMLElement>()
    }
    return refs
  }, [])

  // Set the refs for all the possible rule error fields
  useEffect(() => {
    const refs: ErrorRef = {}
    for (const ruleSchema of ruleSchemas) {
      refs[ruleSchema.type] = {
        // Ref for the base rule
        errorRef: createRef<HTMLDivElement>(),
        // Refs for each rule field
        fields: createRefsForRuleSchema(ruleSchema.parameterSchema),
      }
    }
    setErrorRefs(refs)
  }, [ruleSchemas, createRefsForRuleSchema])

  function resetErrors() {
    setRuleErrors({})
    setConditionErrors({})
    setGeneralErrors({})
    setErrorMessage(null)
  }

  const isFormDirty =
    dirtyRules.length > 0 ||
    dirtyConditions.length > 0 ||
    dirtyBypassActors.length > 0 ||
    dirtyOrgAdminBypassMode !== orgAdminBypassMode ||
    dirtyDeployKeyBypass !== deployKeyBypass ||
    dirtyRulesetName !== rulesetName ||
    dirtyEnforcement !== enforcement

  const isInherited = isRulesetInherited({type: sourceType, id: source.id}, initialRuleset)

  const dirtyMessage = 'You have unsaved changes. Are you sure you want to leave this page?'

  // Parse the errors to determine the first to focus on
  // If there is no best field, we fallback to the form flash banner
  // error is the error from the catch block when attempting to save the ruleset
  function focusOnFirstError() {
    if (
      errorMessage ||
      Object.keys(generalErrors).length ||
      Object.keys(ruleErrors).length ||
      Object.keys(conditionErrors).length
    ) {
      // General errors
      // The only general field that can have an error is the name field
      if (generalErrors.name && generalErrors.name?.length > 0) {
        rulesetNameRef.current?.focus()
        return
      }

      if (Object.keys(conditionErrors).length > 0) {
        // Repository is first
        if (conditionErrors.repository && repositoryConditionRef.current) {
          repositoryConditionRef.current.focus()
          return
        }
        // Refs are after
        if (conditionErrors.ref && refConditionRef.current) {
          refConditionRef.current.focus()
          return
        }
      }

      // Rule errors
      if (ruleErrors) {
        // find the first rule error where we have a rule ref
        const firstRuleErrorType = Object.keys(ruleErrors).find(ruleType => errorRefs[ruleType])
        if (firstRuleErrorType) {
          // Focus on the rule-level error if present
          if (errorRefs[firstRuleErrorType]?.errorRef.current) {
            errorRefs[firstRuleErrorType]?.errorRef?.current?.focus()
            return
          }
          // Check if we can focus on a specific fie  ld
          const fields = firstRuleErrorType ? errorRefs[firstRuleErrorType]?.fields : null
          if (fields) {
            // We know the key exists because it's how we got `firstRuleErrorType`, so we can safely use `!`
            for (const ruleError of ruleErrors[firstRuleErrorType]!) {
              if (ruleError.field && fields[ruleError.field]?.current) {
                fields[ruleError.field]?.current?.focus()
                return
              }
            }
          }
        }
      }

      // If we get here, then we couldn't find someting to focus on, so use the flash banner
      setFlashAlert({message: errorMessage || 'Failed to save ruleset', variant: 'danger'})
    }
  }

  const noTargetsHelper = (conditionTargetObject: string) => {
    const targetedCondition = conditions.find(
      condition => TARGET_OBJECT_BY_TYPE[condition.target] === conditionTargetObject,
    )
    if (targetedCondition) {
      if (targetedCondition.target === 'repository_id') {
        return (targetedCondition.parameters as RepositoryIdParameters).repository_ids.length === 0
      } else if (targetedCondition.target === 'organization_id') {
        return (targetedCondition.parameters as OrganizationIdParameters).organization_ids.length === 0
      } else {
        const includeExcludeParams = targetedCondition.parameters as IncludeExcludeParameters
        return includeExcludeParams.include.length === 0 && includeExcludeParams.exclude.length === 0
      }
    } else return true
  }

  const noTargets = () => {
    return (
      supportedConditionTargetObjects.length > 0 &&
      supportedConditionTargetObjects.every(targetObject => noTargetsHelper(targetObject))
    )
  }

  useEffect(() => {
    document.body.setAttribute('data-turbo', 'false')
    window.onbeforeunload = isFormDirty
      ? e => {
          e.returnValue = dirtyMessage
        }
      : null

    return () => {
      document.body.removeAttribute('data-turbo')
      window.onbeforeunload = null
    }
  }, [dirtyMessage, isFormDirty])

  const onGoBack = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()

    if (isFormDirty && !window.confirm(dirtyMessage)) {
      return
    }

    navigate('..')
    window.onbeforeunload = null
  }

  const onRevertForm = async () => {
    if (isReverting || isSaving) {
      return
    }

    if (!isFormDirty) {
      setFlashAlert({message: 'No changes have been made', variant: 'default'})
      return
    }

    setIsReverting(true)

    try {
      const response = await getRuleset(resolvePath(''))
      const ruleset = response.payload.ruleset
      const updatedRuleSchemas = response.payload.ruleSchemas

      initializeRuleset({
        ruleset,
        source,
        sourceType,
        upsellInfo,
        ruleSchemas: updatedRuleSchemas,
        baseAvatarUrl: response.payload.baseAvatarUrl,
        supportedConditionTargetObjects: response.payload.supportedConditionTargetObjects,
        helpUrls: response.payload.helpUrls,
      })

      resetErrors()

      setFlashAlert({message: 'Changes reverted', variant: 'success'})
    } catch (e) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      setFlashAlert({message: e.message || 'Failed to get saved ruleset', variant: 'danger'})
    }
    setIsReverting(false)
  }

  async function canFormBeSaved() {
    const validationErrors = await validateForm()
    if (Object.values(validationErrors).some(x => x)) {
      // We currently only have client-side validation on the ruleset name
      // So we know if there are any errors, it must be from that field
      if (rulesetNameRef.current && !!validationErrors.name) {
        rulesetNameRef.current.focus()
      }
      return false
    }
    return true
  }

  const saveRuleset = async () => {
    if (isSaving || isReverting || !form.current) {
      return
    }

    setIsSaving(true)

    resetErrors()

    // We should reset the flash alert on save to not confuse subsequent requests with the previous one
    // since we may not always show a flash alert after save
    setFlashAlert({message: '', variant: 'default'})

    if (!(await sudo())) {
      setFlashAlert({message: 'Unauthorized', variant: 'danger'})
      setIsSaving(false)
      return
    }

    if (!(await canFormBeSaved())) {
      setIsSaving(false)
      return
    }

    try {
      const updatedRuleset = {
        ...initialRuleset,
        orgAdminBypassMode: dirtyOrgAdminBypassMode,
        deployKeyBypass: dirtyDeployKeyBypass,
        name: dirtyRulesetName,
        enforcement: dirtyEnforcement,
        rules,
        conditions,
        bypassActors,
      }

      const response = await setRuleset(resolvePath(''), updatedRuleset)
      setRulesetToExport(response.ruleset)
      initializeRuleset(response)
      setServerRulesets([response.ruleset])

      if (!updatedRuleset.id) {
        navigate(`../${response.ruleset.id}`, undefined, true, true)
        setFlashAlert({message: isImportedRuleset ? 'Ruleset imported' : 'Ruleset created', variant: 'success'})
      } else if (isRestoredRuleset) {
        navigate('', undefined, true, true)
        setFlashAlert({message: 'Ruleset restored', variant: 'success'})
      } else {
        setFlashAlert({message: 'Ruleset updated', variant: 'success'})
      }
    } catch (e) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (e.message === 'No changes have been made') {
        // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
        setFlashAlert({message: e.message, variant: 'default'})
      } else {
        // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
        if (e.details) {
          // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
          setRuleErrors(e.details.rules as Record<string, ValidationError[]>)
          // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
          setConditionErrors(e.details.conditions as Record<string, ValidationError[]>)
          // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
          setGeneralErrors(e.details.general as Record<string, ValidationError[]>)
          // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
          setErrorMessage(e.message)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  const deleteRuleset = async () => {
    if (!(await sudo())) {
      setShowDeleteDialog(false)
      setFlashAlert({
        variant: 'danger',
        message: 'Unauthorized',
      })
      return
    }

    try {
      const res = await verifiedFetch(resolvePath(''), {
        method: 'delete',
      })
      if (res.ok) {
        navigate('..', undefined, true, true)
      } else {
        setShowDeleteDialog(false)
        setFlashAlert({
          variant: 'danger',
          message: 'Error deleting ruleset',
        })
      }
    } catch (e) {
      setShowDeleteDialog(false)
      setFlashAlert({
        variant: 'danger',
        message: 'Error deleting ruleset',
      })
    }
  }

  const upsellHeaderText =
    rulesetTarget === 'member_privilege'
      ? 'Protect your most important repositories'
      : 'Protect your most important branches'

  return (
    <div className="settings-next position-relative">
      <DismissibleFlashOrToast flashAlert={flashAlert} setFlashAlert={setFlashAlert} ref={flashRef} />

      <PageHeader
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <RulesHeader
          rulesetTarget={rulesetTarget}
          resolvePath={resolvePath}
          onGoBack={onGoBack}
          isHistoryView={isHistoryView}
          currentName={currentName}
          rulesetId={rulesetId}
          rulesetName={rulesetName}
          readOnly={readOnly}
          isStafftools={isStafftools}
          isInherited={isInherited}
          rulesetToExport={rulesetToExport}
          upsellInfo={upsellInfo}
          isRestoredRuleset={isRestoredRuleset}
          enforcement={enforcement}
          setFlashAlert={setFlashAlert}
        />
      </PageHeader>
      <hr />

      <form
        method="post"
        action={resolvePath('')}
        ref={form}
        noValidate
        onSubmit={async e => {
          e.preventDefault()
          saveRuleset()
        }}
      >
        {noRulesets ? (
          <UpsellBanner
            headingText={upsellHeaderText}
            withBorder={true}
            showNewRulesetButton={false}
            supportedRulesetTargets={[]}
            askAdmin={upsellInfo.askAdmin}
            infoVariant="one"
            sourceType={sourceType}
            cta={upsellInfo.rulesets.cta}
            organization={upsellInfo.organization}
            setFlashAlert={setFlashAlert}
          />
        ) : (
          upsellInfo?.rulesets.cta.visible && (
            <FlashUpsellBanner
              organization={upsellInfo.organization}
              askAdmin={upsellInfo.askAdmin}
              ctaPath={upsellInfo.rulesets.cta.path}
              sourceType={sourceType}
            />
          )
        )}

        {isRestoredRuleset && upsellInfo?.enterpriseRulesets.featureEnabled && (
          <div className="mb-2">
            <Flash variant="default" className="d-flex flex-items-center">
              <Label variant="success" sx={{mr: 2}}>
                Beta
              </Label>
              <span>
                <span className="d-inline">
                  This ruleset has been restored to a previous version but the changes have not been saved. Review and
                  save the changes below.{' '}
                </span>
                <Link to="https://github.com/orgs/community/discussions/69918">Give feedback</Link>.
              </span>
            </Flash>
          </div>
        )}

        {isHistoryView && (
          <div className="mb-2">
            <Flash variant="warning" className="d-flex flex-items-center">
              <span>
                <span className="d-inline">
                  You are viewing a previous version of this ruleset. This ruleset has been modified since this version.
                  See the{' '}
                </span>
                <Link reloadDocument to={resolvePath('../../..')}>
                  latest version
                </Link>
                <span>.</span>
              </span>
            </Flash>
          </div>
        )}

        {rulesetTarget === 'push' && !rulesetId && sourceType === 'repository' && (source as Repository).private && (
          <div className="mb-2">
            <Flash variant="default" className="d-flex flex-items-center">
              <span>
                <span className="d-inline">
                  Push rulesets are applied to a repository and its downstream repositories. To review the downstream
                  repositories that will inherit this ruleset,{' '}
                  <Link to={resolvePath('../../../forks')}>visit the forks page</Link>.
                </span>
              </span>
            </Flash>
          </div>
        )}

        {isImportedRuleset && (
          <div className="mb-2">
            <Flash variant="default" className="d-flex flex-items-center">
              <Label variant="success" sx={{mr: 2}}>
                Beta
              </Label>
              <span>
                <span className="d-inline">This ruleset has been imported but the changes have not been saved.</span>
                <span className="text-bold d-inline"> Review and save the changes below. </span>
                <Link to="https://github.com/orgs/community/discussions/69918">Give feedback</Link>.
              </span>
            </Flash>
          </div>
        )}

        {!upsellInfo.rulesets.cta.visible && noTargets() && rulesetId && (
          <div className="mb-2">
            <Flash variant="warning" className="d-flex flex-items-center">
              <NoEntryIcon />
              This ruleset does not target any resources and will not be applied.
            </Flash>
          </div>
        )}

        <div className="d-flex flex-column">
          <GeneralPanel
            readOnly={readOnly}
            upsellInfo={upsellInfo}
            sourceType={sourceType}
            name={dirtyRulesetName}
            enforcement={dirtyEnforcement}
            rulesetId={rulesetId}
            renameRuleset={renameRuleset}
            rulesetNameError={rulesetNameError}
            setRulesetEnforcement={setRulesetEnforcement}
            generalErrors={generalErrors}
            nameRef={rulesetNameRef}
            rulesetTarget={rulesetTarget}
          />

          {(!readOnly || isStafftools || isHistoryView) && (
            <BypassListPanel
              readOnly={readOnly}
              bypassActors={bypassActors}
              setBypassActors={setBypassActors}
              addBypassActor={addBypassActor}
              removeBypassActor={removeBypassActor}
              updateBypassActor={updateBypassActor}
              rulesetTarget={rulesetTarget}
              orgAdminBypassMode={dirtyOrgAdminBypassMode}
              setFlashAlert={setFlashAlert}
              deployKeyBypass={dirtyDeployKeyBypass}
            />
          )}

          {supportedConditionTargetObjects.length > 0 && (
            <TargetsPanel
              rulesetId={rulesetId}
              readOnly={readOnly}
              rulesetTarget={rulesetTarget}
              fnmatchHelpUrl={helpUrls?.fnmatch}
              rulesetPreviewCount={rulesetPreviewCounts[initialRuleset.id]}
              rulesetPreviewSamples={rulesetPreviewSamples[initialRuleset.id]}
              rulesetError={rulesetPreviewErrors[initialRuleset.id]}
              dirtyConditions={dirtyConditions}
              supportedConditionTargetObjects={supportedConditionTargetObjects}
              conditions={conditions}
              conditionErrors={conditionErrors}
              repositoryConditionRef={repositoryConditionRef}
              refConditionRef={refConditionRef}
              source={source}
              {...{addOrUpdateCondition, removeCondition}}
            />
          )}

          <RulesPanel
            readOnly={readOnly}
            upsellInfo={upsellInfo}
            helpUrls={helpUrls}
            rulesetId={rulesetId}
            rulesetTarget={rulesetTarget}
            sourceType={sourceType}
            rules={rules}
            ruleSchemas={ruleSchemas}
            ruleErrors={ruleErrors}
            errorRefs={errorRefs}
            {...{addRule, removeRule, restoreRule, setRuleModalState, updateRuleParameters}}
          />
        </div>

        {!readOnly && (
          <div className={`d-flex gap-2 mt-4`} data-testid="ruleset-buttons">
            <Button variant="primary" type="submit" disabled={isSaving || isReverting}>
              {rulesetId ? (
                isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    Save<span className="hide-md">&nbsp;changes</span>
                  </>
                )
              ) : (
                'Create'
              )}
            </Button>
            {rulesetId && (
              <Button variant="default" type="button" onClick={onRevertForm} disabled={isReverting || isSaving}>
                {isReverting ? (
                  <>Reverting...</>
                ) : (
                  <>
                    Revert<span className="hide-md hide-sm">&nbsp;changes</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </form>

      {!(rulesHistory || rulesImportExport) && (
        <DangerConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete ruleset?"
          text="Are you sure you want to delete this ruleset? This action cannot be undone."
          buttonText="Delete"
          onDismiss={() => {
            setShowDeleteDialog(false)
          }}
          onConfirm={deleteRuleset}
        />
      )}
    </div>
  )
}

function RulesHeader({
  rulesetTarget,
  resolvePath,
  onGoBack,
  isHistoryView,
  currentName,
  rulesetId,
  rulesetName,
  readOnly,
  isStafftools,
  isInherited,
  rulesetToExport,
  upsellInfo,
  isRestoredRuleset,
  enforcement,
  setFlashAlert,
}: {
  rulesetTarget: RulesetTarget
  resolvePath: (pathToResolve: string) => string
  onGoBack: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  isHistoryView: boolean
  currentName?: string
  rulesetId?: number
  rulesetName: string
  readOnly: boolean
  isStafftools: boolean
  isInherited: boolean
  rulesetToExport: Ruleset
  upsellInfo: UpsellInfo
  isRestoredRuleset?: boolean
  enforcement: RulesetEnforcement
  setFlashAlert: (flashAlert: FlashAlert) => void
}) {
  const rulesHistory = useFeatureFlag('rules_history')
  const rulesImportExport = useFeatureFlag('rules_import_export')
  function enforcementLabelVariant(enforcementLabel: RulesetEnforcement) {
    switch (enforcementLabel) {
      case RulesetEnforcement.Enabled:
        return 'success'
      case RulesetEnforcement.Evaluate:
        return 'severe'
      case RulesetEnforcement.Disabled:
        return 'secondary'
    }
  }
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className="d-flex gap-1 flex-items-center f3">
        <Link to={resolvePath('..')} onClick={onGoBack}>
          Rulesets
        </Link>
        <span>/</span>
        {isHistoryView ? (
          <Link reloadDocument to={resolvePath('../../..')}>
            {currentName}
          </Link>
        ) : (
          <>
            <span>{rulesetId ? currentName || rulesetName : `New ${humanize(rulesetTarget)} ruleset`}</span>
          </>
        )}
        {isHistoryView && (
          <>
            <span>/</span>
            <span>History</span>
          </>
        )}
        {!upsellInfo.rulesets.cta.visible && !isHistoryView && rulesetId && (
          <Label sx={{ml: 2}} variant={enforcementLabelVariant(enforcement)}>
            {enforcementLabelText(enforcement)}
          </Label>
        )}
      </div>

      <Box sx={{display: 'flex', alignItems: 'center', columnGap: 2}}>
        {rulesetTarget === 'push' && (
          <>
            <Label variant="success">Beta</Label>
            <Link to="https://github.com/orgs/community/discussions/118843" className="f6">
              Give feedback
            </Link>
          </>
        )}
        {rulesetId && (!readOnly || (isStafftools && !isInherited)) ? (
          <>
            <ActionMenu open={menuOpen} onOpenChange={() => setMenuOpen(!menuOpen)}>
              <ActionMenu.Anchor>
                <IconButton icon={KebabHorizontalIcon} aria-label="Open additional options" />
              </ActionMenu.Anchor>

              <ActionMenu.Overlay>
                <RulesetActionMenu
                  ruleset={rulesetToExport}
                  rulesetsUrl={resolvePath('..')}
                  insightsEnabled={(rulesHistory || rulesImportExport) && upsellInfo.enterpriseRulesets.featureEnabled}
                  showDeleteAction
                  readOnly={readOnly}
                  rulesHistory={rulesHistory}
                  isRestored={isRestoredRuleset}
                  rulesImportExport={rulesImportExport}
                  enterpriseEnabled={upsellInfo.enterpriseRulesets.featureEnabled}
                  setFlashAlert={setFlashAlert}
                  setMenuOpen={setMenuOpen}
                />
              </ActionMenu.Overlay>
            </ActionMenu>
          </>
        ) : null}
      </Box>
    </>
  )
}
