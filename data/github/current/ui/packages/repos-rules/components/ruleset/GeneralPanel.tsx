import type {FC} from 'react'
import {useState, useEffect} from 'react'
import {Link} from '@github-ui/react-core/link'
import {FormControl, TextInput, Box, ActionMenu, ActionList, Octicon, Label} from '@primer/react'
import {MeterIcon, SkipIcon, PlayIcon} from '@primer/octicons-react'
import {DangerConfirmationDialog} from './DangerConfirmationDialog'
import type {SourceType, UpsellInfo, DetailedValidationErrors, RulesetTarget} from '../../types/rules-types'
import {RulesetEnforcement} from '../../types/rules-types'

type GeneralPanelProps = {
  readOnly: boolean
  upsellInfo: UpsellInfo
  sourceType: SourceType
  name: string
  enforcement: RulesetEnforcement
  rulesetId?: number
  nameRef?: React.RefObject<HTMLInputElement>
  generalErrors?: DetailedValidationErrors['general']
  rulesetNameError?: string
  renameRuleset: (name: string) => void
  setRulesetEnforcement: (status: RulesetEnforcement) => void
  rulesetTarget: RulesetTarget
}

const enforcementOptions: Array<{
  type: RulesetEnforcement
  text: string
  description: string
  icon: JSX.Element
}> = [
  {
    type: RulesetEnforcement.Enabled,
    text: 'Active',
    description: 'Rules will be enforced',
    icon: <Octicon icon={PlayIcon} sx={{color: 'success.fg'}} />,
  },
  {
    type: RulesetEnforcement.Evaluate,
    text: 'Evaluate',
    description: 'Evaluate Rulesets to trial rules and view insights',
    icon: <Octicon icon={MeterIcon} sx={{color: 'severe.fg'}} />,
  },
  {
    type: RulesetEnforcement.Disabled,
    text: 'Disabled',
    description: 'Do not evaluate or enforce rules',
    icon: <Octicon icon={SkipIcon} sx={{color: 'fg.muted'}} />,
  },
]

const enforcementStatusLabel = 'Enforcement status'

export const GeneralPanel: FC<GeneralPanelProps> = ({
  readOnly,
  upsellInfo,
  name,
  sourceType,
  enforcement,
  generalErrors,
  nameRef,
  renameRuleset,
  setRulesetEnforcement,
  rulesetNameError,
  rulesetTarget,
}: GeneralPanelProps) => {
  const [showOrganizationDialog, setShowOrganizationDialog] = useState(false)
  const [showEnforcementMenu, setShowEnforcementMenu] = useState(false)
  const [nameError, setNameError] = useState('')
  const evaluateUpsellVisible = upsellInfo.enterpriseRulesets.cta.visible && upsellInfo.organization
  const [previousEnforcement, setPreviousEnforcement] = useState(enforcement)

  const supportedEnforcementOptions = enforcementOptions.filter(
    option =>
      !(option.type === RulesetEnforcement.Evaluate && rulesetTarget === 'member_privilege') &&
      (upsellInfo.enterpriseRulesets.featureEnabled ||
        evaluateUpsellVisible ||
        option.type !== RulesetEnforcement.Evaluate),
  )

  const selectedEnforcement =
    supportedEnforcementOptions.find(option => option.type === enforcement) ||
    supportedEnforcementOptions[supportedEnforcementOptions.length - 1]!

  useEffect(() => {
    // Set name error if present
    if (generalErrors?.name && generalErrors.name.length) {
      setNameError(generalErrors.name.map(e => e.message).join(','))
      return
    }
  }, [generalErrors])

  return (
    <>
      {!readOnly ? (
        <div className="d-flex flex-column gap-3 mb-4 mt-2" data-testid="general-panel">
          <FormControl>
            <FormControl.Label>Ruleset Name</FormControl.Label>
            <TextInput
              sx={{width: '35%'}}
              placeholder={name}
              ref={nameRef}
              value={name}
              aria-invalid={!!rulesetNameError}
              onChange={e => {
                renameRuleset(e.target.value)
              }}
            />
            {rulesetNameError && <FormControl.Validation variant="error">{rulesetNameError}</FormControl.Validation>}
            {nameError && (
              <FormControl.Validation variant="error" aria-live="polite">
                {nameError}
              </FormControl.Validation>
            )}
          </FormControl>

          <FormControl>
            <FormControl.Label>{enforcementStatusLabel}</FormControl.Label>

            {selectedEnforcement.type === RulesetEnforcement.Evaluate && evaluateUpsellVisible && (
              <FormControl.Caption>
                <span>
                  Evaluate mode is only available to Enterprise organizations.{' '}
                  {upsellInfo.enterpriseRulesets.cta.path && (
                    <Link to={upsellInfo.enterpriseRulesets.cta.path}>Upgrade to Enterprise to use this mode.</Link>
                  )}
                </span>
              </FormControl.Caption>
            )}

            <ActionMenu open={showEnforcementMenu} onOpenChange={() => setShowEnforcementMenu(!showEnforcementMenu)}>
              <ActionMenu.Button aria-label={`${selectedEnforcement.text}, ${enforcementStatusLabel}`}>
                <div className="d-inline pr-2">{selectedEnforcement.icon}</div>
                {selectedEnforcement.text}
              </ActionMenu.Button>

              <ActionMenu.Overlay width="medium">
                <ActionList selectionVariant="single">
                  <ActionList.Group>
                    <ActionList.GroupHeading>{enforcementStatusLabel}</ActionList.GroupHeading>
                    {supportedEnforcementOptions.map(option => (
                      <ActionList.Item
                        key={option.type}
                        selected={option.type === selectedEnforcement.type}
                        onSelect={e => {
                          if (sourceType === 'organization' && option.type === RulesetEnforcement.Enabled) {
                            e.preventDefault()
                            setRulesetEnforcement(option.type)
                            setPreviousEnforcement(enforcement)
                            setShowEnforcementMenu(false)
                            setShowOrganizationDialog(true)
                          } else {
                            setRulesetEnforcement(option.type)
                          }
                        }}
                      >
                        <ActionList.LeadingVisual>{option.icon}</ActionList.LeadingVisual>
                        {option.text}
                        {option.type === RulesetEnforcement.Evaluate && evaluateUpsellVisible && (
                          <Label className="ml-1" variant="accent">
                            Enterprise
                          </Label>
                        )}
                        <ActionList.Description variant="block">{option.description}</ActionList.Description>
                      </ActionList.Item>
                    ))}
                  </ActionList.Group>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </FormControl>
        </div>
      ) : (
        <div data-testid="general-panel-readOnly">
          <ReadOnlyRow title="Name">{name}</ReadOnlyRow>
          <ReadOnlyRow title={enforcementStatusLabel}>
            <span className="text-bold">{selectedEnforcement.text}</span>
            <span> - {selectedEnforcement.description}</span>
          </ReadOnlyRow>
        </div>
      )}

      <DangerConfirmationDialog
        isOpen={showOrganizationDialog}
        title="Enable Organization Ruleset"
        text="I want rules enforced on targeted repositories in this ruleset."
        buttonText="Confirm"
        onDismiss={() => {
          setShowOrganizationDialog(false)
          setRulesetEnforcement(previousEnforcement)
        }}
        onConfirm={() => {
          setShowOrganizationDialog(false)
          setRulesetEnforcement(RulesetEnforcement.Enabled)
        }}
      />
    </>
  )
}

function ReadOnlyRow({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Box
      className="Box-row"
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 3fr;',
      }}
    >
      <span className="text-bold">{title}</span>
      <span className="flex-1">{children}</span>
    </Box>
  )
}
