import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Link} from '@primer/react'
import {DataTable, Blankslate} from '@primer/react/drafts'
import {useParams} from 'react-router-dom'
import {customPropertyDefinitionDetailsPath} from '../paths'

export function RepositoryCustomPropertyValuesIndexPage() {
  const {properties} = useRoutePayload<{properties: Record<string, string>}>()

  const tableData = Object.entries(properties).map(([key, value]) => ({
    id: key,
    property: key,
    value,
  }))

  const {owner} = useParams()

  if (tableData.length === 0) {
    return (
      <Blankslate border={true}>
        <Blankslate.Heading>No properties set in this repository</Blankslate.Heading>
      </Blankslate>
    )
  }

  return (
    <DataTable
      data={tableData}
      columns={[
        {
          header: 'Property',
          field: 'property',
          renderCell: ({property}) => (
            <Link href={customPropertyDefinitionDetailsPath({org: owner!, propertyName: property})}>{property}</Link>
          ),
        },
        {header: 'Value', field: 'value'},
      ]}
    />
  )
}
