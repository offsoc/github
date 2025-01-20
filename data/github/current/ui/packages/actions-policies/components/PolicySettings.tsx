import {Box, Text, Button} from '@primer/react'
import {
  PolicyIdentifier,
  type ActionsPoliciesProps,
  type EntityType,
  type Entity,
  type PolicyForm,
  NO_POLICY,
  SELECT_ACTIONS,
} from '../types'
import {Policy} from './policies/Policy'
import {useState} from 'react'
import {PolicySelector} from './PolicySelector'

const POLICIES_TO_INCLUDE: readonly PolicyIdentifier[] = [PolicyIdentifier.Author, PolicyIdentifier.Expression]

const PolicyContainerSx = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderTopRightRadius: '6px',
  borderTopLeftRadius: '6px',
  borderColor: 'border.default',
  backgroundColor: 'canvas.subtle',
}

function getPolicyFormFromEntity(entity: Entity): PolicyForm {
  const highestLevelAllowlistSpecifiesActions =
    !!entity.highestLevelAllowlist && entity.highestLevelAllowlist.specifiedActions

  return {
    allowCreatedByGitHub: highestLevelAllowlistSpecifiesActions
      ? !!entity.highestLevelAllowlist?.allowsGithubOwnedActions
      : !!entity.allowsGithubOwnedActions,
    allowVerifiedCreator: highestLevelAllowlistSpecifiesActions
      ? !!entity.highestLevelAllowlist?.allowsVerifiedActions
      : !!entity.allowsVerifiedActions,
    specifiedActionsDisabled: !!highestLevelAllowlistSpecifiesActions,
    noPolicyOrSelectedActions: entity.allowsAllActionsAndWorkflows ? NO_POLICY : SELECT_ACTIONS,
    patterns: (
      (highestLevelAllowlistSpecifiesActions ? entity.highestLevelAllowlist?.patterns : entity.patterns) ?? []
    ).join(','),
  }
}

function PolicySettingsHeading({type}: {type: EntityType}) {
  const subheading = `Choose which actions and reusable workflows from the enterprise or GitHub.com are searchable and permitted in
  the ${type}.`

  return (
    <div>
      <Text as="h3" sx={{fontWeight: 'normal'}}>
        Allowed actions
      </Text>
      <Text as="p" sx={{marginBottom: 0}}>
        {subheading}
      </Text>
    </div>
  )
}

export function PolicySettings({entity, type}: ActionsPoliciesProps) {
  const initialForm = getPolicyFormFromEntity(entity)

  const [policyForm, setPolicyForm] = useState<PolicyForm>(initialForm)

  return (
    <Box sx={{marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4}}>
      <PolicySettingsHeading type={type} />
      <Box sx={{alignSelf: 'start'}}>
        <PolicySelector form={policyForm} setPolicyForm={setPolicyForm} />
      </Box>
      {policyForm.noPolicyOrSelectedActions === 'select' && (
        <Box sx={PolicyContainerSx}>
          {POLICIES_TO_INCLUDE.map((identifier, idx) => (
            <Policy
              key={identifier}
              identifier={identifier}
              form={policyForm}
              setPolicyForm={setPolicyForm}
              idx={idx}
            />
          ))}
        </Box>
      )}
      <Button sx={{alignSelf: 'start'}}>Save</Button>
    </Box>
  )
}
