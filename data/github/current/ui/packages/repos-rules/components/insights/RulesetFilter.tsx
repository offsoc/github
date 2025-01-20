import {RepoPushIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box} from '@primer/react'
import type {Ruleset} from '../../types/rules-types'

export function RulesetFilter({
  currentRuleset,
  allRulesets,
  onSelect,
}: {
  currentRuleset: Ruleset | undefined
  allRulesets: Ruleset[]
  onSelect: (ruleset: Ruleset | undefined) => void
}) {
  return (
    <ActionMenu>
      <ActionMenu.Button leadingVisual={RepoPushIcon} size="medium">
        <Box sx={{maxWidth: 125, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {currentRuleset ? <span>{currentRuleset.name}</span> : <span>{'All rulesets'}</span>}
        </Box>
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          <ActionList.Item selected={currentRuleset === null} onSelect={() => onSelect(undefined)}>
            <div className="d-flex">All rulesets</div>
          </ActionList.Item>
          {allRulesets.map(ruleset => (
            <ActionList.Item
              key={ruleset.id}
              selected={currentRuleset?.name === ruleset.name}
              onSelect={() => onSelect(ruleset)}
            >
              <span>{ruleset.name}</span>
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
