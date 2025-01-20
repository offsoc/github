import {PulseIcon} from '@primer/octicons-react'
import {Octicon} from '@primer/react'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'
import {RulesetEnforcement, type RulesetTarget} from '../../types/rules-types'
import {NewRulesetButton} from '../NewRulesetButton'
import type {FlashAlert} from '@github-ui/dismissible-flash'

export function InsightsBlank({
  showCreateButton,
  setFlashAlert,
  supportedRulesetTargets,
}: {
  showCreateButton: boolean
  setFlashAlert: (flashAlert: FlashAlert) => void
  supportedRulesetTargets: RulesetTarget[]
}) {
  const {resolvePath} = useRelativeNavigation()

  return (
    <div className="blankslate">
      <Octicon icon={PulseIcon} size={24} />
      <h3 className="blankslate-heading">No rule evaluations matched your search</h3>
      {showCreateButton && (
        <>
          <p>Try expanding your search or creating a new ruleset in evaluate mode</p>
          <NewRulesetButton
            rulesetsUrl={resolvePath('../')}
            reloadDocument
            defaultEnforcement={RulesetEnforcement.Evaluate}
            sx={{mt: 4, justifyContent: 'center'}}
            setFlashAlert={setFlashAlert}
            supportedTargets={supportedRulesetTargets}
          />
        </>
      )}
    </div>
  )
}
