import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Heading, TabNav} from '@primer/react'
import {pageHeadingStyle, Spacing} from '../../utils/style'
import {useState} from 'react'
import type {ImageDefinition} from '../../types'
import {ImsBlankslate} from '../../components/ImsBlankstate'
import {Constants} from '../../constants/constants'
import {CuratedImagesPage} from '../../components/CuratedImagesPage'

type ImageTypeTab = 'curated' | 'marketplace'

export interface MainPayload {
  imageDefinitionPointers: ImageDefinition[]
  imageDefinitions: ImageDefinition[]
  imsStafftoolsPath: string
  newCuratedImagePath: string
  newCuratedPointerPath: string
}

export function Main() {
  const payload = useRoutePayload<MainPayload>()
  const [selectedTab, setSelectedTab] = useState<ImageTypeTab>('curated')

  return (
    <>
      <div className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          {Constants.stafftoolPageTitle}
        </Heading>
      </div>
      <div>
        <div>
          <TabNav aria-label="Main">
            <TabNav.Link as="button" selected={selectedTab === 'curated'} onClick={() => setSelectedTab('curated')}>
              Curated
            </TabNav.Link>
            <TabNav.Link
              as="button"
              selected={selectedTab === 'marketplace'}
              onClick={() => setSelectedTab('marketplace')}
            >
              Marketplace
            </TabNav.Link>
          </TabNav>
        </div>
        {selectedTab === 'curated' && (
          <CuratedImagesPage
            imageDefinitionPointers={payload.imageDefinitionPointers}
            imageDefinitions={payload.imageDefinitions}
            imsStafftoolsPath={payload.imsStafftoolsPath}
            newCuratedImagePath={payload.newCuratedImagePath}
            newCuratedPointerPath={payload.newCuratedPointerPath}
          />
        )}
        {selectedTab === 'marketplace' && (
          <Box sx={{mt: Spacing.StandardPadding}}>
            <ImsBlankslate title={Constants.blankslateTitle} description={Constants.blankslateDescription} />
          </Box>
        )}
      </div>
    </>
  )
}
