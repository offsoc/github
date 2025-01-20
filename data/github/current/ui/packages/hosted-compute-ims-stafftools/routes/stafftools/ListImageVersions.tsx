import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {ImageDefinition, ImageVersion} from '../../types'
import {Box, Breadcrumbs} from '@primer/react'
import {Constants} from '../../constants/constants'
import {Spacing, breadcrumbLink} from '../../utils/style'
import {CuratedImageVersionsTable} from '../../components/CuratedImageVersionsTable'
import {useNavigate} from '@github-ui/use-navigate'

export interface ListImageVersionsPayload {
  imageDefinition: ImageDefinition
  imageVersions: ImageVersion[]
  imsStafftoolsPath: string
}

export function ListImageVersions() {
  const payload = useRoutePayload<ListImageVersionsPayload>()
  const navigate = useNavigate()

  return (
    <>
      <Box sx={{mb: Spacing.StandardPadding}}>
        <Breadcrumbs>
          <Breadcrumbs.Item sx={breadcrumbLink} onClick={() => navigate(payload.imsStafftoolsPath)}>
            {Constants.curatedImagesTableTitle}
          </Breadcrumbs.Item>
          <Breadcrumbs.Item selected>
            {payload.imageDefinition.name} ({payload.imageDefinition.id})
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <CuratedImageVersionsTable imageVersions={payload.imageVersions} />
    </>
  )
}
