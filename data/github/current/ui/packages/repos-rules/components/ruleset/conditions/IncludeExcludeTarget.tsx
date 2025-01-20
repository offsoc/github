import type {FC} from 'react'
import type React from 'react'
import {useMemo, useState, Fragment, useCallback} from 'react'
import type {ConditionParameters, RulesetTarget, TargetType, IncludeExcludeParameters} from '../../../types/rules-types'
import {INCLUDE_ALL_PATTERN, DEFAULT_BRANCH_PATTERN} from '../../../types/rules-types'
import {TargetsTable, type IncludeExcludeType} from '../TargetsTable'
import {ActionList, ActionMenu, FormControl, Octicon, Checkbox} from '@primer/react'
import {PlusCircleIcon, XCircleIcon} from '@primer/octicons-react'
import {pluralize} from '../../../helpers/string'
import {PLURAL_RULESET_TARGETS} from '../../../helpers/constants'
import {AddTargetDialog} from './AddTargetDialog'

function excludeTargetPrefix(targetType: TargetType, pattern: string) {
  return targetType === 'ref_name' || pattern === INCLUDE_ALL_PATTERN
}

interface IncludeExcludeTargetProps {
  rulesetId?: number
  rulesetTarget: RulesetTarget
  fnmatchHelpUrl?: string
  parameters: IncludeExcludeParameters
  panelTitle: string
  targetType: TargetType
  readOnly: boolean
  updateParameters: (parameters: ConditionParameters) => void
  headerRowText?: string
  blankslate: {
    heading: string
    description?: React.ReactNode
  }
}

export const IncludeExcludeTarget: FC<IncludeExcludeTargetProps> = ({
  rulesetId,
  readOnly,
  rulesetTarget,
  fnmatchHelpUrl,
  parameters,
  panelTitle,
  targetType,
  updateParameters,
  headerRowText,
  blankslate,
}) => {
  const [selectedActionType, setSelectedActionType] = useState('include_target')
  const [addTargetVisible, setAddTargetVisible] = useState(false)

  const actions = actionOptions(rulesetTarget, targetType)
  const currentAction = actions.find(option => option.type === selectedActionType) || actions[0]!

  let allLabel: string | undefined

  switch (targetType) {
    case 'ref_name':
      allLabel = `All ${pluralize(2, rulesetTarget, PLURAL_RULESET_TARGETS, false)}`
      break
    case 'repository_name':
      allLabel = `All repositories`
      break
    case 'organization_name':
      allLabel = `All organizations`
      break
  }

  const toggleProtectedTarget = () => {
    updateParameters({
      ...parameters,
      protected: !parameters.protected,
    })
  }

  const onActionSelect = (actionType: string) => {
    setSelectedActionType(actionType)
    const action = actions.find(option => option.type === actionType) || actions[0]!

    if (action.openDialog) {
      setAddTargetVisible(true)
    } else {
      addParameter('', actionType)
    }
  }

  const addParameter = (param: string, actionType = selectedActionType) => {
    if (readOnly) {
      return
    }

    let trimmedParam = param.trim()

    if (!trimmedParam && actionType !== 'include_default_branch' && actionType !== 'include_all') {
      return
    }

    if (targetType === 'ref_name') {
      switch (rulesetTarget) {
        case 'branch':
          trimmedParam = `refs/heads/${trimmedParam}`
          break
        case 'tag':
          trimmedParam = `refs/tags/${trimmedParam}`
          break
      }
    }

    const allPatterns = parameters.include.concat(parameters.exclude)

    if (!allPatterns.includes(trimmedParam)) {
      if (actionType === 'include_default_branch') {
        if (!parameters.include.includes(DEFAULT_BRANCH_PATTERN)) {
          updateParameters({
            ...parameters,
            include: [...parameters.include, DEFAULT_BRANCH_PATTERN],
          })
        }
      } else if (actionType === 'include_target') {
        updateParameters({
          ...parameters,
          include: [...parameters.include, trimmedParam],
        })
      } else if (actionType === 'include_all') {
        if (!parameters.include.includes(INCLUDE_ALL_PATTERN)) {
          updateParameters({
            ...parameters,
            include: [...parameters.include, INCLUDE_ALL_PATTERN],
          })
        }
      } else if (actionType === 'exclude_target') {
        updateParameters({
          ...parameters,
          exclude: [...parameters.exclude, trimmedParam],
        })
      }
    }
  }

  const removeParameter = (pattern_type: 'include' | 'exclude', target: string) => {
    if (readOnly) {
      return
    }
    const list = (pattern_type === 'include' ? parameters.include : parameters.exclude).filter(p => p !== target)

    const newParameters =
      pattern_type === 'include'
        ? {
            ...parameters,
            include: list,
          }
        : {
            ...parameters,
            exclude: list,
          }

    updateParameters(newParameters)
  }

  const mapAliasToDisplay = useCallback(
    (value: string) => {
      if (value === INCLUDE_ALL_PATTERN) {
        return allLabel
      } else if (value === DEFAULT_BRANCH_PATTERN) {
        return 'Default'
      } else {
        return undefined
      }
    },
    [allLabel],
  )

  const targets = useMemo(() => {
    return [parameters.include.map(e => ({t: 'include', v: e})), parameters.exclude.map(e => ({t: 'exclude', v: e}))]
      .flat(1)
      .map(param => ({
        type: param.t as IncludeExcludeType,
        prefix: excludeTargetPrefix(targetType, param.v) ? undefined : 'name',
        value: param.v,
        display: mapAliasToDisplay(param.v),
        displayAsLabel: mapAliasToDisplay(param.v) !== undefined,
      }))
  }, [parameters, targetType, mapAliasToDisplay])

  const noGroupActions = actions.filter(a => !a.actionGroup)
  const actionsByGroup = actions
    .filter(a => a.actionGroup)
    .reduce((acc, item) => {
      const actionList = acc.get(item.actionGroup!) || []
      actionList.push(item)
      acc.set(item.actionGroup!, actionList)
      return acc
    }, new Map<string, Action[]>())

  return (
    <>
      <TargetsTable
        renderTitle={() => <h3 className="Box-title">{panelTitle}</h3>}
        renderAction={() => (
          <ActionMenu>
            <ActionMenu.Button>Add target</ActionMenu.Button>

            <ActionMenu.Overlay width="medium">
              <ActionList>
                {noGroupActions.length > 0 &&
                  noGroupActions.map(action => (
                    <ActionList.Item
                      key={action.type}
                      onSelect={() => onActionSelect(action.type)}
                      disabled={action.target ? parameters.include.includes(action.target) : false}
                    >
                      <ActionList.LeadingVisual>
                        {action.includeOrExclude === 'include' ? (
                          <Octicon icon={PlusCircleIcon} sx={{color: 'success.fg'}} />
                        ) : (
                          <Octicon icon={XCircleIcon} sx={{color: 'danger.fg'}} />
                        )}
                      </ActionList.LeadingVisual>
                      {action.text}
                    </ActionList.Item>
                  ))}
                {Array.from(actionsByGroup).map(([group, actionList], index) => (
                  <Fragment key={group}>
                    {(noGroupActions.length > 0 || index > 0) && <ActionList.Divider />}
                    <ActionList.Group variant="subtle">
                      <ActionList.GroupHeading>{group}</ActionList.GroupHeading>
                      {actionList.map(action => (
                        <ActionList.Item key={action.type} onSelect={() => onActionSelect(action.type)}>
                          <ActionList.LeadingVisual>
                            {action.includeOrExclude === 'include' ? (
                              <Octicon icon={PlusCircleIcon} sx={{color: 'success.fg'}} />
                            ) : (
                              <Octicon icon={XCircleIcon} sx={{color: 'danger.fg'}} />
                            )}
                          </ActionList.LeadingVisual>
                          {action.text}
                        </ActionList.Item>
                      ))}
                    </ActionList.Group>
                  </Fragment>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
        headerRowText={headerRowText}
        blankslate={blankslate}
        targets={targets}
        onRemove={removeParameter}
        readOnly={readOnly}
      />

      {!readOnly && (targetType === 'repository_name' || targetType === 'repository_id') && (
        <div className="py-3">
          <FormControl>
            <Checkbox checked={parameters.protected || false} onChange={toggleProtectedTarget} />
            <FormControl.Label>Prevent renaming of target repositories</FormControl.Label>
            <FormControl.Caption>
              When checked, target repositories can only be renamed by those with bypass permission.
            </FormControl.Caption>
          </FormControl>
        </div>
      )}

      {readOnly || !addTargetVisible ? null : (
        <AddTargetDialog
          rulesetId={rulesetId}
          onAdd={target => {
            addParameter(target)
            setAddTargetVisible(false)
          }}
          onClose={() => setAddTargetVisible(false)}
          target={targetType}
          includeOrExclude={currentAction.includeOrExclude}
          rulesetTarget={rulesetTarget}
          fnmatchHelpUrl={fnmatchHelpUrl}
        />
      )}
    </>
  )
}

type Action = {
  type: string
  text: string
  actionGroup?: string
  openDialog?: boolean
  target?: string
  includeOrExclude: 'include' | 'exclude'
}

function actionOptions(rulesetTarget: RulesetTarget, targetType: TargetType) {
  const actions: Action[] = []

  if (targetType === 'ref_name') {
    if (rulesetTarget === 'branch') {
      actions.push({
        type: 'include_default_branch',
        text: 'Include default branch',
        includeOrExclude: 'include',
        target: DEFAULT_BRANCH_PATTERN,
      })
    }

    actions.push({
      type: 'include_all',
      text: `Include all ${pluralize(2, rulesetTarget, PLURAL_RULESET_TARGETS, false)}`,
      includeOrExclude: 'include',
      target: INCLUDE_ALL_PATTERN,
    })
  }

  actions.push({
    type: 'include_target',
    text: `Include by pattern`,
    actionGroup: 'Target by inclusion or exclusion pattern',
    openDialog: true,
    includeOrExclude: 'include',
  })

  actions.push({
    type: 'exclude_target',
    text: `Exclude by pattern`,
    actionGroup: 'Target by inclusion or exclusion pattern',
    openDialog: true,
    includeOrExclude: 'exclude',
  })

  return actions
}
