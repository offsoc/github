import type {PropertyDefinition, RepoPropertiesPagePayload} from '@github-ui/custom-properties-types'
import {repositoryPropertiesSettingsPath} from '@github-ui/paths'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Link, PageLayout} from '@primer/react'
import {useMemo} from 'react'

import {PropertyPageHeader} from '../components/PageHeader'
import {RepoPropertiesList} from '../components/RepoPropertiesList'
import {CurrentOrgRepoProvider, useCurrentOrg, useCurrentRepo} from '../contexts/CurrentOrgRepoContext'

export function RepoCustomPropertiesPage() {
  const {values, definitions, canEditProperties} = useRoutePayload<RepoPropertiesPagePayload>()

  const displayedDefinitions = useMemo(() => {
    return definitions.reduce<PropertyDefinition[]>((acc, definition) => {
      const value = values[definition.propertyName]
      if (value) {
        acc.push(definition)
      }

      return acc
    }, [])
  }, [definitions, values])

  return (
    <CurrentOrgRepoProvider>
      <PageLayout rowGap="none">
        <PageLayout.Header>
          <Header canEditProperties={canEditProperties} />
        </PageLayout.Header>

        <PageLayout.Content>
          <RepoPropertiesList definitions={displayedDefinitions} values={values} />
        </PageLayout.Content>
      </PageLayout>
    </CurrentOrgRepoProvider>
  )
}

function Header({canEditProperties}: {canEditProperties: boolean}) {
  const org = useCurrentOrg().login
  const repo = useCurrentRepo().name

  return (
    <PropertyPageHeader
      title="Custom properties"
      subtitle={
        <>
          Custom properties allow you to decorate your repository with information such as compliance frameworks, data
          sensitivity, or project details.
          {canEditProperties && (
            <>
              {' '}
              <Link href={repositoryPropertiesSettingsPath({org, repo})}>Edit properties in repository settings.</Link>
            </>
          )}
        </>
      }
    />
  )
}
