import type {GeneralConsentLanguageProps} from './ConsentLanguage'

const copy = {
  preamble:
    'Yes, please, I’d like to hear from GitHub and its family of companies via email for personalized communications, targeted advertising, and campaign effectiveness. To withdraw consent or manage your contact preferences, visit the',
  preambleWithPhone:
    'Yes, please, I’d like to hear from GitHub and its family of companies via email and phone for personalized communications, targeted advertising, and campaign effectiveness. To withdraw consent or manage your contact preferences, visit the',
  privacyStatementText: 'GitHub Privacy Statement',
  settingsLinkText: 'Promotional Communications Manager',
}

export default function Canada({
  fieldName,
  hasPhone = false,
  labelClass,
  formControlClass,
  privacyStatementHref,
  emailSubscriptionSettingsLinkHref,
  children,
}: GeneralConsentLanguageProps) {
  return (
    <div className={formControlClass}>
      <label htmlFor={fieldName} className={labelClass} data-testid="label">
        {children}
        <p>
          {hasPhone ? copy.preambleWithPhone : copy.preamble}{' '}
          <a href={emailSubscriptionSettingsLinkHref}>{copy.settingsLinkText}</a>.{' '}
          <a href={privacyStatementHref}>{copy.privacyStatementText}</a>.
        </p>
      </label>
    </div>
  )
}
