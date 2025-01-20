import {Link, Text} from '@primer/react'
import {useRef, useState} from 'react'
import {FeedbackDialog} from './FeedbackDialog'
import {useNavigate} from '@github-ui/use-navigate'
import {useLocation} from 'react-router-dom'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {GettingStartedPayload} from './types'

export const ModelLegalTerms = () => {
  const {isLoggedIn} = useRoutePayload<GettingStartedPayload>()

  const productTermsLink = 'https://www.microsoft.com/licensing/terms/productoffering/MicrosoftAzure/MCA'
  const privacyStatementLink = 'https://www.microsoft.com/licensing/terms/product/PrivacyandSecurityTerms/MCA'
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const returnFocusRef = useRef(null)
  const navigate = useNavigate()
  const currentUrl = useLocation().pathname
  const handleClick = () => {
    if (isLoggedIn) {
      setIsFeedbackDialogOpen(true)
    } else {
      navigate(`/login?return_to=${encodeURIComponent(currentUrl)}`)
    }
  }
  return (
    <>
      <Text sx={{color: 'fg.muted', fontSize: 0}}>
        Azure hosted. AI powered, can make mistakes.{' '}
        <Link as="button" ref={returnFocusRef} onClick={handleClick} inline muted>
          Share feedback
        </Link>
        . Subject to{' '}
        <Link href={productTermsLink} inline muted>
          Product Terms
        </Link>{' '}
        &{' '}
        <Link href={privacyStatementLink} inline muted>
          Privacy Statement
        </Link>
        . Not intended for production/sensitive data.
      </Text>
      {isFeedbackDialogOpen && (
        <FeedbackDialog
          returnFocusRef={returnFocusRef}
          isFeedbackDialogOpen={isFeedbackDialogOpen}
          setIsFeedbackDialogOpen={setIsFeedbackDialogOpen}
        />
      )}
    </>
  )
}
