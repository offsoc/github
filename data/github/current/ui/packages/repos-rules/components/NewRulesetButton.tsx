import {useState, type FC} from 'react'
import {RulesetEnforcement, type RulesetTarget} from '../types/rules-types'
import type {ComboButtonAction} from './ComboButton'
import {ComboButton} from './ComboButton'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {ActionList, ActionMenu, Button, Box, Label} from '@primer/react'
import {Link} from '@github-ui/react-core/link'
import {useJsonUpload} from '../hooks/use-json-upload'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {TriangleDownIcon} from '@primer/octicons-react'
import type {FlashAlert} from '@github-ui/dismissible-flash'

type NewRulesetButtonProps = {
  rulesetsUrl: string
  reloadDocument?: boolean
  defaultEnforcement?: RulesetEnforcement
  sx?: BetterSystemStyleObject
  setFlashAlert: (flashAlert: FlashAlert) => void
  supportedTargets: RulesetTarget[]
}

export const NewRulesetButton: FC<NewRulesetButtonProps> = ({
  rulesetsUrl,
  reloadDocument,
  sx,
  defaultEnforcement = RulesetEnforcement.Disabled,
  setFlashAlert = () => {},
  supportedTargets,
}) => {
  const pushRulesetsEnabled = useFeatureFlag('push_rulesets')
  const rulesImportExport = useFeatureFlag('rules_import_export')
  const memberPrivilegeRulesetsEnabled = useFeatureFlag('member_privilege_rulesets')
  const {navigate} = useRelativeNavigation()
  const [menuOpen, setMenuOpen] = useState(false)

  const actions: ComboButtonAction[] = []

  if (supportedTargets.includes('branch')) {
    actions.push({
      text: 'New branch ruleset',
      href: `${rulesetsUrl}new?target=branch&enforcement=${defaultEnforcement}`,
      reloadDocument,
    })
  }

  if (supportedTargets.includes('tag')) {
    actions.push({
      text: 'New tag ruleset',
      href: `${rulesetsUrl}new?target=tag&enforcement=${defaultEnforcement}`,
      reloadDocument,
    })
  }

  if (supportedTargets.includes('member_privilege')) {
    actions.push({
      text: 'New policy',
      href: `${rulesetsUrl}new?target=member_privilege&enforcement=${defaultEnforcement}`,
      reloadDocument,
    })
  }

  if (supportedTargets.includes('push') && pushRulesetsEnabled) {
    actions.push({
      text: 'New push ruleset',
      href: `${rulesetsUrl}new?target=push&enforcement=${defaultEnforcement}`,
      reloadDocument,
    })
  }

  const jsonUploadUtil = useJsonUpload()

  return rulesImportExport ? (
    <Box sx={{...sx, display: 'flex'}}>
      <ActionMenu open={menuOpen} onOpenChange={() => setMenuOpen(!menuOpen)}>
        <ActionMenu.Anchor>
          <Button variant="primary" trailingAction={TriangleDownIcon}>
            {memberPrivilegeRulesetsEnabled && supportedTargets.includes('member_privilege')
              ? 'New policy'
              : 'New ruleset'}
          </Button>
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            {supportedTargets.includes('branch') && (
              <ActionList.LinkItem
                as={Link}
                to={`${rulesetsUrl}new?target=branch&enforcement=${encodeURI(defaultEnforcement)}`}
                className="text-decoration-skip"
              >
                New branch ruleset
              </ActionList.LinkItem>
            )}
            {supportedTargets.includes('tag') && (
              <ActionList.LinkItem
                as={Link}
                to={`${rulesetsUrl}new?target=tag&enforcement=${defaultEnforcement}`}
                className="text-decoration-skip"
              >
                New tag ruleset
              </ActionList.LinkItem>
            )}
            {pushRulesetsEnabled && supportedTargets.includes('push') && (
              <ActionList.LinkItem
                as={Link}
                className="text-decoration-skip"
                to={`${rulesetsUrl}new?target=push&enforcement=${defaultEnforcement}`}
              >
                <Box sx={{whiteSpace: 'nowrap', overflow: 'hidden'}}>New push ruleset</Box>
                <ActionList.TrailingVisual>
                  <Label variant="success">Beta</Label>
                </ActionList.TrailingVisual>
              </ActionList.LinkItem>
            )}
            {memberPrivilegeRulesetsEnabled && supportedTargets.includes('member_privilege') && (
              <ActionList.LinkItem
                as={Link}
                className="text-decoration-skip"
                to={`${rulesetsUrl}new?target=member_privilege&enforcement=${defaultEnforcement}`}
              >
                <Box sx={{whiteSpace: 'nowrap', overflow: 'hidden'}}>New policy</Box>
                <ActionList.TrailingVisual>
                  <Label variant="success">Beta</Label>
                </ActionList.TrailingVisual>
              </ActionList.LinkItem>
            )}
            <ActionList.Divider />
            <ActionList.Item
              as="button"
              onSelect={jsonUploadUtil.handleUploadIntent}
              disabled={jsonUploadUtil.isUploading}
            >
              Import a ruleset
              <ActionList.TrailingVisual>
                <Label variant="success">Beta</Label>
              </ActionList.TrailingVisual>
            </ActionList.Item>
            <input
              hidden
              ref={jsonUploadUtil.inputRef}
              type="file"
              accept=".json"
              onChange={async event => {
                try {
                  const importedRuleset = await jsonUploadUtil.handleUpload(event.target.files)
                  if (!importedRuleset) {
                    throw new Error('Cannot import an empty ruleset')
                  }
                  const navigationResult = await verifiedFetchJSON(
                    `${rulesetsUrl}new?imported_ruleset=${encodeURIComponent(importedRuleset)}`,
                    {method: 'GET'},
                  )
                  const result = await navigationResult.json()
                  if (result.errors) {
                    throw new Error(`Error importing ruleset: ${result.errors}`)
                  }
                  navigate(`${rulesetsUrl}new`, `imported_ruleset=${encodeURIComponent(importedRuleset)}`)
                } catch (error) {
                  setMenuOpen(false)
                  setFlashAlert({message: (error as Error).message || 'Error importing ruleset', variant: 'danger'})
                }
              }}
            />
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  ) : (
    <ComboButton actions={actions} ariaLabel="Open ruleset creation menu" />
  )
}
