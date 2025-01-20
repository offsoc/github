import {testIdProps} from '@github-ui/test-id-props'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {Box, Button, Heading, useConfirm} from '@primer/react'
import {useCallback, useState} from 'react'

import {apiMemexWithoutLimitsBetaOptout} from '../../../api/memex/api-post-beta-optout'
import useToasts, {ToastType} from '../../../components/toasts/use-toasts'
import {Resources} from '../../../strings'
import {ProjectSettingsCard, ProjectSettingsCardBody, ProjectSettingsCardHeader} from './project-settings-card'

export function BetaOptoutSettingsCard() {
  const {addToast} = useToasts()
  const addToastRef = useTrackingRef(addToast)
  const [betaOptoutSucceeded, setBetaOptoutSucceeded] = useState<boolean | undefined>(undefined)

  const confirm = useConfirm()

  const confirmOptout = useCallback(async () => {
    return await confirm({
      ...Resources.betaOptoutConfirmation,
      confirmButtonType: 'danger',
    })
  }, [confirm])

  const postBetaOptout = useCallback(async () => {
    if (!(await confirmOptout())) {
      return
    }
    try {
      const response = await apiMemexWithoutLimitsBetaOptout()
      setBetaOptoutSucceeded(response.success)
      addToastRef.current({
        message: Resources.betaOptoutSuccessMessage,
        type: ToastType.success,
      })
    } catch (error) {
      setBetaOptoutSucceeded(false)
      addToastRef.current({
        message: Resources.betaOptoutFailureMessage,
        type: ToastType.error,
      })
    }
  }, [addToastRef, confirmOptout])

  return (
    <>
      <Heading
        as="h2"
        sx={{
          borderBottomColor: 'border.muted',
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          fontSize: 4,
          fontWeight: 'normal',
          pb: 2,
          mb: 2,
        }}
      >
        Increased project items beta
      </Heading>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderColor: 'border.default',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: 2,
          mb: 4,
        }}
      >
        <ProjectSettingsCard>
          <ProjectSettingsCardHeader
            title="Opt out of increased project items"
            description={Resources.betaOptoutInformation}
          />
          <ProjectSettingsCardBody>
            <Button
              {...testIdProps('beta-optout-button')}
              key="settingsBetaOptoutButton"
              variant="default"
              sx={{
                color: 'fg.default',
                textAlign: 'left',
                '&& [data-component="buttonContent"]': {
                  flex: 0,
                },
              }}
              block
              onClick={postBetaOptout}
              disabled={betaOptoutSucceeded === true}
            >
              Opt out
            </Button>
          </ProjectSettingsCardBody>
        </ProjectSettingsCard>
      </Box>
    </>
  )
}
