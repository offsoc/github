import {useEffect, useState} from 'react'
import ConsentLanguage from './consent-language/ConsentLanguage'

export interface ConsentExperienceProps {
  fieldName: string
  countryFieldSelector: string
  privacyStatementHref: string
  emailSubscriptionSettingsLinkHref: string
  hasPhone?: boolean
  /**
   * List of fields that will be used as examples in the consent language for South Korea. For example, if the form
   * contains a field for the user's first name, last name, and email address, you may pass
   * in `['first name', 'last name', 'email']`.
   */
  exampleFields: string[]
  /**
   * Classes to be applied to the label around the form elements. Not applied to South Korea due to specific styling
   * requirements for that country.
   */
  labelClass?: string
  /**
   * Classes to be applied to the wrapper around the form elements
   */
  formControlClass?: string
  /**
   * Classes to be applied to the notice that appears below the form elements
   */
  noticeClass?: string
  /**
   * Optional callback that will be called if the consent experience changes their validation state.
   * Some countries require additional explicit consent for the privacy statement (e.g. South Korea).
   *
   * This is helpful to validate the form programmatically before submission from the parent component.
   */
  onValidationChange?: (isValid: boolean) => void
  /**
   * The value for the marketing consent field. Defaults to `1`.
   */
  fieldValue?: string
  /**
   * If true, the field will only be sent if the checkbox is checked. Defaults to `false`.
   */
  onlySendIfChecked?: boolean
}

export function ConsentExperience({
  countryFieldSelector,
  fieldName,
  fieldValue = '1',
  onlySendIfChecked = false,
  onValidationChange,
  ...passThruProps
}: ConsentExperienceProps) {
  const [country, setCountry] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)

  /**
   * Unless the underlying ConsentLanguage component says otherwise, we assume
   * the consent experience is valid by default.
   */
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(true)
    }
  }, [onValidationChange])

  useEffect(() => {
    const countryField = document.querySelector(countryFieldSelector) as HTMLSelectElement

    if (countryField) {
      const handleChange = (event: Event): void => {
        /**
         * Unless the new rendered ConsentLanguage component says otherwise, we assume
         * the consent experience is valid when the country changes.
         */
        if (onValidationChange) {
          onValidationChange(true)
        }

        setCountry((event.currentTarget as HTMLSelectElement).value)
        setConsentChecked(false)
      }

      countryField.addEventListener('change', handleChange)

      return () => {
        countryField.removeEventListener('change', handleChange)
      }
    }
  }, [onValidationChange, countryFieldSelector])

  return (
    <div data-testid="consent-experience">
      <ConsentLanguage
        fieldName={fieldName}
        country={country}
        onValidationChange={onValidationChange}
        {...passThruProps}
      >
        {!onlySendIfChecked && <input type="hidden" name={fieldName} value="0" data-testid="hidden-consent" />}

        <input
          type="checkbox"
          name={fieldName}
          value={fieldValue}
          id={fieldName}
          className="form-control"
          checked={consentChecked}
          onChange={() => setConsentChecked(!consentChecked)}
        />
      </ConsentLanguage>
    </div>
  )
}
