import {Box, Octicon, Text} from '@primer/react'
import {MeterIcon, SkipIcon, PlayIcon, NoEntryIcon} from '@primer/octicons-react'
import type {UpsellInfo} from '../types/rules-types'
import {RulesetEnforcement} from '../types/rules-types'
import {enforcementLabelText} from '../helpers/enforcement-label'

export function EnforcementIcon({
  upsellInfo,
  hideText,
  enforcement,
}: {
  upsellInfo?: UpsellInfo
  hideText?: boolean
  enforcement: RulesetEnforcement
}) {
  let text = ''
  let icon: JSX.Element | null = null

  if (
    upsellInfo &&
    ((!upsellInfo.rulesets.featureEnabled && enforcement !== RulesetEnforcement.Disabled) ||
      (!upsellInfo.enterpriseRulesets.featureEnabled && enforcement === RulesetEnforcement.Evaluate))
  ) {
    text = 'Not enforced'
    icon = <Octicon icon={NoEntryIcon} sx={{marginRight: 1, color: 'attention.fg'}} aria-label="Not enforced" />
  } else {
    switch (enforcement) {
      case RulesetEnforcement.Enabled:
        text = enforcementLabelText(enforcement)
        icon = (
          <Octicon
            icon={PlayIcon}
            sx={{marginRight: 1, color: 'success.fg'}}
            aria-label={enforcementLabelText(enforcement)}
          />
        )
        break
      case RulesetEnforcement.Evaluate:
        text = enforcementLabelText(enforcement)
        icon = (
          <Octicon
            icon={MeterIcon}
            sx={{marginRight: 1, color: 'severe.fg'}}
            aria-label={enforcementLabelText(enforcement)}
          />
        )
        break
      default:
        text = enforcementLabelText(enforcement)
        icon = (
          <Octicon
            icon={SkipIcon}
            sx={{marginRight: 1, color: 'fg.muted'}}
            aria-label={enforcementLabelText(enforcement)}
          />
        )
        break
    }
  }

  return hideText ? (
    icon
  ) : (
    <Box
      as="span"
      sx={{
        alignItems: 'center',
        display: 'inline-flex',
        backgroundColor: 'neutral.subtle',
        borderRadius: 2,
        paddingLeft: 1,
        paddingRight: 2,
        paddingY: 1,
      }}
    >
      {icon}
      <Text sx={{fontSize: 0, fontWeight: 'bold'}}>{text}</Text>
    </Box>
  )
}
