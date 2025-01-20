import {Spacing} from '../../utils/style'
import {Box, Breadcrumbs, FormControl, Select, TextInput} from '@primer/react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Constants} from '../../constants/constants'

export interface NewCuratedPointerPayload {
  imsStafftoolsPath: string
}

export function NewCuratedPointer() {
  const payload = useRoutePayload<NewCuratedPointerPayload>()
  return (
    <>
      <Box sx={{mb: Spacing.StandardPadding}}>
        <Breadcrumbs>
          <Breadcrumbs.Item href={payload.imsStafftoolsPath}>{Constants.curatedImagesTableTitle}</Breadcrumbs.Item>
          <Breadcrumbs.Item selected>{Constants.newCuratedImages}</Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>
      <FormControl required>
        <FormControl.Label>Image Name</FormControl.Label>
        <TextInput />
      </FormControl>
      <FormControl>
        <FormControl.Label>Os Type</FormControl.Label>
        <Select>
          <Select.Option value="Linux">Linux</Select.Option>
          <Select.Option value="Window">Window</Select.Option>
        </Select>
      </FormControl>
      <FormControl>
        <FormControl.Label>Architecture</FormControl.Label>
        <Select>
          <Select.Option value="x64">x64</Select.Option>
          <Select.Option value="Arm64">Arm64</Select.Option>
        </Select>
      </FormControl>
    </>
  )
}
