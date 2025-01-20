import {Box, Checkbox, FormControl, Heading, Spinner} from '@primer/react'
import type {User} from '../pickers/UserPicker'
import {
  UserPicker,
  UserPickerEnterpriseOwnersQuery,
  UserPickerUserFragment,
  UserPickerInitialUsersQuery,
} from '../pickers/UserPicker'
import {fetchQuery, readInlineData, useQueryLoader, useRelayEnvironment} from 'react-relay'
import type {UserPickerEnterpriseOwnersQuery as UserPickerEnterpriseOwnersQueryType} from '../pickers/__generated__/UserPickerEnterpriseOwnersQuery.graphql'
import {Suspense, useEffect, useState, useContext} from 'react'
import type {UserPickerInitialUsersQuery as UserPickerInitialUsersQueryType} from '../pickers/__generated__/UserPickerInitialUsersQuery.graphql'
import type {UserPickerUserFragment$key} from '../pickers/__generated__/UserPickerUserFragment.graphql'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import type {EditBudget} from '../../types/budgets'
import {PageContext} from '../../App'

interface Props {
  alertEnabled: EditBudget['alertEnabled']
  alertRecipientUserIds: string[]
  setAlertEnabled: (alertEnabled: EditBudget['alertEnabled']) => void
  setAlertRecipientUserIds: (alertRecipientUsers: string[]) => void
  slug: string
}

export function BudgetAlertSelector({
  alertEnabled,
  alertRecipientUserIds,
  setAlertEnabled,
  setAlertRecipientUserIds,
  slug,
}: Props) {
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const [loading, setLoading] = useState<boolean>(false)
  const [initialRecipients, setInitialRecipients] = useState<User[]>([])
  const [enterpriseOwnersRef, loadEnterpriseOwners, disposeEnterpriseOwners] =
    useQueryLoader<UserPickerEnterpriseOwnersQueryType>(UserPickerEnterpriseOwnersQuery)
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute

  useEffect(() => {
    loadEnterpriseOwners({slug})
    return () => {
      disposeEnterpriseOwners()
    }
  }, [slug, loadEnterpriseOwners, disposeEnterpriseOwners, alertRecipientUserIds])

  const toggleReceiveAlerts = () => {
    setAlertEnabled(!alertEnabled)
  }

  const handleRecipientsChange = (users: User[]) => {
    const selectedRecipients = users.filter(u => !!u.id).map(u => u.id)
    setAlertRecipientUserIds(selectedRecipients)
  }

  useEffect(() => {
    setLoading(true)
    fetchQuery<UserPickerInitialUsersQueryType>(environment, UserPickerInitialUsersQuery, {
      ids: alertRecipientUserIds,
    }).subscribe({
      next: data => {
        const nodes = (data.nodes || []).flatMap(node =>
          // eslint-disable-next-line no-restricted-syntax
          node ? [readInlineData<UserPickerUserFragment$key>(UserPickerUserFragment, node)] : [],
        )
        handleRecipientsChange(nodes)
        setInitialRecipients(nodes)
        setLoading(false)
      },
      error: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({type: 'error', message: 'Unable to get currrent user', role: 'alert'})
        setLoading(false)
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment])

  return (
    <>
      <Box sx={{paddingBottom: 2, paddingTop: 3}}>
        <Heading as="h3" sx={{fontSize: 2}} className="Box-title">
          Alerts
        </Heading>
        <span>
          Get emails and GitHub notifications when your spending has reached 75%, 90%, and 100% of the budget threshold.
        </span>
      </Box>
      <div className="Box">
        <div className="Box-row">
          <FormControl disabled={isStafftoolsRoute}>
            <Checkbox checked={alertEnabled} onChange={toggleReceiveAlerts} name="alert-checkbox" />
            <FormControl.Label>Receive budget threshold alerts</FormControl.Label>
          </FormControl>
        </div>
      </div>
      {alertEnabled && (
        <Box sx={{paddingBottom: 2, paddingTop: 3}}>
          <Heading as="h2" sx={{fontSize: 1}}>
            Alert recipients
          </Heading>
          <span>These people will get notified via email if this budget has reached the specific threshold.</span>
          <Suspense fallback={<Spinner size="small" />}>
            {enterpriseOwnersRef && !loading && (
              <UserPicker
                slug={slug}
                initialRecipients={initialRecipients}
                onSelectionChange={handleRecipientsChange}
                preloadedEnterpriseOwnersData={enterpriseOwnersRef}
              />
            )}
          </Suspense>
        </Box>
      )}
    </>
  )
}
