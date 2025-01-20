// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {PercentageCircle} from '@github-ui/percentage-circle'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ClockIcon} from '@primer/octicons-react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {fetchQuery, graphql, requestSubscription, useRelayEnvironment} from 'react-relay'
import type {Disposable} from 'relay-runtime'

import {useQueryEditContext} from '../contexts/QueryContext'
import type {
  JobInfoWrapperStatusSubscription,
  JobInfoWrapperStatusSubscription$data,
} from './__generated__/JobInfoWrapperStatusSubscription.graphql'

const FORCE_RELOAD_INTERVAL = 60 * 1000 // 1 minute
const ERROR_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function JobInfoWithSubscription({children}: {children: React.ReactNode}) {
  const {addPersistedToast, addToast, clearPersistedToast} = useToastContext()
  const [subscription, setSubscription] = useState<Disposable | null>(null)
  const {bulkJobId, setBulkJobId} = useQueryEditContext()
  const environment = useRelayEnvironment()
  // the order of messages is not guaranteed, so we need to keep track of the last percentage
  const completionPercentageRef = useRef(0)
  const [lastUpdate, setLastUpdate] = useState<number | undefined>(undefined)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // in case the component is unmounted, we need to clear the timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const resetJob = useCallback(() => {
    // The job was not found, so we can stop polling
    setBulkJobId(null)

    completionPercentageRef.current = 0
    clearPersistedToast()

    // Dispose subscription
    subscription?.dispose()
    setSubscription(null)
  }, [setBulkJobId, clearPersistedToast, subscription])

  const config = useMemo(
    () => ({
      subscription: graphql`
        subscription JobInfoWrapperStatusSubscription($id: ID!) {
          jobStatusUpdated(id: $id) {
            jobStatus {
              percentage
              updatedAt
              jobId
              state
              executionErrors {
                message
                nodeId
              }
            }
          }
        }
      `,
      variables: {
        id: bulkJobId!,
      },
      onNext: (response: JobInfoWrapperStatusSubscription$data | null | undefined) => {
        if (!response || !response.jobStatusUpdated || !response.jobStatusUpdated.jobStatus) {
          resetJob()
          return
        }
        const {jobStatusUpdated} = response
        const jobStatus = jobStatusUpdated.jobStatus!

        const nrErrors = jobStatusUpdated?.jobStatus?.executionErrors?.length ?? 0
        let currentPercentage = 0
        const jobUpdateAt = new Date(jobStatus.updatedAt)
        const diffInMs = Date.now() - jobUpdateAt.getTime()

        switch (jobStatus.state) {
          case 'ERROR':
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: 'Bulk update had an error',
            })
            resetJob()
            break
          case 'PENDING':
          case 'QUEUED':
            if (!jobStatus.jobId) {
              // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
              addToast({
                type: 'error',
                message: 'Bulk update could not be started, please try again later.',
              })
              reportError(new Error(`Issue bulk edit job mutation did not create a job (no job id)`))
              resetJob()
            } else {
              // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
              addPersistedToast({
                message: 'Bulk update is pending',
                icon: <ClockIcon />,
                type: 'info',
                role: 'status',
              })
            }
            break
          case 'STARTED':
            if (completionPercentageRef.current === 100) {
              // Sometimes messages are out of order, so we ignore this message if we already have a 100% completion
              break
            }

            if (jobStatus.percentage && jobStatus.percentage > completionPercentageRef.current) {
              completionPercentageRef.current = jobStatus.percentage
            }
            currentPercentage = completionPercentageRef.current

            // if the job started and didnt get an update after 5 minutes
            // (ie the job status object in the KV hasnt changed) we consider this as failed
            if (diffInMs > ERROR_TIMEOUT) {
              resetJob()
              // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
              addToast({
                type: 'error',
                message:
                  'The update operation has timed out but your changes might have been applied. Please check the items and, if needed, attempt the update again in a few minutes and contact us if the error persists.',
              })
              // report error to sentry
              reportError(new Error(`Issue bulk edit job(${jobStatus.jobId}) did not advance after 5 minutes`))
              break
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }

            // force a re-render to update the toast after 1 minute of inactivity once the job is started
            timeoutRef.current = setTimeout(() => {
              setLastUpdate(Date.now())
            }, FORCE_RELOAD_INTERVAL)

            if (bulkJobId) {
              // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
              addPersistedToast({
                message: `Bulk update is in progress ${currentPercentage} % ${
                  nrErrors > 0 ? `(${nrErrors} issues failing to update)` : ''
                }`,
                icon: <PercentageCircle progress={currentPercentage / 100.0} />,
                type: 'info',
                role: 'status',
              })
            }
            break
          case 'SUCCESS':
            completionPercentageRef.current = 100
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'success',
              message: `Bulk update completed ${nrErrors > 0 ? 'with errors' : 'successfully'}`,
            })
            resetJob()
            if (nrErrors > 0) {
              // refetch the issues that failed to reset the optimistic update on the UI
              let ids = jobStatus.executionErrors.map(error => error.nodeId)
              const store = environment.getStore().getSource()
              ids = ids.filter(id => store.has(id))
              fetchQuery(
                environment,
                graphql`
                  query JobInfoWrapperQuery($ids: [ID!]!) {
                    nodes(ids: $ids) {
                      ... on Issue {
                        # This is fragment spread is not colocated because it is used in a different file
                        # the subscription is not rendering anything
                        # eslint-disable-next-line relay/must-colocate-fragment-spreads
                        ...IssueRow @arguments(labelPageSize: 20, fetchRepository: true)
                      }
                    }
                  }
                `,
                {
                  ids,
                },
                {
                  fetchPolicy: 'network-only',
                },
              ).subscribe({}) // call subscribe to trigger the query
            }
            break
          default:
            resetJob()
            throw new Error(`Unexpected job status: ${jobStatus.state}`)
        }
      },
    }),
    [bulkJobId, resetJob, addToast, addPersistedToast, environment],
  )

  useEffect(() => {
    if (bulkJobId) {
      if (!subscription || lastUpdate) {
        setSubscription(requestSubscription<JobInfoWrapperStatusSubscription>(environment, config))
        if (lastUpdate) {
          // report that there was an error with the subscriptions to sentry
          reportError(
            new Error(
              `Issue bulk edit job(${bulkJobId}) did not send an update after 1 minute (subscription msg not received)`,
            ),
          )
        }
        setLastUpdate(undefined)
      }
    } else {
      clearPersistedToast()
    }
    // lastUpdate is a dependency because we want to force a re-trigger the subscription to fetch the latest status
  }, [config, environment, bulkJobId, setSubscription, lastUpdate, subscription, clearPersistedToast])

  return <>{children}</>
}
