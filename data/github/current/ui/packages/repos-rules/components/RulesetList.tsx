import {useState, type FC} from 'react'
import type {Ruleset, SourceType, UpsellInfo} from '../types/rules-types'
import {RulesetEnforcement} from '../types/rules-types'
import {AlertIcon, KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionMenu, IconButton} from '@primer/react'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

import {PLURAL_RULESET_TARGETS} from '../helpers/constants'
import {capitalize, humanize, pluralize} from '../helpers/string'
import {Link} from '@github-ui/react-core/link'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {EnforcementIcon} from './EnforcementIcon'
import {InsightsLink, RulesetActionMenu} from './RulesetActionMenu'
import {useIsStafftools} from '../hooks/use-is-stafftools'
import type {FlashAlert} from '@github-ui/dismissible-flash'

import {useTargetCount} from '../hooks/use-target-count'
import type {Repository} from '@github-ui/current-repository'
import type {Organization} from '@github-ui/repos-types'

const RulesetListHelper: FC<{
  ruleset: Ruleset
  upsellInfo: UpsellInfo
  sourceType: SourceType
  readOnly?: boolean
  setFlashAlert: (flashAlert: FlashAlert) => void
  rulesetTargetCount: number | undefined
}> = ({ruleset, upsellInfo, sourceType, readOnly, setFlashAlert, rulesetTargetCount}) => {
  const rulesHistory = useFeatureFlag('rules_history')
  const rulesImportExport = useFeatureFlag('rules_import_export')
  const {search, resolvePath} = useRelativeNavigation()
  const key = ruleset.source.type
  const isStafftools = useIsStafftools()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {(rulesHistory || rulesImportExport) && (
        <div className="align-center">
          <EnforcementIcon upsellInfo={upsellInfo} hideText={true} enforcement={ruleset.enforcement} />
        </div>
      )}
      <div className="d-flex flex-column">
        <div className="f5 text-bold">
          <Link className="color-fg-default" to={{pathname: resolvePath(`${ruleset.id}`), search}}>
            {ruleset.name}
          </Link>
        </div>
        {rulesHistory || rulesImportExport ? (
          <div className="d-flex flex-row my-1">
            <span className="text-small color-fg-muted mr-1">
              <Subtext ruleset={ruleset} sourceType={sourceType} targetCount={rulesetTargetCount} />
            </span>
          </div>
        ) : (
          <div className="d-flex flex-row my-1 text-small color-fg-muted flex-items-center gap-1">
            <EnforcementIcon upsellInfo={upsellInfo} enforcement={ruleset.enforcement} />
            <Subtext ruleset={ruleset} sourceType={sourceType} targetCount={rulesetTargetCount} />
          </div>
        )}
        <MissingConditionAlert ruleset={ruleset} />
      </div>
      {(rulesHistory || rulesImportExport) && (isStafftools || !readOnly) && key === 'Repository' ? (
        <div className="ml-auto d-flex flex-items-center">
          <ActionMenu open={menuOpen} onOpenChange={() => setMenuOpen(!menuOpen)}>
            <ActionMenu.Anchor>
              <IconButton
                icon={KebabHorizontalIcon}
                size="small"
                variant="invisible"
                className="color-fg-muted align-center"
                aria-label="Ruleset menu"
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <RulesetActionMenu
                ruleset={ruleset}
                rulesetsUrl={resolvePath('')}
                insightsEnabled={upsellInfo.enterpriseRulesets.featureEnabled}
                showDeleteAction={rulesHistory || rulesImportExport}
                readOnly={readOnly}
                rulesHistory={rulesHistory}
                rulesImportExport={rulesImportExport}
                enterpriseEnabled={upsellInfo.enterpriseRulesets.featureEnabled}
                setFlashAlert={setFlashAlert}
                setMenuOpen={setMenuOpen}
              />
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      ) : (
        <div className="d-flex flex-items-center gap-2">
          <InsightsLink
            ruleset={ruleset}
            rulesetsUrl={resolvePath('')}
            insightsEnabled={upsellInfo.enterpriseRulesets.featureEnabled}
            readOnly={readOnly}
            rulesHistory={rulesHistory}
            rulesImportExport={rulesImportExport}
          />
        </div>
      )}
    </>
  )
}

export const RulesetList: FC<{
  rulesets: Ruleset[]
  upsellInfo: UpsellInfo
  sourceType: SourceType
  source: Repository | Organization
  readOnly?: boolean
  setFlashAlert: (flashAlert: FlashAlert) => void
}> = ({rulesets, upsellInfo, sourceType, source, readOnly, setFlashAlert}) => {
  const rulesHistory = useFeatureFlag('rules_history')
  const rulesImportExport = useFeatureFlag('rules_import_export')

  const {rulesetPreviewCounts} = useTargetCount(source, sourceType, rulesets)

  const rulesetListHelper = (ruleset: Ruleset) => (
    <RulesetListHelper
      ruleset={ruleset}
      upsellInfo={upsellInfo}
      sourceType={sourceType}
      readOnly={readOnly}
      setFlashAlert={setFlashAlert}
      rulesetTargetCount={rulesetPreviewCounts[ruleset.id]}
    />
  )

  return (
    <ul>
      {rulesets.map((ruleset: Ruleset) => (
        <li key={ruleset.id} className="Box-row d-flex px-3 py-2 flex-justify-between flex-items-center">
          {rulesHistory || rulesImportExport ? (
            <div className={`d-flex flex-row width-full`}>{rulesetListHelper(ruleset)}</div>
          ) : (
            rulesetListHelper(ruleset)
          )}
        </li>
      ))}
    </ul>
  )
}

const Subtext: FC<{ruleset: Ruleset; sourceType: SourceType; targetCount: number | undefined}> = ({
  ruleset,
  sourceType,
  targetCount,
}) => {
  const ruleString = pluralize(
    ruleset.rules.length,
    `${humanize(ruleset.target)} rule`,
    `${humanize(ruleset.target)} rules`,
  )

  let targetString
  if (targetCount === undefined) {
    targetString = undefined
  } else if (sourceType === 'enterprise') {
    targetString = pluralize(targetCount, 'organization', 'organizations')
  } else if (sourceType === 'organization') {
    targetString = pluralize(targetCount, 'repository', 'repositories')
  } else if (sourceType === 'repository') {
    targetString =
      ruleset.target !== 'push'
        ? pluralize(targetCount, humanize(ruleset.target), PLURAL_RULESET_TARGETS)
        : 'all pushes'
  }

  return <span>{`${ruleString}${targetString ? ' • targeting ' : ''}${targetString || ''}`}</span>
}

const MissingConditionAlert: FC<{
  ruleset: Ruleset
}> = ({ruleset}) => {
  if (ruleset.target === 'push') {
    return null
  }

  if (ruleset.missingConditionTargets.length > 0 && ruleset.enforcement === RulesetEnforcement.Enabled) {
    let message = ''
    const firstMissing = ruleset.missingConditionTargets[0]!
    if (firstMissing === 'ref') {
      message = `${capitalize(ruleset.target)} conditions missing`
    } else {
      message = `${capitalize(firstMissing)} conditions missing`
    }
    return (
      <div className="text-small color-fg-danger mt-1">
        <AlertIcon size="small" />
        <span> </span>
        <em>{message}</em>
      </div>
    )
  }

  return null
}
