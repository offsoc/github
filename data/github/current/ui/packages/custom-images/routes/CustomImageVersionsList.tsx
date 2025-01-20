import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {Box, PageLayout, Heading, Link} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'

import CustomImageVersionItem from '../views/components/shared/CustomImageVersionItem'
import type {ImageVersion} from '@github-ui/github-hosted-runners-settings/types/image'

export interface CustomImageVersionsListPayload {
  entityLogin: string
  imageDefinitionId: string
  imagesListPath: string
  imageName: string
  isEnterprise: boolean
  latestVersion: string
  versions: ImageVersion[]
}

export function CustomImageVersionsList() {
  const {entityLogin, imageDefinitionId, imagesListPath, imageName, isEnterprise, latestVersion, versions} =
    useRoutePayload<CustomImageVersionsListPayload>()
  const title = `${versions.length} ${versions.length === 1 ? 'version' : 'versions'}`

  const boxBorderStyles = {
    borderStyle: 'solid',
    borderColor: 'border.default',
    borderWidth: 1,
  }

  return (
    <PageLayout padding="none" data-hpc>
      <PageLayout.Header sx={{mb: '16px !important'}}>
        <Heading as="h2" className="h2 text-normal" data-testid="custom-image-versions-title">
          <Link href={imagesListPath} data-testid="subhead-runner-list-path">
            Custom images
          </Link>
          &nbsp;/&nbsp;{imageName}
        </Heading>
        <Box sx={{borderBottom: '1px solid', borderColor: 'border.default', pt: '8px'}} />
      </PageLayout.Header>
      <PageLayout.Content sx={{display: 'flex', flexDirection: 'column'}} as="div">
        {!versions || versions.length === 0 ? (
          <Box className="rounded-2" sx={boxBorderStyles} data-hpc>
            <Blankslate>
              <Blankslate.Heading>
                <span data-testid="no-versions-error">There are no image versions available.</span>
              </Blankslate.Heading>
            </Blankslate>
          </Box>
        ) : (
          <Box className="rounded-2" sx={boxBorderStyles} data-hpc>
            <Box sx={{overflowY: 'auto'}} data-testid="display-versions-section">
              <ListView
                metadata={<ListViewMetadata title={<span data-testid="versions-count">{title}</span>} />}
                title={title}
                titleHeaderTag="h3"
              >
                {versions.map(iv => (
                  <CustomImageVersionItem
                    key={iv.version}
                    entityLogin={entityLogin}
                    imageDefinitionId={imageDefinitionId}
                    isEnterprise={isEnterprise}
                    isLatest={iv.version === latestVersion}
                    version={iv}
                  />
                ))}
              </ListView>
            </Box>
          </Box>
        )}
      </PageLayout.Content>
    </PageLayout>
  )
}
