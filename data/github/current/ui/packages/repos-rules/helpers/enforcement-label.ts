import {RulesetEnforcement} from '../types/rules-types'

export function enforcementLabelText(enforcementLabel: RulesetEnforcement) {
  switch (enforcementLabel) {
    case RulesetEnforcement.Enabled:
      return 'Active'
    case RulesetEnforcement.Evaluate:
      return 'Evaluate'
    case RulesetEnforcement.Disabled:
      return 'Disabled'
  }
}
