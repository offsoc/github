import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Button, Flash, FormControl, Heading, Text, TextInput} from '@primer/react'
import {OrganizationIcon, StopIcon, XIcon} from '@primer/octicons-react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {enterprisePath, fullUrl} from '@github-ui/paths'
import {useState, useCallback, useMemo} from 'react'
import {Link} from '@github-ui/react-core/link'
import sudo from '@github-ui/sudo'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {BorderBox} from '../components/BorderBox'
import {HierarchicalOrgCard} from '../components/HierarchicalOrgCard'
import {OrganizationNameMessage} from '../components/OrganizationNameMessage'
import type {OrgNameStatus} from '../types'
import {useClickAnalytics} from '@github-ui/use-analytics'

export interface OnboardingOrganizationsPayload {
  business: {
    name: string
    slug: string
    avatar_url: string
  }
}

export function OnboardingOrganizations() {
  const navigate = useNavigate()
  const [orgName, setOrgName] = useState('')
  const payload = useRoutePayload<OnboardingOrganizationsPayload>()
  const {business} = payload
  const [orgNameStatus, setOrgNameStatus] = useState<OrgNameStatus | Record<string, never>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const enterpriseBasePath = enterprisePath({slug: business.slug})
  const gettingStartedPath = `${enterpriseBasePath}/getting-started`
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const checkOrgName = useCallback(async () => {
    if (!orgName.trim()) {
      setOrgNameStatus({})
      return
    }

    try {
      const response = await verifiedFetchJSON(`/organizations/check_name`, {
        method: 'POST',
        body: {value: orgName},
      })

      if (response.status === 406) {
        setOrgNameStatus({})
        setErrorMessage(
          'You have exceeded a rate limit. Please wait a few minutes before you try again; in some cases this may take up to an hour.',
        )
      } else {
        const data = (await response.json()) || {}
        setOrgNameStatus(data)
        setErrorMessage('')
      }
    } catch (error) {
      setOrgNameStatus({})
      setErrorMessage('Unknown error occurred. Please try again later.')
      throw error
    }
  }, [orgName])

  const debouncedCheckOrgName = useDebounce(checkOrgName, 200)

  const validationStatus = useMemo(() => {
    if (!orgNameStatus || Object.keys(orgNameStatus).length === 0) {
      return undefined
    } else if (
      orgNameStatus.exists ||
      orgNameStatus.not_alphanumeric ||
      orgNameStatus.over_max_length ||
      orgNameStatus.unavailable ||
      errorMessage
    ) {
      return 'error'
    }

    return 'success'
  }, [orgNameStatus, errorMessage])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()

      sendClickAnalyticsEvent({
        category: 'enterprise_trial_account',
        action: 'enterprise_onboarding_create_organization',
        label: 'ref_cta:create_organization_and_continue',
      })

      if (!(await sudo())) {
        setErrorMessage('Unauthorized')
        return
      }

      try {
        const result = await verifiedFetchJSON(`${enterpriseBasePath}/organizations`, {
          method: 'POST',
          body: {organization: {profile_name: orgName, login: orgNameStatus.name}},
        })

        if (result.ok) {
          navigate(gettingStartedPath)
        } else {
          const {message} = await result.json()
          setErrorMessage(message)
        }
      } catch (error) {
        setErrorMessage('Error creating organization')
      }
    },
    [orgName, orgNameStatus, enterpriseBasePath, gettingStartedPath, navigate, sendClickAnalyticsEvent],
  )

  const handleSkip = async () => {
    sendClickAnalyticsEvent({
      category: 'enterprise_trial_account',
      action: 'enterprise_onboarding_skip_create_organization',
      label: 'ref_cta:skip_this_step',
    })
  }

  return (
    <>
      {errorMessage && (
        <Flash {...testIdProps('flash-error-text')} variant="danger" sx={{mt: 3}}>
          <StopIcon />
          <span>{errorMessage}</span>
          <Box sx={{float: 'right', cursor: 'pointer'}} onClick={() => setErrorMessage('')}>
            <XIcon />
          </Box>
        </Flash>
      )}
      <div className="container-md p-1 mt-5" data-hpc>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 1}}>
          <Heading as="h1">Create an organization for your enterprise</Heading>
          <Text sx={{color: 'fg.muted', textAlign: 'center'}}>
            A key part of enterprise is that you can manage all of your organizations together under one roof. It is
            highly recommended that you add at least 1 organization to get the most out of your trial.
          </Text>

          <Box sx={{width: '100%', py: 3}}>
            <Box as="form" sx={{mb: 3}} onSubmit={handleSubmit} data-turbo={true}>
              <FormControl required={true}>
                <FormControl.Label>Organization account name</FormControl.Label>
                <TextInput
                  {...testIdProps('org-name-input')}
                  value={orgName}
                  autoFocus
                  onChange={e => {
                    const name = e.target.value
                    setOrgName(name)
                    debouncedCheckOrgName()
                  }}
                  validationStatus={validationStatus}
                  sx={{width: '100%'}}
                />
                {validationStatus === undefined && (
                  <FormControl.Caption>
                    <OrganizationNameMessage {...orgNameStatus} />
                  </FormControl.Caption>
                )}
                {validationStatus !== undefined && (
                  <FormControl.Validation variant={validationStatus}>
                    <OrganizationNameMessage {...orgNameStatus} />
                  </FormControl.Validation>
                )}
              </FormControl>
            </Box>

            <BorderBox sx={{flexDirection: 'column', p: 4}}>
              <Box sx={{display: 'flex', gap: 3}}>
                <GitHubAvatar square={true} size={48} src={business.avatar_url} />
                <div>
                  <Text
                    {...testIdProps('enterprise-name')}
                    sx={{display: 'block', fontSize: '20px', fontWeight: 'bold'}}
                  >
                    {business.name}
                  </Text>
                  <Text
                    {...testIdProps('enterprise-url')}
                    sx={{display: 'block', fontSize: '12px', color: 'fg.subtle'}}
                  >
                    {fullUrl({path: enterpriseBasePath})}
                  </Text>
                </div>
              </Box>
              <HierarchicalOrgCard
                title={orgName || 'Your new organization'}
                description={fullUrl({path: orgNameStatus?.name || 'YourOrganization'})}
                icon={OrganizationIcon}
              />
              <HierarchicalOrgCard
                title="You will be able to add more organizations during your trial"
                borderStyle="dashed"
              />
            </BorderBox>
          </Box>
        </Box>
        <Box sx={{width: '100%', display: 'flex', gap: 2, justifyContent: 'end'}}>
          <Button {...testIdProps('skip-button')} onClick={handleSkip} as={Link} to={gettingStartedPath}>
            Skip this step
          </Button>
          <Button {...testIdProps('continue-button')} variant="primary" onClick={handleSubmit}>
            Create organization and continue
          </Button>
        </Box>
      </div>
    </>
  )
}
