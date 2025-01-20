import {Fragment, useEffect, useRef, useState} from 'react'
import type {Repository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {HomeRoutePayload, Ruleset} from '../types/rules-types'
import {Blankslate} from '../components/Blankslate'
import {BorderBox} from '../components/BorderBox'
import {BranchSelector} from '../components/BranchSelector'
import {Subhead} from '../components/Subhead'
import {RulesetList} from '../components/RulesetList'
import {FlashUpsellBanner, UpsellBanner} from '../components/UpsellBanner'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {NewRulesetButton} from '../components/NewRulesetButton'
import {capitalize} from '../helpers/string'
import {sortSourceTypes} from '../helpers/utils'
import {DismissibleFlashOrToast, type FlashAlert} from '@github-ui/dismissible-flash'

export function OverviewPage() {
  const {
    source,
    sourceType,
    upsellInfo,
    rulesets,
    matchingRulesets,
    editableRulesets,
    branch,
    branchListCacheKey,
    readOnly,
    supportedTargets,
  } = useRoutePayload<HomeRoutePayload>()
  const {resolvePath} = useRelativeNavigation()
  const [flashAlert, setFlashAlert] = useState<FlashAlert>({message: '', variant: 'default'})
  const flashRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    flashRef.current?.focus()
  }, [flashAlert, flashRef])

  const rulesetsBySource = rulesets.reduce<Record<string, Ruleset[]>>((map, item) => {
    // if a branch/ref is specified, filter based on whether each ruleset is applied
    if (branch && !matchingRulesets.includes(item.id)) {
      return map
    }

    const key = item.source.type
    if (!map[key]) {
      map[key] = []
    }

    map[key].push(item)
    return map
  }, {})

  const inheritedSourceTypes = Object.keys(rulesetsBySource).sort(sortSourceTypes)

  const hasFilteredRulesets = rulesets.length > 0 && inheritedSourceTypes.length === 0

  const headingText = "You haven't created any rulesets"

  let heading = 'Rulesets'
  let alphaOrBeta = ''
  if (supportedTargets.includes('member_privilege')) {
    heading = 'Repository policies'
    alphaOrBeta = 'Beta'
  }

  return (
    <div className="settings-next position-relative">
      <DismissibleFlashOrToast flashAlert={flashAlert} setFlashAlert={setFlashAlert} ref={flashRef} />
      <Subhead
        heading={heading}
        alphaOrBeta={alphaOrBeta}
        renderAction={() => {
          return readOnly ? null : rulesets.length > 0 ? (
            <NewRulesetButton
              rulesetsUrl={resolvePath('./')}
              sx={{my: 2}}
              setFlashAlert={setFlashAlert}
              supportedTargets={supportedTargets}
            />
          ) : null
        }}
      />

      <div className="d-flex flex-column gap-3">
        {upsellInfo.rulesets.cta.visible && inheritedSourceTypes.length > 0 && (
          <FlashUpsellBanner
            askAdmin={upsellInfo.askAdmin}
            ctaPath={upsellInfo.rulesets.cta.path}
            organization={upsellInfo.organization}
            sourceType={sourceType}
          />
        )}
        {sourceType === 'repository' && rulesets.length > 0 ? (
          <div>
            <BranchSelector gitRef={branch} repo={source as Repository} branchListCacheKey={branchListCacheKey} />
          </div>
        ) : null}
        {inheritedSourceTypes.length > 0 ? (
          inheritedSourceTypes.map(key => (
            <Fragment key={key}>
              <BorderBox
                name={`${capitalize(key)} rulesets`}
                showHeader={
                  inheritedSourceTypes.length > 1 ||
                  (sourceType === 'repository' && !inheritedSourceTypes.includes('Repository'))
                }
                renderCreateButton={() => {
                  // Don't show managed by if the source type is the same as the group's type
                  if (sourceType === key.toLowerCase()) {
                    return null
                  }

                  const ownedByName = rulesetsBySource[key]![0]!.source.name
                  return <div className="text-small color-fg-muted mt-1">Managed by {ownedByName}</div>
                }}
              >
                <RulesetList
                  rulesets={rulesetsBySource[key]!}
                  upsellInfo={upsellInfo}
                  sourceType={sourceType}
                  source={source}
                  readOnly={readOnly}
                  setFlashAlert={setFlashAlert}
                />
              </BorderBox>

              {!readOnly &&
                key.toLowerCase() !== sourceType &&
                editableRulesets.includes(rulesetsBySource[key]![0]!.id) && (
                  <div className="text-small">
                    <span className="text-bold">Tip:</span>{' '}
                    <span className="color-fg-muted">
                      As a {rulesetsBySource[key]![0]?.source.name} admin, you can
                      <a href={rulesetsBySource[key]![0]?.source.url}>
                        {' '}
                        manage {source.name} rulesets in {key.toLocaleLowerCase()} settings.
                      </a>
                    </span>
                  </div>
                )}
            </Fragment>
          ))
        ) : (
          <>
            {hasFilteredRulesets ? (
              <Blankslate heading={`No rulesets matched your search`}>
                {'Try expanding your search or creating a new ruleset'}
              </Blankslate>
            ) : (
              <UpsellBanner
                headingText={headingText}
                withBorder={false}
                showNewRulesetButton={!readOnly}
                askAdmin={upsellInfo.askAdmin}
                infoVariant="two"
                sourceType={sourceType}
                cta={upsellInfo.rulesets.cta}
                organization={upsellInfo.organization}
                setFlashAlert={setFlashAlert}
                supportedRulesetTargets={supportedTargets}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
