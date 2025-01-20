import {useState} from 'react'
import {useNavigateWithFlashBanner} from '../NavigateWithFlashBanner'
import type {FormErrorResponse, FormErrors, FormSuccessResponse, FormValues} from './types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

interface Props {
  createPath: string
  pipelineId?: string
}

interface UseForm {
  formErrors: FormErrors
  handleSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
}

export function useForm({createPath, pipelineId}: Props): UseForm {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const {navigate} = useNavigateWithFlashBanner()

  // There are three ways this form is submitted
  // 1. Training on all repos. repository_nwos is an empty array
  // 2. Training on selected repos. repository_nwos is an array of name-with-orgs (nwos)
  // 3. Special case when Editing an existing Pipeline Request, if the user wants to train on the previously selected
  // list of nwos, then repository_nwos is null
  async function handleSubmit(values: FormValues) {
    if (isSubmitting) return

    setIsSubmitting(true)

    const body = {...values, pipeline_id: pipelineId}
    const response = await verifiedFetchJSON(createPath, {method: 'POST', body})

    if (response.ok) {
      const {payload} = (await response.json()) as FormSuccessResponse
      const message = pipelineId
        ? 'Custom model was edited. Started update of custom model.'
        : 'Created new custom model for this organization.'
      navigate(payload.redirect_url, {message, variant: 'default'})
    } else if (response.status === 422) {
      const {errors} = (await response.json()) as FormErrorResponse
      setFormErrors(errors)
      setIsSubmitting(false)
    } else {
      setFormErrors({
        general_errors: [
          {
            heading: 'Something went wrong',
            message: 'Please try again later or contact support if the problem persists.',
          },
        ],
      })
      setIsSubmitting(false)
    }
  }

  return {formErrors, handleSubmit, isSubmitting}
}
