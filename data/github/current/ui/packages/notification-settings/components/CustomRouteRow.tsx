import {type FC, useCallback, useState, useEffect, useRef} from 'react'
import {ActionMenu, ActionList, Box, type BoxProps, Button, IconButton, Text, Select, FormControl} from '@primer/react'
import {ArrowRightIcon, KebabHorizontalIcon, PencilIcon, TrashIcon} from '@primer/octicons-react'
import State, {type SavingStatus} from './State'
import OrganizationSelect from '../components/dropdown/OrganizationSelect'
import type {OrganizationRecord} from '../types/settings-types'
import type {CustomRouteKey} from '../types/custom-route-types'

type CustomRouteRowProps = {
  /// Selection state
  email: string | null /// Email key to pre-select
  login: CustomRouteKey /// Organization login for use in callbacks
  organization: OrganizationRecord | null /// Organization to pre-select
  organizationRecords: OrganizationRecord[] /// List of selecable organizations

  /// Row state
  isEditing?: boolean | null /// Whether component is in edit mode
  isEditDisabled?: boolean | null /// Whether to disallow editing
  stateStatus?: SavingStatus | null /// Status of saving state

  /// Callbacks
  onSave: {(login: CustomRouteKey, email: string): void} /// Callback to save route changes
  onDelete: {(login: CustomRouteKey): void} /// Callback to delete route
  onEdit: {(login: CustomRouteKey | null): void} /// Callback to edit route (null to cancel)
}

/**
 * @summary Render a custom route.
 *
 * @description The component is responsbile for rendering the provided
 * custom route mapping. It provides a button to edit the custom route,
 * which it will call back with once an edit is saved. There is also
 * an option to delete the custom route. By default, the component will
 * be in edit mode, unless an orgId/email combination is passed in.
 * If an orgId is passed in, it will not be allowed to be changed.
 *
 * @param props Current configuration (if any) and available options
 * @returns Route row
 */
const CustomRouteRow: FC<CustomRouteRowProps & BoxProps> = ({
  email,
  login: organizationLogin,
  organization,
  organizationRecords,
  isEditing,
  isEditDisabled,
  stateStatus,
  onSave,
  onDelete,
  onEdit,
  ...rest
}) => {
  const [readOnly, setReadOnly] = useState<boolean>(!isEditing ?? true)
  const [hasEdited, setHasEdited] = useState<boolean>(false)
  const actionMenuRef = useRef<HTMLButtonElement>(null)
  const selectEmailRef = useRef<HTMLSelectElement>(null)
  // Once an organization is selected, it cannot be changed without deleting the route
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationRecord | null>(organization ?? null)
  const isOrgReadOnly = selectedOrganization ? true : false
  const [selectedEmail, setSelectedEmail] = useState<string | null>(email)

  const isValid = selectedEmail && selectedOrganization

  useEffect(() => {
    setSelectedEmail(email)
  }, [email])

  /**
   * @summary Cancel edit action and put row back in original state
   */
  const cancelCallback = useCallback(() => {
    // External callback
    if (!organization) return onDelete(organizationLogin)

    // Internal state reset
    setSelectedOrganization(organization ?? null)
    setSelectedEmail(organization ? organization.email : null)
    setHasEdited(true)
    setReadOnly(true)

    // External callback
    if (onEdit) {
      onEdit(null)
    }
  }, [onDelete, onEdit, organization, organizationLogin])

  /**
   * @summary Commit edit action and callback with updated custom route
   */
  const saveCallback = useCallback(() => {
    // Quit if we are not ready to save yet
    if (!isValid) return

    // External callback
    onSave(selectedOrganization.login, selectedEmail)

    // Internal state update
    setHasEdited(true)
    setReadOnly(true)
  }, [onSave, selectedEmail, selectedOrganization, isValid])

  /**
   * @summary Put row into editing mode
   */
  const editCallback = useCallback(() => {
    // External callback
    if (onEdit) {
      onEdit(organizationLogin)
    }

    // Internal state update
    setReadOnly(false)
    setSelectedEmail(null) // Clear email selection so that the dropdown opens
  }, [onEdit, organizationLogin])

  /**
   * @summary Delete custom route
   */
  const deleteCallback = useCallback(() => {
    // External callback
    onDelete(organizationLogin)
  }, [onDelete, organizationLogin])

  useEffect(() => {
    // return focus to SelectEmailRef
    if (!readOnly && selectedOrganization) {
      selectEmailRef.current?.focus()
    }
  }, [readOnly, selectEmailRef, selectedOrganization])

  useEffect(() => {
    // return focus to actionMenu on save or cancel
    if (hasEdited && readOnly) {
      actionMenuRef.current?.focus()
    }
  }, [readOnly, hasEdited, actionMenuRef])

  return (
    <Box
      className="Box-row"
      // Make sure we extend styled props
      {...rest}
      sx={{
        ...(rest.sx || {}),
        display: 'flex',
        flexWrap: readOnly ? 'nowrap' : 'wrap',
        gap: 2,
      }}
    >
      <div
        className="d-block d-sm-flex flex-sm-row"
        style={{display: 'flex', flexGrow: '1', overflow: 'hidden', gap: '8px'}}
      >
        {/* Organization picker */}
        <div
          className="mb-1 mb-sm-0"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexBasis: readOnly ? '16em' : 'auto',
            minWidth: '8em',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {(readOnly || isOrgReadOnly) && selectedOrganization ? (
            <>
              <Box sx={{pr: 2, display: 'flex'}}>
                <img width={16} height={16} alt={selectedOrganization.login} src={selectedOrganization.avatarUrl} />
              </Box>
              <Box sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {selectedOrganization.login}
              </Box>
            </>
          ) : (
            <OrganizationSelect
              organizations={organizationRecords}
              orgLogin={selectedOrganization ? selectedOrganization.login : null}
              // Open immediately if no organization is selected
              open={selectedOrganization ? false : true}
              onChange={login => {
                return setSelectedOrganization(organizationRecords.find(org => org.login === login) ?? null)
              }}
            />
          )}
        </div>

        {/* Route arrow (make sure we pad it out and vertically center it) */}
        <Box
          className="hide-sm"
          sx={{
            px: 3,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowRightIcon size={16} />
        </Box>

        {/* Email picker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            className="hide-md hide-lg hide-xl"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '8px',
            }}
          >
            <ArrowRightIcon size={16} />
          </div>
          {readOnly ? (
            <Box sx={{display: 'flex', alignItems: 'center', overflow: 'hidden'}}>
              <Text as="span" sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {selectedEmail}
              </Text>
            </Box>
          ) : (
            <FormControl>
              <FormControl.Label visuallyHidden>Email</FormControl.Label>
              <Select
                ref={selectEmailRef}
                placeholder="Select Email"
                defaultValue={selectedEmail ? selectedEmail : 'Select email'}
                onChange={e => setSelectedEmail(e.target.value)}
              >
                {(selectedOrganization?.notifiableEmailsForUser ?? []).map(notifiableEmail => (
                  <option key={notifiableEmail} value={notifiableEmail} data-testid="email-option">
                    {notifiableEmail}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
      </div>

      {/* Route actions */}
      <Box sx={{display: 'flex', marginLeft: 'auto', justifyContent: 'flex-end'}}>
        {stateStatus && <State status={stateStatus} sx={{display: 'flex', alignItems: 'center', mx: 3}} />}

        {readOnly ? (
          <ActionMenu anchorRef={actionMenuRef}>
            <ActionMenu.Anchor data-testid="custom-route-row-actions">
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                icon={KebabHorizontalIcon}
                variant="invisible"
                aria-label="Open column options"
              />
            </ActionMenu.Anchor>

            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item onSelect={editCallback} disabled={isEditDisabled ?? false} role="menuitem">
                  <ActionList.LeadingVisual>
                    <PencilIcon />
                  </ActionList.LeadingVisual>
                  Edit
                </ActionList.Item>
                <ActionList.Item variant="danger" onSelect={deleteCallback} role="menuitem">
                  <ActionList.LeadingVisual>
                    <TrashIcon />
                  </ActionList.LeadingVisual>
                  Delete
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        ) : (
          <Box sx={{display: 'flex', alignItems: 'flex-end', gap: 2}}>
            <Button variant="danger" onClick={cancelCallback}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveCallback} disabled={!isValid}>
              Save
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
export default CustomRouteRow
