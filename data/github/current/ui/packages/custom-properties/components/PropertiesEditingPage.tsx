import {debounce} from '@github/mini-throttle'
import {announce} from '@github-ui/aria-live'
import {CustomPropertyValuesTable} from '@github-ui/custom-properties-editing'
import {
  propertyFieldsToChangedPropertiesMap,
  useEditCustomProperties,
} from '@github-ui/custom-properties-editing/use-edit-custom-properties'
import type {PropertyDefinition, Repository} from '@github-ui/custom-properties-types'
import {updateOrgPropertyValuesPath} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import sudo from '@github-ui/sudo'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {SearchIcon} from '@primer/octicons-react'
import {Box, Button, TextInput, useConfirm} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {useEffect, useMemo, useState} from 'react'

import {useCurrentOrg} from '../contexts/CurrentOrgRepoContext'
import {ServerErrorFormBanner} from './Banners'

const debounceAnnouncement = debounce(announce, 300)

export function PropertiesEditingPage({
  editingRepos,
  onClose,
  editableProperties,
  definitions,
  onSuccess,
  renderPageHeader,
  actionLabels = {save: 'Save', cancel: 'Cancel'},
}: {
  editableProperties: string[]
  editingRepos: Repository[]
  onClose: () => void
  definitions: PropertyDefinition[]
  onSuccess: () => void
  renderPageHeader: ({canClose}: {canClose: () => Promise<boolean>}) => JSX.Element
  actionLabels?: {save?: string; cancel?: string}
}) {
  const propertiesOverlayEditorEnabled = useFeatureFlag('custom_properties_edit_modal')
  const {propertyValuesMap, setPropertyValue, revertPropertyValue, discardChanges, commitChanges} =
    useEditCustomProperties(
      editingRepos.map(r => r.properties || {}),
      definitions,
    )
  const editableDefinitions = useMemo(
    () => definitions.filter(({propertyName}) => editableProperties.includes(propertyName)),
    [definitions, editableProperties],
  )

  const [submitting, setSubmitting] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const org = useCurrentOrg()
  const confirm = useConfirm()

  const hasUnsavedChanges = useMemo(() => Object.values(propertyValuesMap).some(p => p.changed), [propertyValuesMap])
  useNavigateAwayDiscardConfirmation(hasUnsavedChanges)

  const canClose = async () => {
    if (hasUnsavedChanges) {
      return confirm({
        title: 'Discard changes?',
        content: 'You have unsaved changes. Are you sure you want to discard them?',
        cancelButtonContent: 'Keep editing',
        confirmButtonContent: 'Discard',
        confirmButtonType: 'danger',
      })
    } else {
      return true
    }
  }
  const discardWithConfirmation = async () => {
    if (hasUnsavedChanges) {
      if (await canClose()) {
        discardChanges()
        onClose()
      }
    } else {
      onClose()
    }
  }

  const onSubmit = async () => {
    setErrorMessage('')
    if (submitting) {
      return
    }

    if (Object.values(propertyValuesMap).some(p => !!p.error)) {
      return
    }

    setSubmitting(true)

    const changedProperties = propertyFieldsToChangedPropertiesMap(definitions, propertyValuesMap)
    if (Object.keys(changedProperties).length) {
      if (!(await sudo())) {
        setSubmitting(false)
        setErrorMessage('Unauthorized')
        return
      }

      const repoIds = editingRepos.map(repo => repo.id)
      try {
        const result = await verifiedFetchJSON(updateOrgPropertyValuesPath({org: org.login}), {
          method: 'POST',
          body: {
            repoIds,
            properties: changedProperties,
          },
        })
        if (result.ok) {
          commitChanges()
          onSuccess()
        } else {
          const {error} = await result.json()
          setErrorMessage(error)
        }
      } catch {
        setErrorMessage('Failed to update properties')
      }
    } else {
      onClose()
    }

    setSubmitting(false)
  }

  const filteredDefinitions = definitions.filter(({propertyName}) =>
    propertyName.toLowerCase().includes(filterText.toLowerCase()),
  )

  useEffect(() => {
    const resultsFound = filteredDefinitions.length
    if (resultsFound === 1) {
      debounceAnnouncement('1 result found')
    } else {
      debounceAnnouncement(`${resultsFound} results found`)
    }
  }, [filteredDefinitions])

  if (!editingRepos.length) {
    return null
  }

  return (
    <>
      {errorMessage && (
        <Box sx={{mb: 3}}>
          <ServerErrorFormBanner>{errorMessage}</ServerErrorFormBanner>
        </Box>
      )}

      {renderPageHeader({canClose})}

      <Box as="form" sx={{display: 'flex', flexDirection: 'column', gap: 3}} data-testid="properties-editing-page">
        <TextInput
          block
          leadingVisual={SearchIcon}
          placeholder="Filter properties"
          aria-label="Filter properties"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />

        {filteredDefinitions.length === 0 ? (
          <Blankslate border>
            <Blankslate.Heading>No properties that match</Blankslate.Heading>
          </Blankslate>
        ) : (
          <CustomPropertyValuesTable
            definitions={filteredDefinitions}
            editableDefinitions={editableDefinitions}
            propertyValuesMap={propertyValuesMap}
            setPropertyValue={setPropertyValue}
            revertPropertyValue={revertPropertyValue}
            orgName={org.login}
            propertiesOverlayEditorEnabled={propertiesOverlayEditorEnabled}
          />
        )}

        <Box sx={{display: 'flex', gap: 2}}>
          {actionLabels.save && (
            <Button type="button" onClick={onSubmit} variant="primary">
              {actionLabels.save}
            </Button>
          )}

          {actionLabels.cancel && (
            <Button type="button" onClick={discardWithConfirmation} variant="default">
              {actionLabels.cancel}
            </Button>
          )}
        </Box>
      </Box>
    </>
  )
}

function useNavigateAwayDiscardConfirmation(hasUnsavedChanges: boolean) {
  useEffect(() => {
    document.body.setAttribute('data-turbo', 'false')
    window.onbeforeunload = hasUnsavedChanges
      ? e => {
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave this page?'
        }
      : null

    return () => {
      document.body.removeAttribute('data-turbo')
      window.onbeforeunload = null
    }
  }, [hasUnsavedChanges])
}
