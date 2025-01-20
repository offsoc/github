import {DataTable, Table} from '@primer/react/experimental'
import type {ImageDefinition} from '../types'
import {CheckCircleIcon, KebabHorizontalIcon, XCircleIcon} from '@primer/octicons-react'
import VisuallyHidden from '@primer/react/lib-esm/_VisuallyHidden'
import {ActionList, ActionMenu, Box, Button, IconButton} from '@primer/react'
import {Constants} from '../constants/constants'
import {useNavigate} from '@github-ui/use-navigate'

interface ICuratedImagesTableProps {
  imageDefinitions: ImageDefinition[]
  imsStafftoolsPath: string
  newCuratedImagePath: string
}

export function CuratedImagesTable(props: ICuratedImagesTableProps) {
  const navigate = useNavigate()
  return (
    <Box sx={{pt: 2}}>
      <Table.Container>
        <Table.Title as="h2" id="curated-images">
          {Constants.curatedImagesTableTitle}
        </Table.Title>
        <Table.Actions>
          <Button onClick={() => navigate(props.newCuratedImagePath)}>{Constants.createCuratedImages}</Button>
        </Table.Actions>
        <DataTable
          aria-labelledby="curated-images"
          aria-describedby="curated-images-subtitle"
          data={props.imageDefinitions}
          columns={[
            {
              header: 'Id',
              field: 'id',
              rowHeader: true,
            },
            {
              header: 'Name',
              field: 'name',
            },
            {
              header: 'Architecture',
              field: 'architecture',
            },
            {
              header: 'OsType',
              field: 'osType',
            },
            {
              header: 'Enabled',
              field: 'enabled',
              renderCell: row => {
                return row.enabled ? <CheckCircleIcon size={16} /> : <XCircleIcon size={16} />
              },
            },
            {
              header: 'Versions',
              field: 'imageVersionsCount',
              renderCell: row => {
                return row.imageVersionsCount
              },
            },
            {
              id: 'actions',
              header: () => <VisuallyHidden>Actions</VisuallyHidden>,
              renderCell: row => {
                return (
                  <ActionMenu>
                    <ActionMenu.Anchor>
                      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                      <IconButton
                        aria-label={`Actions: ${row.name}`}
                        title={`Actions: ${row.name}`}
                        icon={KebabHorizontalIcon}
                        variant="invisible"
                        unsafeDisableTooltip={true}
                      />
                    </ActionMenu.Anchor>
                    <ActionMenu.Overlay>
                      <ActionList>
                        <ActionList.Item
                          disabled={row.imageVersionsCount === 0}
                          onSelect={() => navigate(Constants.imageVersionsUrl(props.imsStafftoolsPath, row.id))}
                        >
                          {Constants.viewImageVersions}
                        </ActionList.Item>
                        <ActionList.Divider />
                        <ActionList.Item>{Constants.editCuratedImages}</ActionList.Item>
                        <ActionList.Item variant="danger">{Constants.deleteCuratedImages}</ActionList.Item>
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                )
              },
            },
          ]}
        />
      </Table.Container>
    </Box>
  )
}
