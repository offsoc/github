import {getControlLabel} from '@github-ui/custom-properties-editing'
import type {
  BusinessInfo,
  OrgCustomPropertiesDefinitionsPagePayload,
  PropertyDefinitionWithSourceType,
} from '@github-ui/custom-properties-types'
import {ListView} from '@github-ui/list-view'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemDescriptionItem} from '@github-ui/list-view/ListItemDescriptionItem'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {enterprisePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ShieldLockIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, Box, Link as PrimerLink, Text, Truncate} from '@primer/react'
import {createRef, useState} from 'react'

import {definitionTypeLabels} from '../helpers/definition-type-labels'
import {useEditPropertyPath} from '../hooks/use-property-details-paths'
import {usePropertySource} from '../hooks/use-property-source'
import {DeleteDefinitionDialog} from './DeleteDefinitionDialog'
import {EmptyState} from './EmptyState'
import {PropertiesHeaderPageTabs} from './PropertiesHeaderPageTabs'

export function DefinitionsPage() {
  const {definitions, permissions, business} = useRoutePayload<OrgCustomPropertiesDefinitionsPagePayload>()

  return (
    <>
      <PropertiesHeaderPageTabs permissions={permissions} definitions={definitions} />
      <DefinitionsList definitions={definitions} business={business} />
    </>
  )
}

export function DefinitionsList({
  definitions,
  business,
}: {
  definitions: PropertyDefinitionWithSourceType[]
  business?: BusinessInfo
}) {
  if (definitions.length === 0) {
    return <EmptyState>No properties have been added</EmptyState>
  }

  return (
    <Box
      data-hpc
      sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}}
      data-testid="repos-definitions-list"
    >
      <ListView
        title="Property definitions"
        metadata={
          <ListViewMetadata
            className="rounded-top-2"
            title={
              <Text sx={{fontWeight: 'bold'}}>
                {definitions.length} {definitions.length === 1 ? 'property' : 'properties'}
              </Text>
            }
          />
        }
      >
        {definitions.map(definition => (
          <DefinitionListItem key={definition.propertyName} definition={definition} business={business} />
        ))}
      </ListView>
    </Box>
  )
}

interface DefinitionListItemProps {
  definition: PropertyDefinitionWithSourceType
  business?: BusinessInfo
}

function DefinitionListItem({definition, business}: DefinitionListItemProps) {
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
  const editPropertyPath = useEditPropertyPath(definition.propertyName)
  const isDangerZoneEnabled = useFeatureFlag('custom_properties_danger_zone')
  const {settingsLevel} = usePropertySource()

  const contextMenuButtonRef = createRef<HTMLButtonElement>()

  function closeDeleteDialog() {
    setDeleteDialogIsOpen(false)
    contextMenuButtonRef.current?.focus()
  }

  return (
    <>
      <ListItem
        sx={{gap: 0, pl: 2}}
        title={
          <ListItemTitle
            value={getControlLabel(definition)}
            containerSx={{
              display: 'flex',
              flexFlow: 'row',
              alignItems: 'baseline',
              mx: 2,
            }}
            href="#"
            linkProps={{
              as: Link,
              to: editPropertyPath,
            }}
          />
        }
        metadata={
          <ListItemMetadata variant="secondary" alignment="right" sx={{pl: 1}}>
            <Box sx={{display: 'flex', gap: 5}}>
              {definition.sourceType === 'business' && business && settingsLevel === 'org' && (
                <Box sx={{display: 'inline'}} data-testid={`${definition.propertyName}-managed-by-label`}>
                  <Text sx={{color: 'fg.subtle'}}>
                    <ShieldLockIcon size={'small'} /> Managed by{' '}
                  </Text>
                  <PrimerLink inline href={enterprisePath({slug: business.slug})}>
                    <Truncate title={business.name}>{business.name}</Truncate>
                  </PrimerLink>
                </Box>
              )}
              <Text sx={{display: ['none', 'flex'], whiteSpace: 'nowrap', width: '82px'}}>
                {definitionTypeLabels[definition.valueType] || ''}
              </Text>
            </Box>
          </ListItemMetadata>
        }
        metadataContainerSx={isDangerZoneEnabled ? undefined : {pr: 0}}
        secondaryActions={
          isDangerZoneEnabled ? undefined : (
            <ListItemActionBar
              anchorRef={contextMenuButtonRef}
              staticMenuActions={[
                {
                  key: 'delete',
                  render: () => (
                    <ActionList.Item variant="danger" onSelect={() => setDeleteDialogIsOpen(true)}>
                      <ActionList.LeadingVisual>
                        <TrashIcon />
                      </ActionList.LeadingVisual>
                      Delete
                    </ActionList.Item>
                  ),
                },
              ]}
            />
          )
        }
      >
        <ListItemMainContent>
          {definition.description && (
            <ListItemDescription
              sx={{
                minWidth: 0,
                maxWidth: '100%',
                display: 'flex',
              }}
            >
              <ListItemDescriptionItem
                sx={{
                  display: 'block',
                  ml: 2,
                }}
              >
                {definition.description}
              </ListItemDescriptionItem>
            </ListItemDescription>
          )}
        </ListItemMainContent>
      </ListItem>

      {deleteDialogIsOpen && (
        <DeleteDefinitionDialog definition={definition} onCancel={closeDeleteDialog} onDismiss={closeDeleteDialog} />
      )}
    </>
  )
}
