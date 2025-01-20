import {DataTable, Table} from '@primer/react/experimental'
import type {ImageDefinition} from '../types'
import {CheckCircleIcon, KebabHorizontalIcon, XCircleIcon} from '@primer/octicons-react'
import VisuallyHidden from '@primer/react/lib-esm/_VisuallyHidden'
import {ActionList, ActionMenu, Box, Button, IconButton} from '@primer/react'
import {Constants} from '../constants/constants'
import {useNavigate} from '@github-ui/use-navigate'

interface ICuratedImagesPointerTableProps {
  pointers: ImageDefinition[]
  newCuratedPointerPath: string
}

export function CuratedImagesPointerTable(props: ICuratedImagesPointerTableProps) {
  const navigate = useNavigate()
  return (
    <Box sx={{pt: 2}}>
      <Table.Container>
        <Table.Title as="h2" id="pointers">
          {Constants.pointerTableTitle}
        </Table.Title>
        <Table.Actions>
          <Button onClick={() => navigate(props.newCuratedPointerPath)}>{Constants.createPointer}</Button>
        </Table.Actions>
        <DataTable
          aria-labelledby="pointers"
          aria-describedby="pointers-subtitle"
          data={props.pointers}
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
              header: 'Points To',
              field: 'pointsToImageDefinitionId',
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
                        <ActionList.Item>{Constants.editPointer}</ActionList.Item>
                        <ActionList.Item variant="danger">{Constants.deletePointer}</ActionList.Item>
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
