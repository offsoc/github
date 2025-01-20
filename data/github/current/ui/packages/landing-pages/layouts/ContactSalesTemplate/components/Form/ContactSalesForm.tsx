/* eslint filenames/match-regex: off */
import {ConsentExperience} from '@github-ui/consent-experience'
import {Box, Button, FormControl, Select, Stack, Text, TextInput, Textarea} from '@primer/react-brand'
import {Fragment, useCallback, useState} from 'react'
import {z} from 'zod'
import {contactSalesRequest} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {Octocaptcha, useOctocaptcha} from '../../../../components'
import {Flash} from '../Flash'
import {countries} from '../../data/countries'
import {useConsentExperience} from '../../hooks/useConsentExperience'
import {useForm, type FormField} from '../../hooks/useForm'
import {useParams} from '../../hooks/useParams'
import {EMAIL_PERSONAL_DOMAIN_REGEX} from '../../constants'
import type {FormFieldsAttributes} from '../../types'

export function ContactSalesForm() {
  const queryParametersMap = useParams()
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const {isConsentExperienceValid, onConsentExperienceValidationChange} = useConsentExperience()
  const {octocaptchaToken, hasOctocaptchaFailedToLoad, onOctocaptchaComplete, onOctocaptchaLoadError} = useOctocaptcha()

  const onValidationMessageClick = useCallback((field: FormField) => {
    return (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault()

      const fieldEl = document.querySelector<HTMLElement>(`[name="${field.name}"]`)

      if (fieldEl === null) {
        return
      }

      fieldEl.focus()
    }
  }, [])

  const matchWorkEmail = (email: string) => {
    return EMAIL_PERSONAL_DOMAIN_REGEX.test(email)
  }

  const consentExperienceExamplesFields = ['first name', 'last name', 'company', 'email']

  const formFieldDefinitions: FormFieldsAttributes[] = [
    {
      label: 'First Name',
      name: 'first_name',
      required: true,
      type: 'text',
    },
    {
      label: 'Last Name',
      name: 'last_name',
      required: true,
      type: 'text',
    },
    {
      label: 'Company',
      name: 'company',
      placeholder: 'e.g. Acme Inc.',
      required: true,
      type: 'text',
    },
    {
      label: 'Work Email',
      name: 'email',
      placeholder: 'e.g. name@company',
      required: true,
      type: 'email',
      validation: matchWorkEmail,
      validationError: 'Please enter a valid work email address.',
    },
    {
      label: 'Phone Number',
      name: 'phone',
      placeholder: 'If you want us to call you',
      required: false,
      type: 'text',
    },
    {
      label: 'Message',
      name: 'request_details',
      placeholder: 'Describe your project, needs, and timeline',
      required: false,
      type: 'text',
    },
    {
      label: 'Country',
      name: 'country',
      required: true,
      type: 'country',
    },
  ]

  const {fields, formState, handleSubmit, register, getFormValues} = useForm()

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isConsentExperienceValid || (!octocaptchaToken && !hasOctocaptchaFailedToLoad)) return

    const formData = new FormData(event.currentTarget)
    const marketingEmailOptinForm = formData.get('marketing_email_opt_in')

    const result = await verifiedFetchJSON(contactSalesRequest(), {
      method: 'POST',
      body: {
        contact_sales_request: {
          // 'marketing_email_opt_in' needs to have a default value to submit to the controller
          marketing_email_opt_in: marketingEmailOptinForm ?? false,
          ...getFormValues(),
          ...queryParametersMap,
        },
        ['octocaptcha-token']: octocaptchaToken,
      },
    })

    if (result.ok) {
      window.location.href = `/enterprise/contact/thanks`
    } else {
      setErrorMessage('We were unable to submit the form. Please try again.')
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(event => {
        handleSubmitForm(event)
      })}
    >
      <Stack direction="vertical" padding="none" gap={24}>
        <Stack gap={8} className="pb-3" padding="none">
          <Text as="p" size="100">
            All fields marked with an asterisk (*) are required.
          </Text>
        </Stack>

        {formFieldDefinitions.map(definition => {
          /**
           * The field may be undefined for a little while until the field is registered.
           */
          const maybeField = fields[definition.name]

          if (definition.type === 'country') {
            return (
              <FormControl
                key={definition.name}
                id="country"
                validationStatus={maybeField?.validationStatus}
                fullWidth
                required={definition.required}
              >
                <FormControl.Label>{definition.label}</FormControl.Label>

                <Select {...register('country', {label: definition.label, schema: z.string().min(1)})}>
                  <Select.Option value="" disabled>
                    Choose your country
                  </Select.Option>

                  {countries.map(country => (
                    <Select.Option key={country.value} value={country.value}>
                      {country.label}
                    </Select.Option>
                  ))}
                </Select>

                {maybeField?.validationStatus === 'error' ? (
                  <FormControl.Validation>{maybeField.error}</FormControl.Validation>
                ) : (
                  <></>
                )}
              </FormControl>
            )
          }

          if (definition.name === 'request_details') {
            return (
              <FormControl
                key={definition.name}
                validationStatus={maybeField?.validationStatus}
                fullWidth
                required={definition.required}
              >
                <FormControl.Label>{definition.label}</FormControl.Label>

                <Textarea
                  {...register(definition.name, {label: definition.label, schema: z.string().optional()})}
                  placeholder={definition.placeholder}
                />

                {maybeField?.validationStatus === 'error' ? (
                  <FormControl.Validation>{maybeField.error}</FormControl.Validation>
                ) : (
                  <></>
                )}
              </FormControl>
            )
          }

          let validationSchema: z.ZodTypeAny

          switch (definition.type) {
            case 'number':
            case 'text':
              validationSchema = definition.required ? z.string().min(1) : z.string().optional()
              break
            case 'email':
              validationSchema = definition.required ? z.string().email().min(1) : z.string().email().optional()

              if (definition.validation) {
                validationSchema = validationSchema.refine(definition.validation, definition.validationError)
              }
              break
            default:
              validationSchema = z.any()
          }

          return (
            <FormControl
              key={definition.name}
              validationStatus={maybeField?.validationStatus}
              fullWidth
              required={definition.required}
            >
              <FormControl.Label>{definition.label}</FormControl.Label>

              <TextInput
                {...register(definition.name, {label: definition.label, schema: validationSchema})}
                placeholder={definition.placeholder}
                type={definition.type}
              />

              {maybeField?.validationStatus === 'error' ? (
                <FormControl.Validation>{maybeField.error}</FormControl.Validation>
              ) : (
                <></>
              )}
            </FormControl>
          )
        })}

        <Stack direction="vertical" gap="condensed" padding="none">
          <ConsentExperience
            countryFieldSelector="#country"
            emailSubscriptionSettingsLinkHref="/settings/emails/subscriptions/link-request/new"
            exampleFields={consentExperienceExamplesFields}
            fieldName="marketing_email_opt_in"
            fieldValue="optInExplicit"
            formControlClass="ContactSales__Consent Links--underline"
            noticeClass="ContactSales__Notice"
            onValidationChange={onConsentExperienceValidationChange}
            onlySendIfChecked={true}
            privacyStatementHref="https://docs.github.com/articles/github-privacy-statement"
          />

          {!isConsentExperienceValid && (
            <FormControl.Validation validationStatus="error">
              You need to accept the required checkboxes to continue.
            </FormControl.Validation>
          )}
        </Stack>

        <FormControl required>
          <FormControl.Label>Verify you&apos;re not a robot</FormControl.Label>

          <Octocaptcha
            originPage="marketing_forms"
            onComplete={onOctocaptchaComplete}
            onLoadError={onOctocaptchaLoadError}
          />
        </FormControl>

        {Object.entries(queryParametersMap).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value ?? 'undefined'} />
        ))}

        <Box marginBlockStart={16}>
          <Button variant="primary" type="submit" block>
            Contact Sales
          </Button>
        </Box>

        {formState.hasErrors && (
          <Flash variant="error">
            <Text as="p" weight="semibold" size="200">
              The following inputs have errors:
            </Text>

            <Text as="p" size="200">
              {Object.values<FormField>(fields)
                .filter(field => field.validationStatus === 'error')
                .map((field, index, collection) => {
                  const isLastElement = index === collection.length - 1

                  return (
                    <Fragment key={field.name}>
                      <a
                        href={`#${field.name}`}
                        style={{color: 'currentColor', textDecoration: 'underline'}}
                        onClick={onValidationMessageClick(field)}
                      >
                        {field.label ?? field.name}
                      </a>

                      {!isLastElement && ', '}
                    </Fragment>
                  )
                })}
            </Text>
          </Flash>
        )}

        {errorMessage && (
          <Flash variant="error">
            <Text as="p" weight="semibold" size="200">
              {errorMessage}
            </Text>
          </Flash>
        )}
      </Stack>
    </form>
  )
}
