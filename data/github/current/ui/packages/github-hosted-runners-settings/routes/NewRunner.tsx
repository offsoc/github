import {useEffect, useState} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useNavigate, useSearchParams} from '@github-ui/use-navigate'
import {Box, PageLayout, Button, Link, Flash, Heading} from '@primer/react'

import {RunnerNameInput} from '../views/components/shared/RunnerNameInput'
import FieldProgression from '../views/components/shared/FieldProgression'
import {PlatformSelector} from '../views/components/shared/PlatformSelector'
import ImageSelector from '../views/components/shared/ImageSelector'
import MachineSpecSelect, {machineSpecDisplayText} from '../views/components/shared/MachineSpecSelect'
import {createRunner} from '../services/runner'
import {ImageSource} from '../types/image'
import {
  RunnerMaxConcurrencyInput,
  getMaxRunnerConcurrencyError,
} from '../views/components/shared/RunnerMaxConcurrencyInput'
import type {RunnerCreateForm, RunnerGroup} from '../types/runner'
import type {Image, ImageVersion} from '../types/image'
import {SETTINGS, ERRORS} from '../helpers/constants'
import {RunnerPublicIpCheckbox} from '../views/components/shared/RunnerPublicIpCheckbox'
import type {Platform} from '../types/platform'
import {type ImageUploadValues, imageUploadValuesDefault} from '../types/image-upload'
import type {MachineSpec} from '../types/machine-spec'
import {RunnerGroupSelector} from '../views/components/shared/RunnerGroupSelector'
import {DocsContext} from '../views/components/context'
import {runnerDetailsPath} from '../helpers/paths'

export interface NewRunnerPayload {
  runnerListPath: string
  entityLogin: string
  docsUrlBase: string
  isPublicIpAllowed: boolean
  usedIpCount: number
  totalIpCount: number
  isCustomImageUploadingEnabled: boolean
  machineSpecs: MachineSpec[]
  runnerGroups: RunnerGroup[]
  images: {[key: string]: Image[]}
  maxConcurrentJobsDefault: number
  maxConcurrentJobsMin: number
  maxConcurrentJobsDefaultMax: number
  maxConcurrentJobsGpuMax: number
  isEnterprise: boolean
  isCustomImagesFeatureEnabled: boolean
}

export function NewRunner() {
  const {
    runnerListPath,
    entityLogin,
    docsUrlBase,
    usedIpCount,
    totalIpCount,
    isPublicIpAllowed,
    runnerGroups,
    maxConcurrentJobsDefault,
    maxConcurrentJobsMin,
    maxConcurrentJobsDefaultMax,
    maxConcurrentJobsGpuMax,
    machineSpecs,
    isCustomImageUploadingEnabled,
    images,
    isEnterprise,
    isCustomImagesFeatureEnabled,
  } = useRoutePayload<NewRunnerPayload>()
  const [runnerName, setRunnerName] = useState<string>('')
  const [isPublicIpEnabled, setIsPublicIpEnabled] = useState<boolean>(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [selectedImageVersion, setSelectedImageVersion] = useState<ImageVersion | null>(null)
  const [isImageGenerationEnabled, setIsImageGenerationEnabled] = useState<boolean>(false)
  const [imageUploadValues, setImageUploadValues] = useState<ImageUploadValues>(imageUploadValuesDefault)
  const [selectedMachineSpec, setSelectedMachineSpec] = useState<MachineSpec | null>(null)
  const [formError, setFormError] = useState<string>('')
  const [runnerNameError, setRunnerNameError] = useState<boolean>(false)
  const [maxConcurrentJobs, setMaxConcurrentJobs] = useState<number>(maxConcurrentJobsDefault)
  const [machineSpecError, setMachineSpecError] = useState<boolean>(false)
  const [imageError, setImageError] = useState<boolean>(false)
  const [platformError, setPlatformError] = useState<boolean>(false)

  // it's not possible to have group with ID 0, so we use it to validate if no groups are available
  const [runnerGroupId, setRunnerGroupId] = useState<number>(runnerGroups.length ? SETTINGS.DEFAULT_RUNNER_GROUP_ID : 0)
  const [runnerGroupError, setRunnerGroupError] = useState<boolean>(false)

  const isImageUpload = selectedPlatform?.id === 'custom'
  const selectedImageDisplayName = isImageUpload
    ? getCustomImageDisplayName(imageUploadValues)
    : getImageDisplayName(selectedImage, selectedImageVersion, isImageGenerationEnabled)

  const gpuRunnerSelected = selectedMachineSpec?.type === 'gpu_optimized'

  const maxConcurrentJobsMax = gpuRunnerSelected ? maxConcurrentJobsGpuMax : maxConcurrentJobsDefaultMax

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  useEffect(() => {
    const presetRunnerGroupId = getPresetRunnerGroupId(searchParams)
    if (presetRunnerGroupId !== undefined && runnerGroups.some(group => group.id === presetRunnerGroupId)) {
      setRunnerGroupId(presetRunnerGroupId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run only once on component mount

  const resetFormError = () => {
    setFormError('')
  }

  const isFormValid = () => {
    let validForm = true
    if (!runnerName || runnerNameError) {
      setRunnerNameError(true)
      validForm = false
    }

    const isGroupInvalid = !runnerGroups.find(group => group.id === runnerGroupId)
    if (!runnerGroupId || isGroupInvalid || runnerGroupError) {
      setRunnerGroupError(true)
      validForm = false
    }

    if (!selectedPlatform) {
      setPlatformError(true)
      validForm = false
    }

    // unless the user is uploading a new custom image, we require an image to be selected
    if (!isImageUpload) {
      if (!selectedImage) {
        setImageError(true)
        validForm = false
      }

      // if the selected image is a previously uploaded custom image, require a version to be selected
      if (selectedImage && selectedImage.source === ImageSource.Custom && !selectedImageVersion) {
        setImageError(true)
        validForm = false
      }
    }

    if (!selectedMachineSpec) {
      setMachineSpecError(true)
      validForm = false
    }

    const maxRunnerConcurrencyError = getMaxRunnerConcurrencyError({
      value: maxConcurrentJobs,
      min: maxConcurrentJobsMin,
      max: maxConcurrentJobsMax,
      gpuRunnerSelected,
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

    const runner: RunnerCreateForm = {
      name: runnerName,
      runnerGroupId,
      maximumConcurrentJobs: maxConcurrentJobs,
      machineSpecId: selectedMachineSpec!.id,
      isPublicIpEnabled,
      ...(isImageUpload
        ? {
            imageSource: ImageSource.Custom,
            imageId: null,
            imageVersion: null,
            imageName: null,
            imageSasUri: imageUploadValues.sasUri,
            platform: imageUploadValues.imageType.id,
            isImageGenerationEnabled: false,
          }
        : {
            imageSource: selectedImage!.source,
            imageId: selectedImage!.id,
            imageVersion: selectedImageVersion?.version ?? null, // null will be transformed to "latest" for non-custom images
            imageName: selectedImage!.displayName, // is needed to determine on a backend if persistent disk should be used
            imageSasUri: '',
            platform: selectedPlatform!.id,
            isImageGenerationEnabled,
          }),
    }

    try {
      const runnerId = await createRunner(runner, entityLogin, isEnterprise)
      navigate(runnerDetailsPath({isEnterprise, entityLogin, runnerId}))
    } catch (error: unknown) {
      setFormError((error as Error)?.message ?? ERRORS.CREATION_FAILED_REASON_UNKNOWN)
    }
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
            &nbsp;/ Create new runner
          </Heading>
          <Box sx={{borderBottom: '1px solid', borderColor: 'border.default', pt: '8px'}} />
        </PageLayout.Header>
        <PageLayout.Content>
          {/* noValidate disables native browser validation, that causes inaccessible tooltip to appear */}
          <form onSubmit={handleSubmit} noValidate data-hpc>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div data-testid="runner-name-input-section">
                <RunnerNameInput
                  runnerName={runnerName}
                  onChange={setRunnerName}
                  validationError={runnerNameError}
                  onValidationError={setRunnerNameError}
                />
              </div>
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Heading as="h3" className="h3 text-normal" sx={{mb: 2}}>
                  Runner specifications
                </Heading>
                <FieldProgression
                  fields={[
                    {
                      name: 'Platform',
                      displayValue: selectedPlatform?.displayName ?? null,
                      error: platformError,
                      editComponent: (
                        <PlatformSelector
                          value={selectedPlatform}
                          setValue={setSelectedPlatform}
                          isCustomImageUploadingEnabled={isCustomImageUploadingEnabled}
                          machineSpecs={machineSpecs}
                          images={images}
                          onValidationError={setPlatformError}
                        />
                      ),
                    },
                    {
                      name: 'Image',
                      displayValue: selectedImageDisplayName,
                      error: imageError,
                      editComponent: (
                        <ImageSelector
                          allImages={images}
                          platform={selectedPlatform!}
                          value={selectedImage}
                          setValue={setSelectedImage}
                          onValidationError={setImageError}
                          isImageGenerationEnabled={isImageGenerationEnabled}
                          setIsImageGenerationEnabled={setIsImageGenerationEnabled}
                          imageVersion={selectedImageVersion}
                          setImageVersion={setSelectedImageVersion}
                          imageUploadValues={imageUploadValues}
                          setImageUploadValues={setImageUploadValues}
                          isImageGenerationFeatureEnabled={isCustomImagesFeatureEnabled}
                        />
                      ),
                    },
                    {
                      name: 'Size',
                      displayValue: selectedMachineSpec
                        ? machineSpecDisplayText(selectedMachineSpec).closedBoxSummary
                        : null,
                      error: machineSpecError,
                      editComponent: (
                        <MachineSpecSelect
                          value={selectedMachineSpec}
                          setValue={setSelectedMachineSpec}
                          onSelect={() => setMachineSpecError(false)}
                          runnerImage={selectedImage}
                          platform={selectedPlatform}
                          options={machineSpecs}
                          isImageGenerationEnabled={isCustomImagesFeatureEnabled && isImageGenerationEnabled}
                        />
                      ),
                    },
                  ]}
                />
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Heading as="h3" className="h3 text-normal">
                  Capacity
                </Heading>
                <RunnerMaxConcurrencyInput
                  value={maxConcurrentJobs}
                  min={maxConcurrentJobsMin}
                  max={maxConcurrentJobsMax}
                  gpuRunnerSelected={gpuRunnerSelected}
                  onChange={setMaxConcurrentJobs}
                />
              </Box>

              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}} data-testid="runner-group-section">
                <Heading as="h3" className="h3 text-normal">
                  Permissions
                </Heading>
                <RunnerGroupSelector
                  value={runnerGroupId}
                  setValue={setRunnerGroupId}
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
                />
              </Box>
            </Box>
            <Button type="submit" variant="primary" data-testid="create-runner-button" sx={{mt: 3}}>
              Create runner
            </Button>
          </form>
        </PageLayout.Content>
      </PageLayout>
    </DocsContext.Provider>
  )
}

function getCustomImageDisplayName(imageUploadValues: ImageUploadValues) {
  return !imageUploadValues.sasUri
    ? null
    : `Custom, ${imageUploadValues.imageType.displayName}, ${imageUploadValues.sasUri}`
}

function getImageDisplayName(
  image: Image | null,
  imageVersion: ImageVersion | null,
  showImageGenerationEnabled: boolean,
) {
  if (!image) {
    return null
  }

  const imageVersionDisplayName = imageVersion ? `, ${imageVersion.version}` : ''
  const imageGenerationEnabledText = showImageGenerationEnabled ? ', Image Generation Enabled' : ''
  const imageSource =
    (image.source === ImageSource.Curated && 'GitHub-owned') ||
    (image.source === ImageSource.Marketplace && 'Partner') ||
    image.source

  return `${imageSource}, ${image.displayName}${imageVersionDisplayName}${imageGenerationEnabledText}`
}

// Read runner_group_id query param and try to parse as a number
function getPresetRunnerGroupId(searchParams: URLSearchParams) {
  const presetGroupIdAsString = searchParams.get('runner_group_id')
  if (presetGroupIdAsString !== null) {
    const presetGroupId: number = parseInt(presetGroupIdAsString, 10)
    if (!isNaN(presetGroupId)) {
      return presetGroupId
    }
  }
  return undefined
}
