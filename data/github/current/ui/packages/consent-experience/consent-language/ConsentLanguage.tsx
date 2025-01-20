import Canada from './Canada'
import China from './China'
import Default from './Default'
import SouthKorea from './SouthKorea'

type ConsentLanguageProps = GeneralConsentLanguageProps & {
  country: string
}

export interface GeneralConsentLanguageProps {
  fieldName: string
  privacyStatementHref: string
  emailSubscriptionSettingsLinkHref: string
  hasPhone?: boolean
  exampleFields?: string[]
  labelClass?: string
  formControlClass?: string
  noticeClass?: string
  children: React.ReactNode
  onValidationChange?: (isValid: boolean) => void
}

function ConsentLanguage({country, children, ...props}: ConsentLanguageProps) {
  const Component = getComponent(country)

  return <Component {...props}>{children}</Component>
}

function getComponent(country: string): React.FC<GeneralConsentLanguageProps> {
  switch (country) {
    case 'KR':
      return SouthKorea
    case 'CA':
      return Canada
    case 'CN':
      return China
    default:
      return Default
  }
}

export default ConsentLanguage
