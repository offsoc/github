import {testIdProps} from '@github-ui/test-id-props'
import {Button} from '@primer/react'

import {BlankslateErrorMessage} from '../../../components/error-boundaries/blankslate-error-message'

const clickHandler = () => {
  window.location.reload()
}

export const SettingsErrorFallback: React.FC = () => {
  return (
    <BlankslateErrorMessage
      as="main"
      headingAs="h2"
      heading="This page failed to load"
      content="Sorry about that. Please try refreshing and contact us if the problem persists."
      {...testIdProps('project-settings-error-fallback')}
    >
      <Button variant="primary" onClick={clickHandler} sx={{mt: 2, mx: 'auto'}}>
        Reload
      </Button>
    </BlankslateErrorMessage>
  )
}
