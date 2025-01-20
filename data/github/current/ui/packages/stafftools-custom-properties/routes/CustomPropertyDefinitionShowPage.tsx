import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {CustomPropertyDefinitionPayload} from '../types/stafftools-custom-properties-types'
import {CheckIcon, XIcon} from '@primer/octicons-react'
import {Box, Octicon, Link} from '@primer/react'
import {useParams} from 'react-router-dom'
import {PageHeader} from '@primer/react/drafts'
import {customPropertiesDefinitionListPath} from '../paths'

export function CustomPropertyDefinitionShowPage() {
  const {definition} = useRoutePayload<CustomPropertyDefinitionPayload>()
  const {name, description, required, defaultValue, valueType, allowedValues} = definition

  const {org} = useParams()

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', rowGap: 2}}>
      <PageHeader>
        <PageHeader.TitleArea>
          <PageHeader.Title>
            <Box sx={{display: 'flex', gap: 2}}>
              <Link href={customPropertiesDefinitionListPath({org: org!})}>Custom properties</Link> <span>/</span>
              <span>{name}</span>
            </Box>
          </PageHeader.Title>
        </PageHeader.TitleArea>
      </PageHeader>

      <span>
        <strong>Description:</strong> {description}
      </span>
      <span>
        <strong>Value type:</strong> {valueType}
      </span>
      <span>
        <strong>Required:</strong> <Octicon icon={required ? CheckIcon : XIcon} />
      </span>
      {defaultValue && (
        <span>
          <strong>Default value:</strong> {defaultValue}
        </span>
      )}
      {allowedValues && allowedValues.length > 0 && (
        <div>
          <span>
            <strong>Allowed values:</strong>
          </span>
          <Box sx={{display: 'flex', flexDirection: 'column', ml: 2}}>
            {allowedValues.map((value, index) => (
              <span key={index}>{value}</span>
            ))}
          </Box>
        </div>
      )}
    </Box>
  )
}
