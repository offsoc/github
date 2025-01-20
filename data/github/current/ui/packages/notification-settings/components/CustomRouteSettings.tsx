/**
 * @fileoverview User notification custom route settings.
 *
 * Renders table consisting of "custom route" rows,
 * each row is editable and deletable. Changes are
 * persisted in the DB using callbacks.
 */
import React, {type FC, useCallback, useReducer, useRef, useMemo, useEffect} from 'react'
import {Box, type BoxProps, Button} from '@primer/react'

import {SavingStatus} from './State'
import {
  type CustomRoutesPayload,
  type CustomRouteKey,
  type CustomRouteState,
  type OrganizationMap,
  type RouteStateMap,
  RouteActions,
  type RouteStateAction,
  DRAFT_KEY,
} from '../types/custom-route-types'

import {updateOrgNotificationPrefs, clearOrgNotificationPrefs} from '../services/api'
import CustomRouteRow from './CustomRouteRow'
import type {OrganizationRecord} from '../types/settings-types'

export const FALLBACK_TEXT = 'No custom routes yet.'

/**
 * CustomRouteSettings props containing API payload
 */
type CustomRouteSettingsProps = {
  payload: CustomRoutesPayload /// API response for custom routes
}

/**
 * @summary Render the custom routes settings page.
 *
 * @description Our API returns the list of organizations, which may
 * or may not have custom routes. If they do not have a custom route,
 * they are considered default routes.
 *
 * For default routes, do not render them but allow them to be added.
 * For custom routes, render them and allow them to be edited/deleted.
 *
 * Note that a custom route can be created that matches a default route,
 * in which case it should take presedence over the default route.
 * Meaning a change to the default email address should not affect the route.
 *
 * @param props Box props and Custom Routes API payload
 * @returns Current routes
 */
const CustomRouteSettings: FC<BoxProps & CustomRouteSettingsProps> = ({payload, ...rest}) => {
  const {organizationRecords, verificationEnabled, globalEmailAddress} = payload
  const addNewRouteButton = useRef<HTMLButtonElement>(null)

  const initialState: RouteStateMap = useMemo(
    /**
     * @returns Inital state for custom routes
     */
    function initialiseState() {
      return new Map(
        organizationRecords
          // Only display organizations that have custom routes
          .filter(org => org.display)
          // `new Map()` takes in an array of [key, value] pairs
          .map(org => [org.login, {status: SavingStatus.IDLE, email: org.email}]),
      )
    },
    [organizationRecords],
  )
  const organizationMap: OrganizationMap = useMemo(
    /**
     * @returns Organization record hashmap keyed by login
     */
    function mapOrganizationRecords() {
      return new Map(organizationRecords.map(org => [org.login, org]))
    },
    [organizationRecords],
  )

  /**
   * Dispatch handler
   *
   * @param state Current state
   * @param action Action that was dispatched
   *
   * @returns Updated state
   */
  const stateReducer = (state: RouteStateMap, action: RouteStateAction) => {
    const newState = new Map(state.entries())

    const {type, login, ...up} = action
    const oldRowState = login ? state.get(login) : {}

    switch (type) {
      case RouteActions.DELETE:
        // Remove the row from the state
        newState.delete(login)
        break

      case RouteActions.UPDATE:
        // Update old value in-place, overriding any previous state;
        // we support partial updates assuming the initial state is valid
        // hence why the type cast is safe (@see `#initialiseState()`)
        newState.set(login, {...oldRowState, ...up} as CustomRouteState)
        break
    }
    return newState
  }
  const [stateMap, dispatch] = useReducer(stateReducer, initialState)

  // Make sure we are only rendering one status message at a time
  const [statusLogin, setStatusLogin] = React.useState<CustomRouteKey | null>(null)

  // Make sure we are only allowing 1 row to be edited at a time
  const [editingLogin, setEditingLogin] = React.useState<CustomRouteKey | null>(null)

  const isEditing: boolean = editingLogin ? true : false
  const [isEditingNewRoute, setIsEditingNewRoute] = React.useState<boolean>(false)

  // Helper methods to reset the state to the original values
  const clearStatus = useCallback(() => setStatusLogin(null), [setStatusLogin])
  const finishEditing = useCallback(() => {
    setEditingLogin(null)
  }, [setEditingLogin])

  useEffect(() => {
    if (!editingLogin && isEditingNewRoute) {
      addNewRouteButton.current?.focus()
      setIsEditingNewRoute(false)
    }
  }, [editingLogin, isEditingNewRoute, setIsEditingNewRoute, addNewRouteButton])

  const orderedLogins: CustomRouteKey[] = useMemo(
    /**
     * @returns Ordered list of organization logins
     */
    function orderLogins() {
      return Array.from(stateMap.keys()).sort()
    },
    [stateMap],
  )
  const selectableOrganizations: OrganizationRecord[] = useMemo(
    /**
     * @returns Array of selectable organizations
     */
    function filterSelectedOrganizations() {
      // Only allow an organization to be selected if it has no custom route
      return organizationRecords.filter(org => {
        for (const [login] of stateMap) {
          if (login === org.login) {
            return false
          }
        }
        return true
      })
    },
    [organizationRecords, stateMap],
  )

  /**
   * @summary Delete a custom route
   *
   * @param login Organization login
   */
  const deleteCallback = useCallback(
    async (login: CustomRouteKey) => {
      // Handle deleting a 'draft' route
      if (login === DRAFT_KEY) {
        dispatch({type: RouteActions.DELETE, login})
        finishEditing()
        return
      }

      // Update status so that we render it loading
      setEditingLogin(login)
      setStatusLogin(login)
      dispatch({type: RouteActions.UPDATE, login, status: SavingStatus.LOADING})

      // Fire off request to delete route
      const res = await clearOrgNotificationPrefs(login)
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (res.ok) {
        // Remove the route from the displayed list once it's deleted
        dispatch({type: RouteActions.DELETE, login})
      } else {
        dispatch({type: RouteActions.UPDATE, login, status: SavingStatus.ERROR})
      }

      // Status immediately clears as row is no longer rendered
      finishEditing()
      clearStatus()
    },
    [dispatch, finishEditing, clearStatus],
  )

  /**
   * @summary Save changes made to a custom route
   */
  const saveCallback = useCallback(
    async (login: CustomRouteKey, email: string) => {
      // Handle saving a 'draft' route
      if (!(login in stateMap.keys())) {
        dispatch({type: RouteActions.DELETE, login: DRAFT_KEY})
      }

      // Update status so that we render it loading
      setStatusLogin(login)
      dispatch({type: RouteActions.UPDATE, login, status: SavingStatus.LOADING})

      // Fire off request to save route
      const res = await updateOrgNotificationPrefs(login, email)
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (res.ok) {
        // Update the route once it's saved
        dispatch({type: RouteActions.UPDATE, login, email, status: SavingStatus.SUCCESS})
      } else {
        dispatch({type: RouteActions.UPDATE, login, status: SavingStatus.ERROR})
      }
      finishEditing()
    },
    [stateMap, dispatch, finishEditing],
  )

  /**
   * @summary Handle edit/cancel from a custom route row
   */
  const editCallback = useCallback(
    (login: CustomRouteKey | null) => {
      clearStatus()
      setEditingLogin(login)
    },
    [setEditingLogin, clearStatus],
  )

  /**
   * @summary Create a new 'draft' custom route row for the user to edit
   */
  const addCallback = useCallback(() => {
    dispatch({type: RouteActions.UPDATE, login: DRAFT_KEY, status: SavingStatus.IDLE, email: null})
    setIsEditingNewRoute(true)
    editCallback(DRAFT_KEY)
  }, [dispatch, editCallback])

  return (
    <Box {...rest}>
      {/* Explainer section with new route button */}
      <Box as="section" sx={{display: 'flex', flexDirection: 'column'}}>
        <div>
          <p>
            You can send notifications to different {verificationEnabled ? <strong>verified </strong> : null}
            email addresses depending on the organization that owns the repository.
          </p>
        </div>
        <Box
          as="section"
          sx={{display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between', alignItems: 'center'}}
        >
          <small>{globalEmailAddress} is your current default email for notifications.</small>
          <Button
            variant="primary"
            sx={{mt: 'auto', ml: 'auto'}} // Bottom-right align
            // Prevent 'draft' routes from being created if one is already present
            // or if a row is in edit mode
            disabled={isEditing}
            onClick={addCallback}
            ref={addNewRouteButton}
          >
            Add new route
          </Button>
        </Box>
      </Box>

      {/* Custom route table, n.b. we must render a top border as part of the parent list element */}
      <Box
        sx={{mt: 3, borderTopStyle: 'solid', borderColor: 'border.default', borderRadius: '6px', borderWidth: '1px'}}
      >
        {orderedLogins.length < 1 ? (
          <Box
            className="Box-row text-center"
            key="no-routes"
            sx={{
              borderStyle: 'solid',
              borderColor: 'border.default',
              borderWidth: '1px',
            }}
          >
            <span>{FALLBACK_TEXT}</span>
          </Box>
        ) : (
          orderedLogins.map(login => {
            // Build the custom route row component in a closure
            // so that we can lookup and inject any necessary state
            const {email, status} = stateMap.get(login)!
            const record = organizationMap.get(login)!
            return (
              <CustomRouteRow
                data-testid="custom-route-row"
                key={login}
                login={login}
                email={email}
                organization={record}
                organizationRecords={selectableOrganizations}
                isEditing={login === editingLogin}
                // Prevent more than one row from being edited at a time
                isEditDisabled={isEditing}
                stateStatus={login === statusLogin ? status : null}
                onDelete={deleteCallback}
                onSave={saveCallback}
                onEdit={editCallback}
                sx={{
                  borderStyle: 'solid',
                  borderColor: 'border.default',
                  borderWidth: '1px',
                }}
              />
            )
          })
        )}
      </Box>
    </Box>
  )
}
export default CustomRouteSettings
