import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {DataTable, Blankslate} from '@primer/react/drafts'
import type {CustomPropertyDefinitionSummaryPayload} from '../types/stafftools-custom-properties-types'
import {CheckIcon, XIcon} from '@primer/octicons-react'
import {useParams} from 'react-router-dom'
import {Link, Octicon} from '@primer/react'
import {customPropertyDefinitionDetailsPath} from '../paths'

export function OrganizationDefinitionsIndexPage() {
  const {definitions} = useRoutePayload<CustomPropertyDefinitionSummaryPayload>()

  const tableData = definitions.map(definition => ({
    ...definition,
    id: definition.name,
  }))

  const {org} = useParams()

  if (tableData.length === 0) {
    return (
      <Blankslate border={true}>
        <Blankslate.Heading>No definitions set in this organization</Blankslate.Heading>
      </Blankslate>
    )
  }

  return (
    <DataTable
      data={tableData}
      columns={[
        {
          header: 'Name',
          field: 'name',
          renderCell: ({name}) => (
            <Link href={customPropertyDefinitionDetailsPath({org: org!, propertyName: name})}>{name}</Link>
          ),
        },
        {
          header: 'Required',
          field: 'required',
          renderCell: ({required}) => <Octicon icon={required ? CheckIcon : XIcon} />,
        },
        {header: 'Default value', field: 'defaultValue'},
      ]}
    />
  )
}
