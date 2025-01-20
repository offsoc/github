import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Box, Heading} from '@primer/react'
import {useEffect, useState} from 'react'
import {useQueryLoader} from 'react-relay'

import {ResourceType} from '../../enums/cost-centers'
import {Fonts, Spacing} from '../../utils/style'

import {ErrorBanner} from '../common/ErrorBanner'
import {OrganizationPicker, OrganizationPickerRecentQuery} from '../pickers/OrganizationPicker'
import type {OrganizationPickerRecentQuery as OrganizationPickerQueryType} from '../pickers/__generated__/OrganizationPickerRecentQuery.graphql'
import {RepositoryPicker, RepositoryPickerRecentQuery} from '../pickers/RepositoryPicker'
import type {RepositoryPickerRecentQuery as RepositoryPickerQueryType} from '../pickers/__generated__/RepositoryPickerRecentQuery.graphql'

import type {Customer} from '../../types/common'
import type {CostCenterPicker, Resource} from '../../types/cost-centers'
import {PickerLoadingSkeleton} from '../pickers/PickerLoadingSkeleton'

interface Props {
  customer: Customer
  resources: Resource[]
  setCostCenterResources: (resources: Resource[]) => void
  // Optionally disable the org or repo picker or both
  disablePicker?: CostCenterPicker[]
  // Optionally display the resource selector in view-only mode
  viewOnly?: boolean
}

export function CostCenterResourceSelector({
  customer,
  resources,
  setCostCenterResources,
  disablePicker,
  viewOnly = false,
}: Props) {
  const [loadOrgsError, setLoadOrgsError] = useState<Error>()
  const [loadReposError, setLoadReposError] = useState<Error>()

  function handleOrgsGQLError(e: Error) {
    setLoadOrgsError(e)
  }

  function handleReposGQLError(e: Error) {
    setLoadReposError(e)
  }

  function useFetchOrganizations() {
    const [organizationsRef, loadOrganizations, disposeOrganizationsRef] =
      useQueryLoader<OrganizationPickerQueryType>(OrganizationPickerRecentQuery)
    useEffect(() => {
      if (!disablePicker?.includes('org')) {
        loadOrganizations({slug: customer.displayId, query: null}, {fetchPolicy: 'store-or-network'})
      }

      return () => disposeOrganizationsRef()
    }, [loadOrganizations, disposeOrganizationsRef])
    return organizationsRef
  }

  function useFetchRepositories() {
    const [repositoriesRef, loadRepositories, disposeRepositoriesRef] =
      useQueryLoader<RepositoryPickerQueryType>(RepositoryPickerRecentQuery)
    useEffect(() => {
      if (!disablePicker?.includes('repo')) {
        loadRepositories({slug: customer.displayId}, {fetchPolicy: 'store-or-network'})
      }
      return () => {
        disposeRepositoriesRef()
      }
    }, [loadRepositories, disposeRepositoriesRef])
    return repositoriesRef
  }

  const organizationsRef = useFetchOrganizations()
  const repositoriesRef = useFetchRepositories()

  const resourceByOrg = resources.filter(resource => resource.type === ResourceType.Org).map(resource => resource.id)
  const resourceByRepo = resources.filter(resource => resource.type === ResourceType.Repo).map(resource => resource.id)

  const filterByType = (selectedIds: string[], type: ResourceType) => {
    const tmp = resources.filter(item => item.type !== type)
    const newResources = selectedIds.map(item => {
      const resource: Resource = {type, id: String(item)}
      return resource
    })
    setCostCenterResources(tmp.concat(newResources))
  }

  const setOrgIds = (orgs: string[]) => {
    filterByType(orgs, ResourceType.Org)
  }

  const setRepoIds = (orgs: string[]) => {
    filterByType(orgs, ResourceType.Repo)
  }

  const resourcePickerStyle = {
    mb: Spacing.CardMargin,
    p: 3,
  }

  return (
    <Box sx={{mb: Spacing.CardMargin}}>
      <Box sx={{mb: 2}}>
        <Heading as="h3" sx={{fontSize: Fonts.SectionHeadingFontSize}}>
          Resources
        </Heading>
        {!viewOnly && <span>Set the resources that will be a part of this cost center.</span>}
      </Box>

      {!disablePicker?.includes('org') && (
        <Box className="Box" data-testid="org-picker-wrapper" sx={resourcePickerStyle}>
          <ErrorBoundary onError={handleOrgsGQLError}>
            {organizationsRef ? (
              <OrganizationPicker
                slug={customer.displayId}
                preloadedOrganizationsRef={organizationsRef}
                setSelectedItems={setOrgIds}
                initialSelectedItemIds={resourceByOrg}
                selectionVariant="multiple"
                indent={false}
                entityType="cost center"
                viewOnly={viewOnly}
              />
            ) : (
              <PickerLoadingSkeleton title="Organizations" totalCount={resourceByOrg.length} viewOnly={viewOnly} />
            )}
          </ErrorBoundary>
          {loadOrgsError && <ErrorBanner message={loadOrgsError.cause as string} sx={{mt: 2, mb: 0}} />}
        </Box>
      )}
      {!disablePicker?.includes('repo') && (
        <Box className="Box" data-testid="repo-picker-wrapper" sx={resourcePickerStyle}>
          <ErrorBoundary onError={handleReposGQLError}>
            {repositoriesRef ? (
              <RepositoryPicker
                slug={customer.displayId}
                preloadedRepositoriesRef={repositoriesRef}
                setSelectedItems={setRepoIds}
                initialSelectedItemIds={resourceByRepo}
                selectionVariant="multiple"
                indent={false}
                entityType="cost center"
                viewOnly={viewOnly}
              />
            ) : (
              <PickerLoadingSkeleton title="Repositories" totalCount={resourceByRepo.length} viewOnly={viewOnly} />
            )}
          </ErrorBoundary>
          {loadReposError && <ErrorBanner message={loadReposError.cause as string} sx={{mt: 2, mb: 0}} />}
        </Box>
      )}
    </Box>
  )
}
