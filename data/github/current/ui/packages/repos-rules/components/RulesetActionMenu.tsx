import type {FC} from 'react'
import {useState} from 'react'
import {ActionList, IconButton, Label} from '@primer/react'
import {DownloadIcon, GraphIcon, HistoryIcon, PulseIcon, TrashIcon} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'
import {downloadRuleset} from '../helpers/export-ruleset'
import type {Ruleset} from '../types/rules-types'
import {RulesetEnforcement} from '../types/rules-types'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {useIsStafftools} from '../hooks/use-is-stafftools'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {DangerConfirmationDialog} from './ruleset/DangerConfirmationDialog'
import sudo from '@github-ui/sudo'
import type {FlashAlert} from '@github-ui/dismissible-flash'

export const RulesetActionMenu: FC<{
  ruleset: Ruleset
  rulesetsUrl: string
  isRestored?: boolean
  insightsEnabled: boolean
  showDeleteAction: boolean
  readOnly?: boolean
  rulesHistory: boolean
  rulesImportExport: boolean
  enterpriseEnabled: boolean
  setFlashAlert: (flashAlert: FlashAlert) => void
  setMenuOpen: (menuOpen: boolean) => void
}> = ({
  ruleset,
  rulesetsUrl,
  isRestored,
  insightsEnabled,
  showDeleteAction,
  readOnly,
  rulesHistory,
  rulesImportExport,
  enterpriseEnabled,
  setFlashAlert,
  setMenuOpen,
}) => {
  const isStafftools = useIsStafftools()
  const viewHistory = rulesHistory && (isStafftools || (!isStafftools && !readOnly && enterpriseEnabled))

  return (
    <ActionList>
      {viewHistory && (
        <ActionList.LinkItem
          as={Link}
          aria-label={`View history for the ruleset named ${ruleset.name}`}
          to={`${rulesetsUrl}/${ruleset.id}/history`}
          className="text-decoration-skip"
        >
          <ActionList.LeadingVisual>
            <HistoryIcon size={16} />
          </ActionList.LeadingVisual>
          History
          <ActionList.TrailingVisual>
            <Label variant="success">Beta</Label>
          </ActionList.TrailingVisual>
        </ActionList.LinkItem>
      )}
      <InsightsLink
        ruleset={ruleset}
        rulesetsUrl={rulesetsUrl}
        insightsEnabled={insightsEnabled}
        readOnly={readOnly}
        rulesHistory={rulesHistory}
        rulesImportExport={rulesImportExport}
      />
      {rulesImportExport && (!readOnly || isStafftools) && (
        <ActionList.LinkItem
          download={`${ruleset.name}.json`}
          target="_self"
          onClick={async () => {
            if (isRestored) {
              setMenuOpen(false)
              // To reduce confusion on what is being exported during restoration,
              // don't allow exporting a ruleset while restoring.
              setFlashAlert({
                variant: 'danger',
                message: 'Cannot export a ruleset while restoring. Save or cancel and try again.',
              })
            } else {
              try {
                await downloadRuleset(`${rulesetsUrl}/${ruleset.id}/export_ruleset`, ruleset.name)
              } catch {
                setMenuOpen(false)
                setFlashAlert({
                  variant: 'danger',
                  message: 'Error exporting ruleset',
                })
              }
            }
          }}
          sx={{textDecoration: 'none', whiteSpace: 'nowrap'}}
        >
          <ActionList.LeadingVisual>
            <DownloadIcon size={16} />
          </ActionList.LeadingVisual>
          Export ruleset
          <ActionList.TrailingVisual>
            <Label variant="success">Beta</Label>
          </ActionList.TrailingVisual>
        </ActionList.LinkItem>
      )}
      {!readOnly && !isStafftools && (
        <DeleteAction
          deletePath={`${rulesetsUrl}/${ruleset.id}`}
          redirectPath={rulesetsUrl}
          isRestored={isRestored}
          showDeleteAction={showDeleteAction}
          setFlashAlert={setFlashAlert}
          setMenuOpen={setMenuOpen}
        />
      )}
    </ActionList>
  )
}

export const InsightsLink: FC<{
  ruleset: Ruleset
  rulesetsUrl: string
  insightsEnabled: boolean
  readOnly?: boolean
  rulesHistory: boolean
  rulesImportExport: boolean
}> = ({ruleset, rulesetsUrl, insightsEnabled, readOnly, rulesHistory, rulesImportExport}) => {
  const key = ruleset.source.type
  const isStafftools = useIsStafftools()

  if (
    (!readOnly || isStafftools) &&
    ruleset.enforcement !== RulesetEnforcement.Disabled &&
    key === 'Repository' &&
    insightsEnabled
  ) {
    return rulesHistory || rulesImportExport ? (
      <ActionList.LinkItem
        as={Link}
        aria-label={`View insights for the ruleset named ${ruleset.name}`}
        to={`${rulesetsUrl}/insights?ruleset=${ruleset.name}`}
        className="text-decoration-skip"
      >
        <ActionList.LeadingVisual>
          <GraphIcon size={16} />
        </ActionList.LeadingVisual>
        Insights
      </ActionList.LinkItem>
    ) : (
      <IconButton
        as={Link}
        aria-label={`View insights for the ruleset named ${ruleset.name}`}
        variant="invisible"
        icon={PulseIcon}
        to={`insights?ruleset=${ruleset.name}`}
        reloadDocument
      />
    )
  }

  return null
}

const DeleteAction: FC<{
  deletePath: string
  redirectPath?: string
  isRestored?: boolean
  showDeleteAction: boolean
  setFlashAlert: (flashAlert: FlashAlert) => void
  setMenuOpen: (menuOpen: boolean) => void
}> = ({deletePath, redirectPath, isRestored, showDeleteAction, setFlashAlert, setMenuOpen}) => {
  const {navigate} = useRelativeNavigation()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deleteRuleset = async () => {
    if (!(await sudo())) {
      setMenuOpen(false)
      setFlashAlert({
        variant: 'danger',
        message: 'Unauthorized',
      })
      return
    }

    try {
      const res = await verifiedFetch(deletePath, {
        method: 'delete',
      })
      if (res.ok) {
        setShowDeleteDialog(false)
        if (redirectPath) navigate(redirectPath, undefined, true, true)
      } else {
        setMenuOpen(false)
        setFlashAlert({
          variant: 'danger',
          message: 'Error deleting ruleset',
        })
      }
    } catch (e) {
      setMenuOpen(false)
      setFlashAlert({
        variant: 'danger',
        message: 'Error deleting ruleset',
      })
    }
  }

  return showDeleteAction ? (
    <>
      <ActionList.Item
        variant="danger"
        onSelect={e => {
          if (isRestored) {
            setMenuOpen(false)
            // To reduce confusion on what is being deleted during restoration,
            // don't allow deleting a ruleset while restoring.
            setFlashAlert({
              variant: 'danger',
              message: 'Cannot delete a ruleset while restoring. Save or cancel and try again.',
            })
          } else if (setShowDeleteDialog) setShowDeleteDialog(true)
          e.preventDefault()
        }}
      >
        <ActionList.LeadingVisual>
          <TrashIcon size={16} />
        </ActionList.LeadingVisual>
        Delete ruleset
      </ActionList.Item>
      <DangerConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete ruleset?"
        text="Are you sure you want to delete this ruleset? This action cannot be undone."
        buttonText="Delete"
        onDismiss={() => {
          setShowDeleteDialog(false)
        }}
        onConfirm={deleteRuleset}
      />
    </>
  ) : null
}
