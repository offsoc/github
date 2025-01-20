import type {ImageVersion} from '../types'
import {ActionList, ActionMenu, IconButton} from '@primer/react'
import {CheckCircleIcon, XCircleIcon, KebabHorizontalIcon, LinkExternalIcon} from '@primer/octicons-react'
import {DataTable, Table} from '@primer/react/experimental'
import VisuallyHidden from '@primer/react/lib-esm/_VisuallyHidden'
import {useState, useRef} from 'react'
import {StateDetailsDialog} from './StateDetailsDialog'

interface ICuratedImageVersionsTableProps {
  imageVersions: ImageVersion[]
}

export function CuratedImageVersionsTable(props: ICuratedImageVersionsTableProps) {
  const [isOpen, setIsOpen] = useState(false)
  const returnFocusRef = useRef(null)
  return (
    <Table.Container>
      <DataTable
        data={props.imageVersions.map((imageVersion, index) => ({...imageVersion, id: index}))}
        columns={[
          {
            header: 'Version',
            field: 'version',
            rowHeader: true,
          },
          {
            header: 'State',
            field: 'state',
          },
          {
            header: 'State Details',
            field: 'stateDetails',
            renderCell: row => {
              return (
                <>
                  {row.stateDetails !== '' && (
                    <IconButton
                      icon={LinkExternalIcon}
                      aria-label="State details"
                      onClick={() => setIsOpen(true)}
                      ref={returnFocusRef}
                      variant="invisible"
                    />
                  )}
                  {isOpen && (
                    <StateDetailsDialog
                      stateDetails={row.stateDetails}
                      showStateDetailsDialog={isOpen}
                      setShowStateDetailsDialog={setIsOpen}
                      returnFocusRef={returnFocusRef}
                    />
                  )}
                </>
              )
            },
          },
          {
            header: 'Size GB',
            field: 'sizeGb',
          },
          {
            header: 'Enabled',
            field: 'enabled',
            renderCell: row => {
              return row.enabled ? <CheckCircleIcon size={16} /> : <XCircleIcon size={16} />
            },
          },
          {
            id: 'actions',
            header: () => <VisuallyHidden>Actions</VisuallyHidden>,
            renderCell: row => {
              return (
                <ActionMenu>
                  <ActionMenu.Anchor>
                    <IconButton
                      aria-label={`Actions: ${row.version}`}
                      title={`Actions: ${row.version}`}
                      icon={KebabHorizontalIcon}
                      variant="invisible"
                    />
                  </ActionMenu.Anchor>
                  <ActionMenu.Overlay>
                    <ActionList>
                      <ActionList.Item>{row.enabled ? 'Disable' : 'Enable'}</ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              )
            },
          },
        ]}
      />
    </Table.Container>
  )
}
