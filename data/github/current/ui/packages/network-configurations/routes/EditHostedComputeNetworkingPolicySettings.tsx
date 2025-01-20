import {Box, Button, Flash, FormControl, Heading, PageLayout, Radio, RadioGroup} from '@primer/react'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useState} from 'react'
import {useCSRFToken} from '@github-ui/use-csrf-token'
import {DisableHostedComputeNetworkingDialog} from '../components/DisableHostedComputeNetworkingDialog'
import {verifiedFetch} from '@github-ui/verified-fetch'

type FlashVariant = 'default' | 'warning' | 'success' | 'danger'

export interface IHostedComputeNetworkingPolicySettingsPayload {
  orgsCanCreateNetworkConfigurations: boolean
  updatePath: string
  updateMethod: string
}

export function EditHostedComputeNetworkingPolicySettings() {
  const payload = useRoutePayload<IHostedComputeNetworkingPolicySettingsPayload>()
  const [orgsCanCreate, setOrgsCanCreate] = useState<boolean>(payload.orgsCanCreateNetworkConfigurations)
  const csrf = useCSRFToken(payload.updatePath, payload.updateMethod)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [resultBannerText, setResultBannerText] = useState('')
  const [resultBannerVariant, setResultBannerVariant] = useState<FlashVariant>('default')

  const [canCreateEnabled, canCreateDisabled] = ['true', 'false']
  const onCanCreateChange = (selectedValue: string | null) => {
    setOrgsCanCreate(selectedValue === canCreateEnabled)
  }

  const handleSubmit = () => {
    if (orgsCanCreate) {
      updatePermission(true)
    } else {
      setShowDisableDialog(true)
    }
  }

  const updatePermission = async (canCreate: boolean) => {
    setResultBannerText('')
    setResultBannerVariant('default')

    const formData = new FormData()
    // eslint-disable-next-line github/authenticity-token
    formData.append('authenticity_token', csrf ?? '')
    formData.append('orgsCanCreateNetworkConfigurations', canCreate.toString())

    const response = await verifiedFetch(payload.updatePath, {
      method: payload.updateMethod.toUpperCase(),
      body: formData,
    })
    if (response.ok) {
      setResultBannerText('Your GitHub hosted compute networking policy has been updated.')
      setResultBannerVariant('default')
    } else {
      setResultBannerText('Failed to update your GitHub hosted compute networking policy.')
      setResultBannerVariant('danger')
    }
  }

  const orgsCanCreateLabelId = 'OrgCreationLabelId'

  return (
    <PageLayout containerWidth="full" padding="none" sx={{p: 0}}>
      <PageLayout.Header>
        <div className="border-bottom">
          <Heading as="h2" className="h2 text-normal mb-2">
            {NetworkConfigurationConsts.hostedComputeNetworkingTitle}
          </Heading>
        </div>
      </PageLayout.Header>
      <PageLayout.Content as="div">
        {resultBannerText && (
          <div className="pb-4">
            <Flash variant={resultBannerVariant}>{resultBannerText}</Flash>
          </div>
        )}
        <form aria-labelledby={orgsCanCreateLabelId}>
          <Box sx={{display: 'grid', pb: 3}}>
            <RadioGroup name="orgsCanCreateNetworkConfigurations" onChange={onCanCreateChange}>
              <RadioGroup.Label sx={{pb: 3}}>
                <Heading as="h3" className="h3 text-normal" id={orgsCanCreateLabelId}>
                  Manage creation of network configurations for organizations
                </Heading>
              </RadioGroup.Label>
              <FormControl>
                <Radio value={canCreateEnabled} defaultChecked={orgsCanCreate} data-testid="orgsCanCreate" />
                <FormControl.Label sx={{pb: 1}}>Enabled</FormControl.Label>
                <FormControl.Caption>
                  Organization owners are allowed to create their own network configurations in their organizations.
                </FormControl.Caption>
              </FormControl>
              <FormControl>
                <Radio value={canCreateDisabled} defaultChecked={!orgsCanCreate} data-testid="orgsCannotCreate" />
                <FormControl.Label sx={{pb: 1}}>Disabled</FormControl.Label>
                <FormControl.Caption>
                  Organization owners cannot create their own network configurations and are restricted to using
                  configurations created by the enterprise.
                </FormControl.Caption>
              </FormControl>
            </RadioGroup>
          </Box>
          <Button type="button" onClick={handleSubmit}>
            Save
          </Button>
        </form>
        {showDisableDialog && (
          <DisableHostedComputeNetworkingDialog
            setShowDisableDialog={setShowDisableDialog}
            updatePath={payload.updatePath}
            updateMethod={payload.updateMethod}
            updatePermission={updatePermission}
          />
        )}
      </PageLayout.Content>
    </PageLayout>
  )
}
