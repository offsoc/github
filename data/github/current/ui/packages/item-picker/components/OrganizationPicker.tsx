import {GitHubAvatar} from '@github-ui/github-avatar'
import {TriangleDownIcon} from '@primer/octicons-react'
import {Button, FormControl, Text} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {graphql, type PreloadedQuery, readInlineData, usePaginationFragment, usePreloadedQuery} from 'react-relay'

import {VALUES} from '../constants/values'
import {LABELS} from '../constants/labels'
import type {OrganizationListPaginationQuery} from './__generated__/OrganizationListPaginationQuery.graphql'
import type {
  OrganizationPickerOrganization$data,
  OrganizationPickerOrganization$key,
} from './__generated__/OrganizationPickerOrganization.graphql'
import type {OrganizationPickerOrganizationsPaginated$key} from './__generated__/OrganizationPickerOrganizationsPaginated.graphql'
import type {OrganizationPickerQuery} from './__generated__/OrganizationPickerQuery.graphql'
import {type ExtendedItemProps, ItemPicker} from './ItemPicker'

type Organization = OrganizationPickerOrganization$data

type OrganizationlPickerProps = {
  organizationQueryRef: PreloadedQuery<OrganizationPickerQuery>
  organization: Organization | undefined
}

type OrganizationlPickerInternalProps = Omit<OrganizationlPickerProps, 'organizationQueryRef'> & {
  organizationQueryRef: OrganizationPickerOrganizationsPaginated$key
  onSelectionChange: (organization: Organization[]) => void
}

export const OrganizationPickerGraphqlQuery = graphql`
  query OrganizationPickerQuery {
    viewer {
      ...OrganizationPickerOrganizationsPaginated
    }
  }
`

const orgnizationFragment = graphql`
  fragment OrganizationPickerOrganization on Organization @inline {
    id
    avatarUrl
    name
  }
`

export function OrganizationPicker({
  organizationQueryRef,
  ...rest
}: OrganizationlPickerProps & {onSelectionChange: (organization: Organization[]) => void}) {
  const preloadedData = usePreloadedQuery<OrganizationPickerQuery>(OrganizationPickerGraphqlQuery, organizationQueryRef)
  return preloadedData.viewer ? (
    <OrganizationPickerInternalBase organizationQueryRef={preloadedData.viewer} {...rest} />
  ) : null
}

function OrganizationPickerInternalBase({
  organizationQueryRef,
  organization,
  onSelectionChange,
}: OrganizationlPickerInternalProps) {
  const [filter, setFilter] = useState('')

  const {data, loadNext, isLoadingNext, hasNext} = usePaginationFragment<
    OrganizationListPaginationQuery,
    OrganizationPickerOrganizationsPaginated$key
  >(
    graphql`
      fragment OrganizationPickerOrganizationsPaginated on User
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 100})
      @refetchable(queryName: "OrganizationListPaginationQuery") {
        organizations(first: $count, after: $cursor) @connection(key: "Viewer_organizations") {
          edges {
            node {
              ...OrganizationPickerOrganization
            }
          }
          totalCount
        }
      }
    `,
    organizationQueryRef,
  )
  const totalNumberOfOrganizations = data.organizations?.totalCount || 0

  const fetchedOrganizations = (data.organizations?.edges || []).flatMap(a =>
    // eslint-disable-next-line no-restricted-syntax
    a?.node ? [readInlineData<OrganizationPickerOrganization$key>(orgnizationFragment, a.node)] : [],
  )

  useEffect(() => {
    if (hasNext && !isLoadingNext && fetchedOrganizations.length < VALUES.organizationsMaxPreloadCount) {
      loadNext(VALUES.organizationsPageSize)
    }
  }, [loadNext, totalNumberOfOrganizations, hasNext, isLoadingNext, fetchedOrganizations.length])

  const items = useMemo(() => {
    if (!filter) return fetchedOrganizations
    return fetchedOrganizations.filter(l => l.name!.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
  }, [fetchedOrganizations, filter])

  // automatically select the first org
  if (!organization && items.length > 0) {
    onSelectionChange([items[0]!])
  }

  function onFilter(value: string) {
    setFilter(value)
  }

  return (
    <OrganizationPickerBase
      items={items}
      initialSelectedItem={organization}
      onFilter={onFilter}
      onSelectionChange={onSelectionChange}
    />
  )
}

interface OrganizationPickerBaseProps {
  items: Organization[]
  initialSelectedItem?: Organization
  onFilter: (value: string) => void
  onSelectionChange: (organization: Organization[]) => void
}

export function OrganizationPickerBase({
  items,
  initialSelectedItem,
  onFilter,
  onSelectionChange,
}: OrganizationPickerBaseProps) {
  const filterItems = useCallback(
    (value: string) => {
      onFilter(value)
    },
    [onFilter],
  )

  const getItemKey = useCallback((o: Organization) => o.id, [])

  const convertToItemProps = useCallback(
    (org: Organization): ExtendedItemProps<Organization> => ({
      id: org.id,
      children: <span>{org.name}</span>,
      source: org,
      leadingVisual: () => <GitHubAvatar src={org.avatarUrl} />,
    }),
    [],
  )

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => (
      <Button trailingVisual={TriangleDownIcon} {...anchorProps}>
        {initialSelectedItem ? (
          <>
            <GitHubAvatar src={initialSelectedItem.avatarUrl} />
            <Text sx={{marginLeft: 16}}>{initialSelectedItem.name}</Text>
          </>
        ) : (
          'Select an organization'
        )}
      </Button>
    ),
    [initialSelectedItem],
  )

  return (
    <FormControl>
      <FormControl.Label>{LABELS.organizationLabel}</FormControl.Label>
      <ItemPicker
        renderAnchor={renderAnchor}
        items={items}
        initialSelectedItems={initialSelectedItem ? [initialSelectedItem] : []}
        filterItems={filterItems}
        getItemKey={getItemKey}
        convertToItemProps={convertToItemProps}
        placeholderText={LABELS.filterOrganizations}
        selectionVariant="single"
        onSelectionChange={onSelectionChange}
        resultListAriaLabel={'Organization results'}
      />
    </FormControl>
  )
}
