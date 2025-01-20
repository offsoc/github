import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {DocsContext} from '../views/components/context'
import {Box, Button, Flash, Heading, Link, PageLayout} from '@primer/react'
import {RunnerNameInput} from '../views/components/shared/RunnerNameInput'
import {useState} from 'react'
import {useNavigate} from '@github-ui/use-navigate'
import {
  RunnerMaxConcurrencyInput,
  getMaxRunnerConcurrencyError,
} from '../views/components/shared/RunnerMaxConcurrencyInput'
import {RunnerGroupSelector} from '../views/components/shared/RunnerGroupSelector'
import {RunnerPublicIpCheckbox} from '../views/components/shared/RunnerPublicIpCheckbox'
import type {RunnerEditForm, RunnerGroup} from '../types/runner'
import {ERRORS} from '../helpers/constants'
import type {ImageVersion} from '../types/image'
import {ImageVersionSelector} from '../views/components/shared/ImageVersionSelector'
import {updateRunner} from '../services/runner'
import {runnerDetailsPath} from '../helpers/paths'

export interface EditRunnerPayload {
  docsUrlBase: string
  entityLogin: string
  imageVersions: ImageVersion[]
  isEnterprise: boolean
  isPublicIpAllowed: boolean
  maxConcurrentJobsMax: number
  maxConcurrentJobsMin: number
  runnerGroupId: number
  runnerGroups: RunnerGroup[]
  runnerHasCustomImage: boolean
  runnerHasGpuSpec: boolean
  runnerHasPublicIp: boolean
  runnerId: number
  runnerImageVersion: string
  runnerListPath: string
  runnerMaxConcurrentJobs: number
  runnerName: string
  totalIpCount: number
  usedIpCount: number
}

export function EditRunner() {
  const {
    docsUrlBase,
    entityLogin,
    imageVersions,
    isEnterprise,
    isPublicIpAllowed,
    maxConcurrentJobsMin,
    maxConcurrentJobsMax,
    runnerGroupId,
    runnerGroups,
    runnerHasCustomImage,
    runnerHasGpuSpec,
    runnerHasPublicIp,
    runnerId,
    runnerImageVersion,
    runnerListPath,
    runnerMaxConcurrentJobs,
    runnerName,
    totalIpCount,
    usedIpCount,
  } = useRoutePayload<EditRunnerPayload>()

  const [formError, setFormError] = useState<string>('')

  const [selectedRunnerName, setSelectedRunnerName] = useState<string>(runnerName)
  const [runnerNameError, setRunnerNameError] = useState<boolean>(false)

  const [maxConcurrentJobs, setMaxConcurrentJobs] = useState<number>(runnerMaxConcurrentJobs)

  const [isPublicIpEnabled, setIsPublicIpEnabled] = useState<boolean>(runnerHasPublicIp)

  // it's not possible to have group with ID 0, so we use it to validate if no groups are available
  const [selectedRunnerGroupId, setSelectedRunnerGroupId] = useState<number>(runnerGroupId)
  const [runnerGroupError, setRunnerGroupError] = useState<boolean>(false)

  // initialize with selected image version based on runnerImageVersion
  const [selectedImageVersion, setSelectedImageVersion] = useState<ImageVersion | null>(
    imageVersions?.find(version => version.version === runnerImageVersion) || null,
  )

  const navigate = useNavigate()

  const resetFormError = () => {
    setFormError('')
  }

  const isFormValid = () => {
    let validForm = true
    if (!selectedRunnerName || runnerNameError) {
      setRunnerNameError(true)
      validForm = false
    }

    const isGroupInvalid = !runnerGroups.find(group => group.id === runnerGroupId)
    if (!runnerGroupId || isGroupInvalid || runnerGroupError) {
      setRunnerGroupError(true)
      validForm = false
    }

    const maxRunnerConcurrencyError = getMaxRunnerConcurrencyError({
      value: maxConcurrentJobs,
      min: maxConcurrentJobsMin,
      max: maxConcurrentJobsMax,
      gpuRunnerSelected: runnerHasGpuSpec,
    })
    if (maxRunnerConcurrencyError) {
      validForm = false
    }

    return validForm
  }

  const handleSubmit = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault()
    resetFormError()

    if (!isFormValid()) {
      setFormError(ERRORS.INVALID_FORM)
      return
    }

    const form: RunnerEditForm = {
      name: selectedRunnerName,
      runnerGroupId: selectedRunnerGroupId,
      maximumConcurrentJobs: maxConcurrentJobs,
      isPublicIpEnabled,
      imageVersion: selectedImageVersion?.version || null,
    }

    try {
      const success = await updateRunner(form, runnerId, entityLogin, isEnterprise)
      if (success) {
        navigate(runnerDetailsPath({isEnterprise, entityLogin, runnerId}))
      } else {
        setFormError(ERRORS.UPDATE_FAILED_REASON_UNKNOWN)
      }
    } catch (error: unknown) {
      setFormError((error as Error)?.message ?? ERRORS.UPDATE_FAILED_REASON_UNKNOWN)
    }
  }

  const onCancel = () => {
    navigate(runnerDetailsPath({isEnterprise, entityLogin, runnerId}))
  }

  return (
    <DocsContext.Provider value={docsUrlBase}>
      {formError && <Flash variant="danger">{formError}</Flash>}
      <PageLayout padding="none">
        <PageLayout.Header sx={{mb: '16px !important'}}>
          <Heading as="h2" className="h2 text-normal">
            <Link href={runnerListPath} data-testid="subhead-runner-list-path">
              Runners
            </Link>
            &nbsp;/ Edit {runnerName}
          </Heading>
          <Box sx={{borderBottom: '1px solid', borderColor: 'border.default', pt: '8px'}} />
        </PageLayout.Header>
        <PageLayout.Content>
          {/* noValidate disables native browser validation, that causes inaccessible tooltip to appear */}
          <form onSubmit={handleSubmit} noValidate data-hpc>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div data-testid="runner-name-input-section">
                <RunnerNameInput
                  runnerName={selectedRunnerName}
                  onChange={setSelectedRunnerName}
                  validationError={runnerNameError}
                  onValidationError={setRunnerNameError}
                />
              </div>
              {runnerHasCustomImage && (
                <Box
                  sx={{display: 'flex', flexDirection: 'column', gap: 2}}
                  data-testid="edit-runner-specifications-section"
                >
                  <Heading as="h3" className="h3 text-normal">
                    Runner specifications
                  </Heading>
                  <ImageVersionSelector
                    imageVersions={imageVersions}
                    selectedImageVersion={selectedImageVersion}
                    setSelectedImageVersion={setSelectedImageVersion}
                  />
                </Box>
              )}
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Heading as="h3" className="h3 text-normal">
                  Capacity
                </Heading>
                <RunnerMaxConcurrencyInput
                  value={maxConcurrentJobs}
                  min={maxConcurrentJobsMin}
                  max={maxConcurrentJobsMax}
                  gpuRunnerSelected={runnerHasGpuSpec}
                  onChange={setMaxConcurrentJobs}
                />
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}} data-testid="runner-group-section">
                <Heading as="h3" className="h3 text-normal">
                  Permissions
                </Heading>
                <RunnerGroupSelector
                  value={selectedRunnerGroupId}
                  setValue={setSelectedRunnerGroupId}
                  groups={runnerGroups}
                  validationError={runnerGroupError}
                />
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Heading as="h3" className="h3 text-normal">
                  Networking
                </Heading>
                <RunnerPublicIpCheckbox
                  checked={isPublicIpEnabled}
                  onChange={setIsPublicIpEnabled}
                  isPublicIpAllowed={isPublicIpAllowed}
                  usedIpCount={usedIpCount}
                  totalIpCount={totalIpCount}
                  runnerHasPublicIp={runnerHasPublicIp}
                />
              </Box>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'row', gap: 3, mt: 3}}>
              <Button type="submit" variant="primary" data-testid="edit-runner-save-button">
                Save
              </Button>
              <Button type="button" variant="default" data-testid="edit-runner-cancel-button" onClick={onCancel}>
                Cancel
              </Button>
            </Box>
          </form>
        </PageLayout.Content>
      </PageLayout>
    </DocsContext.Provider>
  )
}
