import {ActionList, ActionMenu, Label} from '@primer/react'
import {isAllCondition} from '../../helpers/conditions'
import {INCLUDE_ALL_PATTERN} from '../../types/rules-types'
import type {
  Condition,
  ConditionParameters,
  ExpandedTargetType,
  ExpandedOrgTargetType,
  ExpandedRepoTargetType,
} from '../../types/rules-types'

const REPO_TARGET_OPTIONS: Option[] = [
  {
    condition: 'all_repos',
    name: 'All repositories',
    description: 'Target all repositories within the organization',
    beta: false,
  },
  {
    condition: 'repository_name',
    name: 'Dynamic list by name',
    description: 'Target repositories based on name',
    beta: false,
  },
  {
    condition: 'repository_property',
    name: 'Dynamic list by property',
    description: 'Target repositories based on properties',
    beta: false,
  },
  {
    condition: 'repository_id',
    name: 'Select repositories',
    description: `Target a specific list of selected repositories`,
    beta: false,
  },
]

export function RepositoryTargetTypeSelector({
  excludeConditions = [],
  currentRepoCondition,
  setRepoCondition,
}: {
  excludeConditions?: ExpandedTargetType[]
  currentRepoCondition: Condition
  setRepoCondition: (val: ExpandedRepoTargetType) => void
}) {
  const selectedTargetType = isAllCondition(currentRepoCondition.target, currentRepoCondition.parameters)
    ? 'all_repos'
    : currentRepoCondition.target

  const options = REPO_TARGET_OPTIONS.filter(({condition}) => !excludeConditions.includes(condition))

  return (
    <TargetTypeSelector
      selectedTargetType={selectedTargetType}
      selectOption={(val: Option) => setRepoCondition(val.condition as ExpandedRepoTargetType)}
      options={options}
    />
  )
}

const ORG_TARGET_OPTIONS: Option[] = [
  {
    condition: 'all_orgs',
    name: 'All organizations',
    description: 'Target all organizations within the enterprise',
    beta: false,
  },
  {
    condition: 'organization_name',
    name: 'Dynamic list by name',
    description: 'Target organizations based on name',
    beta: false,
  },
  {
    condition: 'organization_id',
    name: 'Select organizations',
    description: `Target a specific list of selected organizations`,
    beta: false,
  },
]

export function OrganizationTargetTypeSelector({
  currentOrgCondition,
  setOrgCondition,
}: {
  currentOrgCondition: Condition
  setOrgCondition: (val: ExpandedOrgTargetType) => void
}) {
  const selectedTargetType = isAllCondition(currentOrgCondition.target, currentOrgCondition.parameters)
    ? 'all_orgs'
    : currentOrgCondition.target

  return (
    <TargetTypeSelector
      selectedTargetType={selectedTargetType}
      selectOption={(val: Option) => setOrgCondition(val.condition as ExpandedOrgTargetType)}
      options={ORG_TARGET_OPTIONS}
    />
  )
}

type Option = {
  condition: ExpandedTargetType
  name: string
  description: string
  beta: boolean
}

function TargetTypeSelector({
  selectedTargetType,
  selectOption,
  options,
}: {
  selectedTargetType: ExpandedTargetType
  selectOption: (val: Option) => void
  options: Option[]
}) {
  const selectedOption = options.find(o => o.condition === selectedTargetType) || options[0]!

  return (
    <ActionMenu>
      <ActionMenu.Button>
        <div className="d-flex gap-1">
          <span className="text-normal">Target:</span>
          <span className="text-bold">{selectedOption.name}</span>
        </div>
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          {options.map(option => (
            <ActionList.Item
              selected={option === selectedOption}
              key={option.name}
              onSelect={() => option !== selectedOption && selectOption(option)}
            >
              {option.name}
              <ActionList.Description variant="block">{option.description}</ActionList.Description>
              {option.beta && (
                <ActionList.TrailingVisual>
                  <Label variant="success">Beta</Label>
                </ActionList.TrailingVisual>
              )}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

export function emptyParametersByType(targetType: ExpandedTargetType): ConditionParameters {
  switch (targetType) {
    case 'repository_name':
    case 'ref_name':
    case 'repository_property':
    case 'organization_name':
      return {include: [], exclude: []}
    case 'repository_id':
      return {repository_ids: []}
    case 'organization_id':
      return {organization_ids: []}
    case 'all_repos':
    case 'all_orgs':
      return {include: [INCLUDE_ALL_PATTERN], exclude: []}
    default:
      return {include: [], exclude: []}
  }
}
