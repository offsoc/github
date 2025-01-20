import type {GeneralConsentLanguageProps} from './ConsentLanguage'

const copy = {
  preamble:
    'Yes please, I’d like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness. See the',
  privacyStatementText: 'GitHub Privacy Statement',
  postamble: 'for more details.',
}

export default function Default({
  fieldName,
  labelClass,
  formControlClass,
  privacyStatementHref,
  children,
}: GeneralConsentLanguageProps) {
  return (
    <div className={formControlClass}>
      <label htmlFor={fieldName} className={labelClass} data-testid="label">
        {children}
        <p>
          {copy.preamble} <a href={privacyStatementHref}>{copy.privacyStatementText}</a> {copy.postamble}
        </p>
      </label>
    </div>
  )
}
