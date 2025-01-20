import type {AzureEmission} from '../../types/azure-emissions'
import {DataTable, Table} from '@primer/react/drafts'

interface AzureEmissionTableProps {
  azureEmissions: AzureEmission[]
}

export default function AzureEmissionTable({azureEmissions}: AzureEmissionTableProps) {
  return (
    <Table.Container data-testid="azure-emission-table">
      <DataTable
        aria-labelledby="azure-emissions"
        aria-describedby="azure-emissions-subtitle"
        data-testid="azure-emission-table"
        data={azureEmissions}
        columns={[
          {
            header: 'Azure Emission Time',
            rowHeader: true,
            field: 'emissionDate',
          },
          {
            header: 'Sku',
            field: 'sku',
            renderCell: row => {
              return row.sku
            },
          },
          {
            header: 'Azure Storage Table Partition Key',
            field: 'azurePartitionKey',
            renderCell: row => {
              return row.azurePartitionKey
            },
          },
          {
            header: 'Quantity',
            field: 'quantity',
            renderCell: row => {
              return row.quantity
            },
          },
        ]}
      />
    </Table.Container>
  )
}
