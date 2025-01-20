import {useState} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, PageLayout, Heading} from '@primer/react'
import type {Image} from '@github-ui/github-hosted-runners-settings/types/image'

import CustomImagesList from '../views/components/shared/CustomImagesList'
import SearchInput from '../views/components/shared/SearchInput'

export interface CustomImagesManagementPayload {
  entityLogin: string
  images: Image[]
  isEnterprise: boolean
}

export function CustomImagesManagement() {
  const {entityLogin, images, isEnterprise} = useRoutePayload<CustomImagesManagementPayload>()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <PageLayout padding="none" data-hpc>
      <PageLayout.Header sx={{mb: '16px !important'}}>
        <Heading as="h2" className="h2 text-normal" data-testid="custom-images-title">
          Custom images
        </Heading>
        {isEnterprise && (
          <Box sx={{mt: 1}}>
            <span>Manage your custom images and their versions.</span>
          </Box>
        )}
        <Box sx={{borderBottom: '1px solid', borderColor: 'border.default', pt: '8px'}} />
      </PageLayout.Header>
      <PageLayout.Content sx={{display: 'flex', flexDirection: 'column'}} as="div">
        {!isEnterprise && (
          <Box sx={{mb: 3}}>
            <span>Manage your custom images and their versions.</span>
          </Box>
        )}
        <SearchInput onSetSearchQuery={setSearchQuery} />
        <CustomImagesList
          entityLogin={entityLogin}
          images={images}
          isEnterprise={isEnterprise}
          searchQuery={searchQuery}
        />
      </PageLayout.Content>
    </PageLayout>
  )
}
