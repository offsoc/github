import type {CustomPropertyDetailsPagePayload, PropertyDefinition} from '@github-ui/custom-properties-types'
import {propertyDefinitionSettingsPath} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Breadcrumbs, Button, Link as PrimerLink} from '@primer/react'
import {Banner} from '@primer/react/experimental'
import {createRef, useState} from 'react'

import {ServerErrorFormBanner} from '../components/Banners'
import {DefinitionDangerZone} from '../components/DefinitionDangerZone'
import {DeleteDefinitionDialog} from '../components/DeleteDefinitionDialog'
import {PropertyPageHeader} from '../components/PageHeader'
import {PropertyDefinitionSettings} from '../components/PropertyDefinitionSettings'
import {ReadOnlyPropertyDefinitionSettings} from '../components/ReadOnlyPropertyDefinitionSettings'
import {useListPropertiesPath} from '../hooks/use-properties-paths'
import {usePropertySource} from '../hooks/use-property-source'

export function CustomPropertyDetailsPage() {
  const {propertyNames, definition, business} = useRoutePayload<CustomPropertyDetailsPagePayload>()
  const [formError, setFormError] = useState('')
  const {settingsLevel} = usePropertySource()
  const [isEditing, setEditing] = useState(!definition)
  const canEdit = !!definition && settingsLevel === definition.sourceType

  const isDangerZoneEnabled = useFeatureFlag('custom_properties_danger_zone')

  return (
    <>
      {formError && (
        <Box sx={{mb: 3}}>
          <ServerErrorFormBanner>{formError}</ServerErrorFormBanner>
        </Box>
      )}

      <Header definition={definition} canEdit={canEdit} isEditing={isEditing} onEditClick={() => setEditing(true)} />

      {settingsLevel === 'org' && business && definition?.sourceType === 'business' && (
        <Banner className="mb-3 mt-2" title="Read only definition" hideTitle>
          <span>
            {`This property is managed by ${business.name}. `}
            <PrimerLink
              inline
              href={propertyDefinitionSettingsPath({
                pathPrefix: 'enterprises',
                sourceName: business.slug,
                propertyName: definition.propertyName,
              })}
            >
              View in Enterprise settings
            </PrimerLink>
          </span>
        </Banner>
      )}

      {isDangerZoneEnabled && definition && !isEditing ? (
        <>
          <div className="mt-3">
            <ReadOnlyPropertyDefinitionSettings definition={definition} />
            <div className="mt-4">
              <DefinitionDangerZone definition={definition} />
            </div>
          </div>
        </>
      ) : (
        <Box
          sx={{
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'border.default',
            marginTop: 'var(--base-size-12)',
            paddingTop: 3,
          }}
        >
          <PropertyDefinitionSettings
            definition={definition}
            existingPropertyNames={propertyNames}
            setFormError={setFormError}
          />
        </Box>
      )}
    </>
  )
}

interface HeaderProps {
  definition?: PropertyDefinition
  canEdit: boolean
  isEditing: boolean
  onEditClick(): void
}

function Header({definition, canEdit, isEditing, onEditClick}: HeaderProps) {
  const definitionsListPath = useListPropertiesPath()
  const buttonRef = createRef<HTMLButtonElement>()
  const isDangerZoneEnabled = useFeatureFlag('custom_properties_danger_zone')
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)

  function closeDeleteDialog() {
    setDeleteDialogIsOpen(false)
    buttonRef.current?.focus()
  }

  return (
    <>
      <Breadcrumbs sx={{marginBottom: 2}}>
        <Breadcrumbs.Item href={definitionsListPath}>Custom properties</Breadcrumbs.Item>
        <Breadcrumbs.Item selected>{definition?.propertyName || 'New property'}</Breadcrumbs.Item>
      </Breadcrumbs>
      <PropertyPageHeader
        title={<div>{definition?.propertyName || 'New property'}</div>}
        actions={
          definition &&
          (isDangerZoneEnabled ? (
            canEdit &&
            !isEditing && (
              <Button ref={buttonRef} sx={{ml: 3}} onClick={onEditClick}>
                Edit
              </Button>
            )
          ) : (
            <Button ref={buttonRef} variant="danger" sx={{ml: 3}} onClick={() => setDeleteDialogIsOpen(true)}>
              Delete property
            </Button>
          ))
        }
      />
      {definition && deleteDialogIsOpen && (
        <DeleteDefinitionDialog definition={definition} onCancel={closeDeleteDialog} onDismiss={closeDeleteDialog} />
      )}
    </>
  )
}
