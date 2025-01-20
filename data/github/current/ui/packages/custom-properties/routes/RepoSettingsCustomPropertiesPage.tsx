import type {PropertyValuesRecord, RepoSettingsPropertiesPagePayload} from '@github-ui/custom-properties-types'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useNavigate} from '@github-ui/use-navigate'
import {useMemo} from 'react'

import {PropertyPageHeader} from '../components/PageHeader'
import {PropertiesEditingPage} from '../components/PropertiesEditingPage'
import {CurrentOrgRepoProvider} from '../contexts/CurrentOrgRepoContext'
import {useSetFlash} from '../contexts/FlashContext'

export function RepoSettingsCustomPropertiesPage() {
  const setFlash = useSetFlash()
  const navigate = useNavigate()
  const {
    definitions,
    currentRepo,
    editableProperties: editablePropertyNames,
  } = useRoutePayload<RepoSettingsPropertiesPagePayload>()

  const editablePropertyNamesSet = useMemo(() => new Set(editablePropertyNames), [editablePropertyNames])
  const editableDefinitions = useMemo(
    () => definitions.filter(({propertyName}) => editablePropertyNamesSet.has(propertyName)),
    [definitions, editablePropertyNamesSet],
  )
  const editableProperties = useMemo(() => {
    const values: PropertyValuesRecord = currentRepo.properties || {}
    return editableDefinitions.reduce<PropertyValuesRecord>(
      (acc, {propertyName}) => Object.assign(acc, {[propertyName]: values[propertyName]}),
      {},
    )
  }, [editableDefinitions, currentRepo])

  const canEdit = Object.keys(editableProperties).length > 0

  return (
    <CurrentOrgRepoProvider>
      <PropertiesEditingPage
        editingRepos={[currentRepo]}
        definitions={definitions}
        editableProperties={editablePropertyNames}
        onSuccess={() => {
          setFlash('repos.properties.updated')
          navigate(window.location)
        }}
        onClose={() => {}}
        actionLabels={canEdit ? {save: 'Save', cancel: 'Discard'} : {}}
        renderPageHeader={() => <Header />}
      />
    </CurrentOrgRepoProvider>
  )
}

function Header() {
  return (
    <PropertyPageHeader
      title="Custom properties"
      subtitle="Custom properties allow you to decorate your repository with information such as compliance frameworks, data sensitivity, or project details."
    />
  )
}
