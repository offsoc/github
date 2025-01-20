import {
  Box,
  Button,
  Checkbox,
  TabNav,
  FormControl,
  TextInput,
  Text,
  RadioGroup,
  Radio,
  Link,
  Label,
} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {useEffect, useState} from 'react'
import type {FieldProgressionFieldEditComponentProps} from './FieldProgressionField'
import {ImageVersionSelector, getAvailableImageVersions} from './ImageVersionSelector'
import {ImageUploadValuesSelector} from './ImageUploadValuesSelector'
import {ImageSource, type Image, type ImageVersion} from '../../../types/image'
import type {Platform} from '../../../types/platform'
import type {ImageUploadValues} from '../../../types/image-upload'
import {URLS} from '../../../helpers/constants'

interface IProps extends FieldProgressionFieldEditComponentProps<Image> {
  allImages: {[key: string]: Image[]}
  platform: Platform
  onValidationError: (error: boolean) => void
  imageVersion: ImageVersion | null
  setImageVersion: (version: ImageVersion | null) => void
  isImageGenerationFeatureEnabled: boolean
  isImageGenerationEnabled: boolean
  setIsImageGenerationEnabled: (isEnabled: boolean) => void
  imageUploadValues: ImageUploadValues
  setImageUploadValues: (options: ImageUploadValues) => void
}

enum ActiveTab {
  GitHub = 'github',
  Partner = 'partner',
  Custom = 'custom',
}

const tabsDescription = {
  [ActiveTab.GitHub]: (
    <>
      <Text sx={{pt: 3}}>
        GitHub images are kept up to date and secure, containing all the tools you need to get started building and
        testing your applications.
      </Text>
      <Text sx={{pt: 1}} data-testid="image-selector-latest-caption">
        &ldquo;Latest&rdquo; tag matches with standard GitHub-hosted runners latest tag for the images.{' '}
        <Link inline href={URLS.LATEST_IMAGE_TAG}>
          Learn more about latest tags.
        </Link>
      </Text>
    </>
  ),
  [ActiveTab.Partner]: (
    <Text sx={{pt: 3}}>
      Partner images are created and managed by members of GitHub&apos;s Technology Partner Program.{' '}
      <Link inline href={URLS.PARTNER_IMAGES_REPO}>
        Learn more about partner images.
      </Link>
    </Text>
  ),
  [ActiveTab.Custom]: (
    <Text sx={{pt: 3}}>
      Custom images are created by the user using a workflow and available in this area once they finish running.
    </Text>
  ),
} as const

const imageSourceToTabMapping = {
  [ImageSource.Curated]: ActiveTab.GitHub,
  [ImageSource.Marketplace]: ActiveTab.Partner,
  [ImageSource.Custom]: ActiveTab.Custom,
} as const

function getStartTab(selectedImage: Image | null, filteredImages: {[key: string]: Image[]}) {
  // first we try to set default tab to the one that contains selected image
  if (selectedImage) {
    return imageSourceToTabMapping[selectedImage.source]
  }

  // if no image selected, we try to set default tab to the first one that contains images
  for (const tab of Object.keys(filteredImages)) {
    if (filteredImages[tab]?.length) {
      return tab as ActiveTab
    }
  }

  // if none of above - fault in into GitHub-owned tab
  return ActiveTab.GitHub
}

function getImagesForTab(tab: ActiveTab, filteredImages: {[key: string]: Image[]}) {
  return filteredImages[tab]
}

function getPreselectedImageVersion(
  currentImage: Image,
  savedImage: Image | null,
  savedImageVersion: ImageVersion | null,
) {
  // if selected image is the one that was saved before - we preselect the saved image version,
  // otherwise we preselect the latest image version
  if (currentImage.id === savedImage?.id) {
    return savedImageVersion
  }

  return currentImage?.imageVersions?.[0] ?? null
}

export default function ImageSelector({
  allImages,
  platform,
  value,
  setValue,
  onSave,
  onValidationError,
  imageVersion,
  setImageVersion,
  isImageGenerationFeatureEnabled,
  isImageGenerationEnabled,
  setIsImageGenerationEnabled,
  imageUploadValues,
  setImageUploadValues,
}: IProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(value)
  const [selectedImageVersion, setSelectedImageVersion] = useState<ImageVersion | null>(imageVersion)
  const [selectedIsImageGenerationEnabled, setSelectedIsImageGenerationEnabled] =
    useState<boolean>(isImageGenerationEnabled)
  const [selectedImageUploadValues, setSelectedImageUploadValues] = useState<ImageUploadValues>(imageUploadValues)
  const [imageUploadError, setImageUploadError] = useState<boolean>(false)

  const isImageUpload = platform.id === 'custom'

  let githubImages = allImages[ActiveTab.GitHub]?.filter(image => image.platform === platform.id) ?? []
  const partnerImages = allImages[ActiveTab.Partner]?.filter(image => image.platform === platform.id) ?? []
  const customImages =
    allImages[ActiveTab.Custom]?.filter(image => {
      if (!image.imageVersions?.length) {
        return false
      }
      const availableImageVersions = getAvailableImageVersions(image.imageVersions)

      // if there are no available image versions OR the only available image version is 'latest', we don't allow creating runner.
      // `latest` version is added by us to pin runner to the latest available custom image version.
      // If there are no non-failed/non-deleting versions, `latest` has nothing to resolve to on the Runner service side.
      const hasAvailableImageVersions = availableImageVersions.filter(v => v.version !== 'latest').length > 0

      return image.platform === platform.id && hasAvailableImageVersions
    }) ?? []

  githubImages = githubImages.map(image => {
    const displayNamePrefix =
      (image.id.includes('ubuntu') && 'Ubuntu') || (image.id.includes('windows') && 'Windows Server') || ''

    return {
      ...image,
      displayName: `${displayNamePrefix} ${image.displayName}`,
    }
  })

  // order of images is important for proper default tab selection
  const filteredAndSortedImages = {
    [ActiveTab.GitHub]: githubImages,
    [ActiveTab.Partner]: partnerImages,
    [ActiveTab.Custom]: customImages,
  }

  const [activeTab, setActiveTab] = useState<ActiveTab>(getStartTab(value, filteredAndSortedImages))
  const [currentTabImages, setCurrentTabImages] = useState<Image[]>(
    getImagesForTab(activeTab, filteredAndSortedImages) ?? [],
  )

  function handleSave() {
    onValidationError(false)
    setImageUploadError(false)

    if (isImageUpload && (!selectedImageUploadValues || !selectedImageUploadValues.sasUri)) {
      setImageUploadError(true)
      return
    }

    if (!isImageUpload && (!selectedImage || (selectedImage.source === ImageSource.Custom && !selectedImageVersion))) {
      onValidationError(true)
      return
    }

    setValue(selectedImage)
    setImageVersion(selectedImageVersion)
    setIsImageGenerationEnabled(selectedIsImageGenerationEnabled)
    setImageUploadValues(selectedImageUploadValues)

    if (onSave) {
      onSave()
    }
  }

  function onTabClick(e: React.MouseEvent) {
    const tab = e.currentTarget.getAttribute('id')
    if (tab) {
      setActiveTab(tab as ActiveTab)
      setCurrentTabImages(getImagesForTab(tab as ActiveTab, filteredAndSortedImages) ?? [])
    }
  }

  useEffect(() => {
    // when the tab changes - we need to preselect either first image on the tab if there was no saved image yet
    // or we preselect only saved image and no other images on tabs to not confuse customer that we changed image for them
    const preSelectedImageForTab = value ?? currentTabImages[0]
    setSelectedImage(preSelectedImageForTab ?? null)

    // keeping selectedImageVersion in sync with different image types.
    // It shouldn't have any value if we select image without versions,
    // and should have value if we select image with versions.
    preSelectedImageForTab?.imageVersions?.length
      ? setSelectedImageVersion(getPreselectedImageVersion(preSelectedImageForTab, value, imageVersion))
      : setSelectedImageVersion(null)

    // keep selectedIsImageGenerationEnabled in sync with different image types
    // it should be unchecked if we select image that does not support
    // image generation
    if (!preSelectedImageForTab || !preSelectedImageForTab?.isImageGenerationSupported) {
      setSelectedIsImageGenerationEnabled(false)
    }
  }, [currentTabImages, setSelectedImageVersion, setSelectedIsImageGenerationEnabled, value, imageVersion])

  const onSelectChange = (image: Image | null) => {
    onValidationError(false)
    setSelectedImage(image)

    // keeping selectedImageVersion in sync with different image types.
    // It shouldn't have any value if we select image without versions,
    // and should have value if we select image with versions.
    image?.imageVersions?.length
      ? setSelectedImageVersion(getPreselectedImageVersion(image, value, imageVersion))
      : setSelectedImageVersion(null)

    // keeping selectedIsImageGenerationEnabled in sync with different image
    // types. It should be unchecked if we select an image that does not support
    // image generation
    if (!image || !image?.isImageGenerationSupported) {
      setSelectedIsImageGenerationEnabled(false)
    }
  }

  return (
    <>
      {isImageUpload && (
        <div data-testid="image-upload-values">
          <ImageUploadValuesSelector
            value={selectedImageUploadValues}
            onChange={setSelectedImageUploadValues}
            validationError={imageUploadError}
            onValidationErrorChange={setImageUploadError}
          />
        </div>
      )}

      {!isImageUpload && (
        <>
          <Box sx={{paddingX: 0, paddingBottom: 3, paddingTop: 2}} data-testid="image-selector-tabs">
            <TabNav
              sx={{
                paddingX: '8px',
                '> nav': {
                  marginX: '-8px',
                  paddingX: '8px',
                },
              }}
              aria-label="Image"
            >
              {!!githubImages?.length && (
                <ImageTab
                  tabId={ActiveTab.GitHub}
                  tabHeader="GitHub-owned"
                  activeTab={activeTab}
                  onTabClick={onTabClick}
                />
              )}
              {!!partnerImages?.length && (
                <ImageTab tabId={ActiveTab.Partner} tabHeader="Partner" activeTab={activeTab} onTabClick={onTabClick} />
              )}
              {!!customImages?.length && (
                <ImageTab tabId={ActiveTab.Custom} tabHeader="Custom" activeTab={activeTab} onTabClick={onTabClick} />
              )}
            </TabNav>
          </Box>
          <ImageTabContent
            images={currentTabImages}
            preSelectedImage={selectedImage}
            onImageSelect={onSelectChange}
            tabDescription={tabsDescription[activeTab]}
          />
          {!!isImageGenerationFeatureEnabled && (
            <Box sx={{m: 3, mt: 0}}>
              <FormControl disabled={!selectedImage || !selectedImage.isImageGenerationSupported}>
                <Checkbox
                  aria-label="Enable this runner to generate custom images"
                  checked={selectedIsImageGenerationEnabled}
                  name="selectedIsImageGenerationEnabled"
                  value="default"
                  onChange={event => setSelectedIsImageGenerationEnabled(event.target.checked)}
                  data-testid="runner-enable-image-generation-checkbox"
                />
                <FormControl.Label sx={{pb: 1}}>
                  Enable this runner to generate custom images{' '}
                  <Label sx={{mx: 1}} variant="success">
                    Alpha
                  </Label>
                </FormControl.Label>
                <FormControl.Caption>
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    <span>
                      Custom image generation is supported for Linux x64 and Windows x64 and requires a base image from
                      the &quot;Partner&quot; images tab.
                    </span>
                  </Box>
                </FormControl.Caption>
              </FormControl>
            </Box>
          )}
        </>
      )}

      <Box
        sx={{
          gap: 3,
          display: 'flex',
          flexDirection: 'row',
          borderTopColor: 'border.default',
          borderTopStyle: 'solid',
          borderTopWidth: 1,
          padding: 3,
          paddingBottom: 0,
          width: '100%',
        }}
      >
        {activeTab === ActiveTab.Custom && !!selectedImage && selectedImage.source === ImageSource.Custom && (
          <ImageVersionSelector
            imageVersions={getAvailableImageVersions(selectedImage.imageVersions ?? [])}
            selectedImageVersion={selectedImageVersion}
            setSelectedImageVersion={setSelectedImageVersion}
            hideLabel={true} /* visually hide label for version selector embedded in image selector */
          />
        )}
        <Button data-testid="image-save-button" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </>
  )
}

type ImageTabProps = {
  tabId: ActiveTab
  tabHeader: string
  activeTab: ActiveTab
  onTabClick: (e: React.MouseEvent) => void
}

function ImageTab({tabId, tabHeader, activeTab, onTabClick}: ImageTabProps) {
  return (
    <TabNav.Link
      id={tabId}
      sx={{cursor: 'pointer'}}
      selected={activeTab === tabId}
      aria-controls="image-selector-tab-content"
      onClick={onTabClick}
      as={Button}
    >
      {tabHeader}
    </TabNav.Link>
  )
}

function showLabelForImage(image: Image | null) {
  if (!image) {
    return
  }

  if (image.id === 'ubuntu-latest' || image.id === 'windows-latest') {
    return (
      <Label sx={{mx: 1}} data-testid="image-selector-latest-label">
        Latest
      </Label>
    )
  }

  if (image.id === 'ubuntu-24.04') {
    return (
      <Label sx={{mx: 1}} variant="success">
        Beta
      </Label>
    )
  }
}

type ImageTabContentProps = {
  images: Image[]
  preSelectedImage: Image | null
  onImageSelect: (image: Image | null) => void
  tabDescription: JSX.Element
}

function ImageTabContent({images, onImageSelect, preSelectedImage, tabDescription}: ImageTabContentProps) {
  const [imageFilter, setImageFilter] = useState<string | null>(null)

  const filteredImages = images.filter(image =>
    imageFilter === null ? image : image.displayName.toLowerCase().includes(imageFilter.toLowerCase()),
  )

  function onRadioChange(selected: string | null) {
    const selectedImage = images.find(image => image.id.toString() === selected)
    onImageSelect(selectedImage ?? null)
  }

  return (
    <Box sx={{m: 3, mt: 0}} data-testid="image-selector-tab-content">
      <Box sx={{display: 'flex', flexDirection: 'column', pb: 3}}>
        <span className="sr-only" id="images-filter">
          Filter runner images
        </span>
        <TextInput
          area-labelledby="images-filter"
          onChange={event => setImageFilter(event.target.value)}
          leadingVisual={SearchIcon}
          placeholder="Filter runner images"
        />
        {tabDescription}
        <div role="status" style={{marginTop: 6}}>
          {filteredImages.length === 0 ? (
            <Text sx={{color: 'fg.muted'}}>No images match that filter</Text>
          ) : (
            <span className="sr-only">{filteredImages.length} images match that filter</span>
          )}
        </div>
      </Box>
      <Box sx={{overflowY: 'auto', maxHeight: '33vh'}}>
        {images.length === 0 ? (
          <Text sx={{color: 'danger.fg'}} data-testid="no-images-error">
            No images available.
          </Text>
        ) : (
          !!filteredImages && (
            <RadioGroup name="image-selector" onChange={onRadioChange} required>
              <RadioGroup.Label visuallyHidden>Runner images</RadioGroup.Label>
              {filteredImages.map(image => (
                <FormControl key={image.id}>
                  <Radio
                    value={image.id}
                    checked={preSelectedImage?.id === image.id}
                    data-testid={`image-option-radio-${image.id}`}
                  />
                  <FormControl.Label sx={{fontWeight: 'normal'}} data-testid={`image-option-label-${image.id}`}>
                    {image.displayName}
                    {showLabelForImage(image)}
                  </FormControl.Label>
                </FormControl>
              ))}
            </RadioGroup>
          )
        )}
      </Box>
    </Box>
  )
}
