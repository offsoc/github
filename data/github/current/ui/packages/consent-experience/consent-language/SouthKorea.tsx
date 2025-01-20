import {useEffect, useState} from 'react'
import type {GeneralConsentLanguageProps} from './ConsentLanguage'

const copy = {
  privacyStatementText: 'GitHub Privacy Statement',
}

export default function SouthKorea({
  fieldName,
  exampleFields = [],
  formControlClass,
  noticeClass,
  privacyStatementHref,
  children,
  onValidationChange,
}: GeneralConsentLanguageProps) {
  const fields = exampleFields.join(', ')

  /**
   * Since South Korea requires explicit acceptance of the primary consent, we use false as the default value.
   */
  const [isPrimaryConsentAccepted, setPrimaryConsentAcceptance] = useState(false)

  const onPrimaryConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryConsentAcceptance(event.target.checked)
  }

  /**
   * We call `onValidationChange` with `false` as the component mounts, and
   * then again whenever the primary consent changes.
   */
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isPrimaryConsentAccepted)
    }
  }, [onValidationChange, isPrimaryConsentAccepted])

  return (
    <>
      <div className={formControlClass}>
        <label htmlFor="south-korea-primary-consent" className="text-normal">
          <input
            type="checkbox"
            id="south-korea-primary-consent"
            checked={isPrimaryConsentAccepted}
            onChange={onPrimaryConsentChange}
            required
          />

          <p>I agree to the collection and use of my personal information (required)*:</p>

          <ul className="my-2">
            <li>Items of Personal Information to be Collected: {fields}, and any other fields visible on this form.</li>
            <li>Purpose of Collection and Use: GitHub will use the data for the purpose described on this form.</li>
            <li>
              Retention/Use Period of Personal Information:{' '}
              <span className="text-bold f3">As long as needed to provide the service(s) you are requesting</span>
            </li>
          </ul>
        </label>
      </div>

      <div className={formControlClass}>
        <label htmlFor={fieldName} data-testid="label">
          {children}
          <div className="text-normal">
            <p>
              I agree to receiving marketing information and use of my personal information for marketing purposes
              (optional):
            </p>
            <ul className="my-2">
              <li className="text-normal">
                <span className="text-bold f3">Consent to Receive Marketing:</span> The information collected may be
                used for GitHub for personalized communications, targeted advertising and campaign effectiveness.
              </li>
              <li className="text-normal">
                Items of Personal Information to be Collected: {fields}, and any other fields visible on this form.
              </li>
              <li className="text-normal">
                Purpose of Collection and Use:{' '}
                <span className="text-bold f3">To contact you for marketing purposes.</span>
              </li>
              <li className="text-normal">
                Retention/Use Period of Personal Information:{' '}
                <span className="text-bold f3">As long as needed to provide the service(s) you are requesting.</span>
              </li>
            </ul>
          </div>
        </label>
      </div>

      <p className={noticeClass}>
        You have the right to refuse the collection and use of your personal information, use of personal information
        for marketing purposes, and receiving marketing information as set forth above. However, if you refuse, you may
        not be able to receive the benefits described under Purpose of Collection & Use.{' '}
        <a href={privacyStatementHref}>{copy.privacyStatementText}</a>.
      </p>
    </>
  )
}
