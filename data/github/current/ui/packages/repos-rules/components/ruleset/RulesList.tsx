import {RepoLockedIcon} from '@primer/octicons-react'
import {Octicon, LinkButton, Link} from '@primer/react'
import type {FC} from 'react'
import type {UpsellInfo, Rule, RuleModalState, RuleWithSchema, ValidationError, FieldRef} from '../../types/rules-types'
import {Blankslate} from '../Blankslate'
import {MetadataPatternRuleRow} from './MetadataPatternRuleRow'

type RulesListProps = {
  readOnly: boolean
  upsellInfo: UpsellInfo
  helpUrl?: string
  title: string
  rules: RuleWithSchema[]
  removeRule: (rule: Rule) => void
  restoreRule: (rule: Rule) => void
  setRuleModalState: (rule: Rule, modalState: RuleModalState) => void
  errors: ValidationError[]
  fieldRefs?: FieldRef
}

export const RulesList: FC<RulesListProps> = ({
  readOnly,
  upsellInfo,
  helpUrl,
  title,
  rules,
  removeRule,
  restoreRule,
  setRuleModalState,
}) => {
  return rules.length ? (
    <ul>
      {upsellInfo.enterpriseRulesets.cta.visible && (
        <li className="Box-row d-flex flex-items-center">
          <Octicon className="color-fg-accent" icon={RepoLockedIcon} size={54} />
          <div className="ml-3">
            <h2 className="f4">{title} restrictions are available to Enterprise organizations</h2>
            <p className="color-fg-muted">
              {title} restrictions can ensure that commit messages contain a GitHub issue number, or enforce the format
              of new branch and tag names.
            </p>
            {upsellInfo?.enterpriseRulesets.cta.path && (
              <LinkButton href={upsellInfo?.enterpriseRulesets.cta.path} variant="primary">
                Upgrade
              </LinkButton>
            )}
          </div>
        </li>
      )}

      {rules.map(rule => (
        <li key={rule.id || rule._id} className="Box-row d-flex flex-row flex-justify-between">
          <MetadataPatternRuleRow
            readOnly={readOnly}
            rule={rule}
            ruleSchema={rule.schema}
            removeRule={removeRule}
            restoreRule={restoreRule}
            setRuleModalState={setRuleModalState}
          />
        </li>
      ))}
    </ul>
  ) : (
    <Blankslate heading={`No ${title.toLocaleLowerCase()} restrictions have been added`}>
      {!readOnly && helpUrl && (
        <Link target="_blank" href={helpUrl}>
          Learn more about {title.toLocaleLowerCase()} restrictions
        </Link>
      )}
    </Blankslate>
  )
}
