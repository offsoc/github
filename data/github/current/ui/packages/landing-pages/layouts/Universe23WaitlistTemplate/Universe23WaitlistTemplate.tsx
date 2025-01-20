import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS, INLINES} from '@contentful/rich-text-types'
import {ConsentExperience} from '@github-ui/consent-experience'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  Heading,
  InlineLink,
  Label,
  Link,
  OrderedList,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeProvider,
  UnorderedList,
} from '@primer/react-brand'
import {Fragment, useCallback, useEffect, useState} from 'react'
import {z} from 'zod'

import {Octocaptcha, useOctocaptcha} from '../../components'
import type {Universe23WaitlistPage} from '../../lib/types/contentful'
import type {ArrayElement} from '../../lib/types/utils'
import {Flash} from './components/Flash'
import {ThankYou} from './components/ThankYou'
import {UniverseBackground} from './components/UniverseBackground'
import {countries} from './data/countries'
import {useConsentExperience} from './hooks/useConsentExperience'
import {useForm, type FormField} from './hooks/useForm'

type FormFieldDefinition = {
  label: string
  name: string
  type: 'text' | 'number' | 'country' | 'email'
  placeholder?: string
  required?: boolean
}

export type Universe23WaitlistTemplateProps = {
  page: Universe23WaitlistPage
  userLoggedIn?: boolean
}

export function Universe23WaitlistTemplate({page, userLoggedIn}: Universe23WaitlistTemplateProps) {
  const {
    fields: {template},
  } = page

  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const [formRedirectionUrl, setFormRedirectionUrl] = useState<string | undefined>()
  useEffect(() => {
    const currentUrl = new URL(window.location.href, window.location.origin)
    currentUrl.searchParams.append('submitted', 'true')

    setFormRedirectionUrl(currentUrl.toString())
  }, [])

  useEffect(() => {
    const currentUrl = new URL(window.location.href, window.location.origin)

    setIsFormSubmitted(currentUrl.searchParams.get('submitted') === 'true')
  }, [])
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

  const formFieldDefinitions: Array<
    | FormFieldDefinition
    | NonNullable<ArrayElement<Universe23WaitlistPage['fields']['template']['fields']['additionalFormFields']>>
  > = [
    {
      label: 'First Name',
      name: 'firstName',
      required: true,
      type: 'text',
    },
    {
      label: 'Last Name',
      name: 'lastName',
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
      name: 'emailAddress',
      placeholder: 'e.g. name@company',
      required: true,
      type: 'email',
    },

    ...(template.fields.additionalFormFields ?? []),

    /**
     * To provide a cohesive experience, we need to make sure that the country field is always the last one,
     * so it renders together with the consent experience.
     */
    {
      label: 'Country',
      name: 'country',
      required: true,
      type: 'country',
    },
  ]

  const {fields, formState, handleSubmit, register} = useForm()

  return (
    <ThemeProvider
      className="Universe23Waitlist__Page position-relative"
      colorMode="dark"
      style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
    >
      <Grid fullWidth className="Universe23Waitlist__DesktopBackground">
        <UniverseBackground theme={template.fields.theme} />
        <Grid.Column span={6} start={7} className="position-relative">
          <ThemeProvider
            className="Universe23Waitlist__DesktopBackground__Right"
            colorMode={page.fields.settings?.fields.colorMode ?? 'light'}
            style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
          />
        </Grid.Column>
      </Grid>

      <Grid className="Universe23Waitlist__Content">
        <Grid.Column data-hpc span={{medium: 6}}>
          <Box
            padding={24}
            paddingBlockStart={{narrow: 64, regular: 128, wide: 48}}
            paddingBlockEnd={{narrow: 24, regular: 80}}
            marginBlockStart={{wide: 128}}
          >
            <Stack direction="vertical" gap={40} padding="none" alignItems="flex-start">
              <Stack direction="vertical" padding="none" gap={16} alignItems="flex-start">
                {template.fields.label && <Label>{template.fields.label}</Label>}

                <Heading as="h1" size="3">
                  {template.fields.headline}
                </Heading>
              </Stack>

              {template.fields.body &&
                documentToReactComponents(template.fields.body, {
                  renderNode: {
                    [BLOCKS.PARAGRAPH]: (_, children) => <Text as="p">{children}</Text>,
                    [BLOCKS.UL_LIST]: (_, children) => <UnorderedList>{children}</UnorderedList>,
                    [BLOCKS.OL_LIST]: (_, children) => <OrderedList>{children}</OrderedList>,
                    [BLOCKS.LIST_ITEM]: (_, children) => <OrderedList.Item>{children}</OrderedList.Item>,
                    [INLINES.HYPERLINK]: (node, children) => <InlineLink href={node.data.uri}>{children}</InlineLink>,
                  },
                })}
            </Stack>
          </Box>
        </Grid.Column>

        <Grid.Column span={{medium: 6}} start={{xlarge: 8}}>
          <ThemeProvider
            className="Universe23Waitlist__Content__Right"
            colorMode={page.fields.settings?.fields.colorMode ?? 'light'}
            style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
          >
            {isFormSubmitted && <ThankYou template={template} userLoggedIn={userLoggedIn} />}

            {!isFormSubmitted && (
              <Box
                padding={24}
                paddingBlockStart={{
                  narrow: 64,
                  regular: 128,
                  wide: 48,
                }}
                paddingBlockEnd={{
                  narrow: 24,
                  regular: 80,
                }}
                marginBlockStart={{
                  wide: 128,
                }}
              >
                <form
                  action="https://s88570519.t.eloqua.com/e/f2"
                  method="get"
                  noValidate
                  onSubmit={handleSubmit(event => {
                    if (!isConsentExperienceValid || (!octocaptchaToken && !hasOctocaptchaFailedToLoad)) {
                      event.preventDefault()
                    }
                  })}
                >
                  <Stack direction="vertical" padding="none" gap={24}>
                    {!userLoggedIn && template.fields.signInBanner ? (
                      <Box
                        backgroundColor="overlay"
                        borderColor="default"
                        borderRadius="medium"
                        borderStyle="solid"
                        borderWidth="thin"
                        padding="condensed"
                      >
                        {documentToReactComponents(template.fields.signInBanner, {
                          renderNode: {
                            [BLOCKS.PARAGRAPH]: (_, children) => <Text as="p">{children}</Text>,
                            [INLINES.HYPERLINK]: (node, children) => (
                              <Link className="mt-2" href={node.data.uri}>
                                {children}
                              </Link>
                            ),
                          },
                        })}
                      </Box>
                    ) : null}
                    <Box marginBlockEnd={16}>
                      <Text as="p" size="100">
                        All fields marked with an asterisk (*) are required.
                      </Text>
                    </Box>

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

                      if (definition.type === 'radios') {
                        return (
                          <Stack key={definition.name} direction="vertical" padding="none" gap={8}>
                            <Text as="p" size="100" weight="semibold">
                              {definition.label}
                              {definition.required && ' *'}
                            </Text>

                            {Object.entries(definition.options).map(([value, label]) => {
                              return (
                                <FormControl key={value} required={definition.required} fullWidth>
                                  <FormControl.Label>{label}</FormControl.Label>

                                  <Radio
                                    {...register(definition.name, {
                                      label: definition.label,
                                      schema: definition.required ? z.string().min(1) : z.string().optional(),
                                    })}
                                    value={value}
                                  />
                                </FormControl>
                              )
                            })}

                            {maybeField?.validationStatus === 'error' && (
                              <FormControl.Validation validationStatus="error">
                                {maybeField.error}
                              </FormControl.Validation>
                            )}
                          </Stack>
                        )
                      }

                      if (definition.type === 'checkboxes') {
                        return (
                          <Stack key={definition.name} direction="vertical" padding="none" gap={8}>
                            <Text as="p" size="100" weight="semibold">
                              {definition.label}
                              {definition.required && ' *'}
                            </Text>

                            {Object.entries(definition.options).map(([value, label]) => {
                              return (
                                <FormControl key={value} required={definition.required} fullWidth>
                                  <FormControl.Label>{label}</FormControl.Label>

                                  <Checkbox
                                    {...register(definition.name, {
                                      isCheckboxGroup: true,
                                      label: definition.label,
                                      schema: definition.required
                                        ? z.array(z.string()).min(1)
                                        : z.array(z.string()).optional(),
                                    })}
                                    value={value}
                                  />
                                </FormControl>
                              )
                            })}

                            {maybeField?.validationStatus === 'error' && (
                              <FormControl.Validation validationStatus="error">
                                {maybeField.error}
                              </FormControl.Validation>
                            )}
                          </Stack>
                        )
                      }

                      let validationSchema: z.ZodTypeAny

                      switch (definition.type) {
                        case 'number':
                        case 'text':
                          validationSchema = definition.required ? z.string().min(1) : z.string().optional()
                          break
                        case 'email':
                          validationSchema = definition.required
                            ? z.string().email().min(1)
                            : z.string().email().optional()
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
                        exampleFields={['first name', 'last name', 'email']}
                        fieldName="marketingEmailOptIn1"
                        fieldValue="optInExplicit"
                        formControlClass="Universe23Waitlist__Consent"
                        noticeClass="Universe23Waitlist__Notice"
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

                    {Object.entries(template.fields.hiddenFormFields ?? {}).map(([name, value]) => (
                      <input key={name} type="hidden" name={name} value={value} />
                    ))}

                    <input type="hidden" name="elqFormName" value={template.fields.formName} />
                    <input type="hidden" name="elqSiteId" defaultValue="88570519" />
                    <input type="hidden" name="redirect_url" value={formRedirectionUrl} />

                    <Box marginBlockStart={16}>
                      <Button variant="primary" type="submit" block>
                        Join waitlist
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
                  </Stack>
                </form>
              </Box>
            )}
          </ThemeProvider>
        </Grid.Column>
      </Grid>
    </ThemeProvider>
  )
}
