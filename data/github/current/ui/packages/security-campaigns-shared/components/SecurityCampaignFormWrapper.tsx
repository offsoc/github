import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from 'react'
import type {User} from '../types/user'
import type {SecurityCampaign, SecurityCampaignForm} from '../types/security-campaign'
import {SecurityCampaignFormContext, type SecurityCampaignFormContextValue} from './SecurityCampaignFormContext'

export type SecurityCampaignFormWrapperProps = {
  campaign: SecurityCampaign | undefined
  currentUser: User | undefined
  allowDueDateInPast: boolean

  submitForm: (campaign: SecurityCampaignForm) => void
  reset: () => void
  isPending: boolean
  formError: Error | null

  // The default due date for the campaign.
  // Only used for testing purposes because there's a bug opening the datepicker in the tests.
  // See https://github.com/github/code-scanning/issues/14686
  defaultDueDate?: Date

  children: ReactNode
}

export function SecurityCampaignFormWrapper({
  campaign,
  currentUser,
  allowDueDateInPast,
  submitForm,
  reset,
  isPending,
  formError,
  defaultDueDate,
  children,
}: SecurityCampaignFormWrapperProps) {
  const initialCampaignName = campaign?.name ?? ''
  const initialCampaignDescription = campaign?.description ?? ''
  const initialCampaignDueDate = useMemo(() => {
    if (campaign !== undefined) {
      return new Date(campaign.endsAt)
    } else {
      return defaultDueDate ?? null
    }
  }, [campaign, defaultDueDate])
  const initialCampaignManager = campaign?.manager ?? currentUser ?? null

  const [campaignName, setCampaignName] = useState(initialCampaignName)
  const [campaignDescription, setCampaignDescription] = useState(initialCampaignDescription)
  const [campaignDueDate, setCampaignDueDate] = useState<Date | null>(initialCampaignDueDate)
  const [campaignManager, setCampaignManager] = useState<User | null>(initialCampaignManager)

  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (
      campaignName.length <= 0 ||
      campaignName.length > 50 ||
      campaignDescription.length <= 0 ||
      campaignDescription.length > 255 ||
      campaignDueDate === null ||
      campaignManager === null ||
      (!allowDueDateInPast && campaignDueDate <= new Date())
    ) {
      setValidationError('Campaign details are invalid')
    } else {
      setValidationError(null)
    }
  }, [campaignName, campaignDescription, campaignDueDate, campaignManager, allowDueDateInPast])

  const clearValidationError = useCallback(() => {
    setValidationError(null)
  }, [])

  // This is a performance optimization which ensures that the handleSubmit function does not change
  // on every render. This is important because the handleSubmit function is passed as a prop to
  // child components and we want to avoid unnecessary re-renders.
  const handleSubmitRef = useRef<() => void>(() => {})
  const handleSubmit = useCallback(() => {
    handleSubmitRef.current()
  }, [])
  useEffect(() => {
    handleSubmitRef.current = () => {
      if (validationError || campaignDueDate === null) {
        // Should not happen as validation should prevent the form from being submitted
        return
      }

      submitForm({
        name: campaignName,
        description: campaignDescription,
        endsAt: campaignDueDate.toISOString(),
        manager: campaignManager,
      })
    }
  }, [validationError, campaignDueDate, campaignName, campaignDescription, campaignManager, submitForm])

  const resetForm = useCallback(() => {
    // Reset inputs
    setCampaignName(initialCampaignName)
    setCampaignDescription(initialCampaignDescription)
    setCampaignDueDate(initialCampaignDueDate)
    setCampaignManager(initialCampaignManager)

    // Clear errors
    setValidationError(null)
    reset()
  }, [initialCampaignName, initialCampaignDescription, initialCampaignDueDate, initialCampaignManager, reset])

  const value: SecurityCampaignFormContextValue = useMemo<SecurityCampaignFormContextValue>(
    () => ({
      campaign,
      allowDueDateInPast,
      campaignName,
      setCampaignName,
      campaignDescription,
      setCampaignDescription,
      campaignDueDate,
      setCampaignDueDate,
      campaignManager,
      setCampaignManager,
      validationError,
      clearValidationError,
      handleSubmit,
      resetForm,
      isPending,
      formError,
    }),
    [
      campaign,
      allowDueDateInPast,
      campaignName,
      campaignDescription,
      campaignDueDate,
      campaignManager,
      validationError,
      clearValidationError,
      handleSubmit,
      resetForm,
      isPending,
      formError,
    ],
  )

  return <SecurityCampaignFormContext.Provider value={value}>{children}</SecurityCampaignFormContext.Provider>
}
