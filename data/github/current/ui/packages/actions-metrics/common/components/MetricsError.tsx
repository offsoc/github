import {AlertIcon, XIcon} from '@primer/octicons-react'
import {Flash, IconButton} from '@primer/react'
import {Observer} from '../observables/Observer'
import {Services} from '../services/services'
import type {ErrorMessage, IErrorService} from '../services/error-service'
import {LABELS} from '../resources/labels'

export const MetricsError = () => {
  const errorService = Services.get<IErrorService>('IErrorService')
  return (
    <Observer errorMessages={errorService.getMessagesToDisplay()}>
      {(obs: {errorMessages: ErrorMessage[]}) => {
        return <>{obs.errorMessages.map(em => MetricsErrorFlash(em))}</>
      }}
    </Observer>
  )
}

const MetricsErrorFlash = (error: ErrorMessage) => {
  const errorService = Services.get<IErrorService>('IErrorService')

  return (
    <Flash variant={'danger'} key={error.id} sx={{mb: 3}}>
      <div className="d-flex flex-items-center">
        <div>
          <AlertIcon size={'small'} />
        </div>
        <div className="flex-1">
          <span>{error.message}</span>
        </div>
        <div>
          <IconButton
            aria-label={LABELS.close}
            icon={XIcon}
            size="small"
            onClick={() => errorService.removeMessageToDisplay(error.id)}
            variant="invisible"
            sx={{pl: 2}}
          />
        </div>
      </div>
    </Flash>
  )
}
