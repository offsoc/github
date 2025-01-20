import {Box, Text, Button} from '@primer/react'
import {useEffect, useState} from 'react'
import type {ExemptionRequest, UpdateStatus} from '../delegated-bypass-types'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useSearchParams} from '@github-ui/use-navigate'
import {updateExemptionRequest} from '../services/api'
import {useDelegatedBypassSetBanner} from '../contexts/DelegatedBypassBannerContext'
import {useRequestTypeContext} from '../contexts/RequestTypeContext'
import {componentRegistry} from './RequestForm'
import {UpdateState} from '../helpers/constants'
import {updateBanner} from '../helpers/banner'

export function RequestReviewerForm({request}: {request: ExemptionRequest}) {
  const {requester, requesterComment} = request
  const [updateState, setUpdateState] = useState<UpdateState>(UpdateState.Initial)
  const [status, setStatus] = useState<UpdateStatus>()
  const [, setSearchParams] = useSearchParams()
  const setBanner = useDelegatedBypassSetBanner()
  const requestType = useRequestTypeContext()

  const {FormControls} = componentRegistry[requestType]

  useEffect(() => {
    updateBanner(updateState, setBanner, setSearchParams, 'submitted', 'submitting')
  }, [updateState, setBanner, setSearchParams])

  return (
    <Box sx={{mt: 4}} className="Box">
      <Box
        sx={{
          m: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Text sx={{fontSize: 2, fontWeight: 'bold', mb: 1}}>Approve bypass request</Text>
        <span>
          As an approver, you may allow <b>{requester.login}</b> to bypass these push protections
          {requestType === 'secret_scanning' && ' and expose any detected secrets.'}
        </span>
      </Box>
      <Box
        sx={{
          m: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Text sx={{fontSize: 2, fontWeight: 'bold', mb: 1}}>Comment from {requester.login}</Text>
        <Box
          sx={{
            p: 3,
            my: 3,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'mono',
            fontSize: 12,
            backgroundColor: 'canvas.subtle',
          }}
          className="Box"
        >
          <span>{requesterComment}</span>
        </Box>
        {FormControls ? <FormControls /> : null}
      </Box>
      <Box
        sx={{m: 4}}
        as="form"
        method="put"
        action={ssrSafeLocation.pathname}
        noValidate
        onSubmit={async e => {
          setUpdateState(UpdateState.Submitting)
          e.preventDefault()
          const response = await updateExemptionRequest(ssrSafeLocation.pathname, {status})
          if (response.statusCode === 201) {
            setUpdateState(UpdateState.Success)
          } else {
            setUpdateState(UpdateState.Error)
          }
        }}
      >
        <Box sx={{display: 'flex', mt: 4, gap: 3}}>
          <Button
            type="submit"
            sx={{height: 40, color: 'danger.fg', flex: 1}}
            disabled={updateState === UpdateState.Submitting}
            onClick={() => setStatus('reject')}
          >
            Deny bypass request
          </Button>
          <Button
            type="submit"
            sx={{height: 40, flex: 1}}
            disabled={updateState === UpdateState.Submitting}
            onClick={() => setStatus('approve')}
          >
            Approve bypass request
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
