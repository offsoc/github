import type {PropsWithChildren} from 'react'
import {Breadcrumbs, Heading, Pagehead} from '@primer/react'
import {Link} from '@github-ui/react-core/link'
import {useBasePath} from '../contexts/BasePathContext'
import {useReadOnly} from '../contexts/ReadOnlyContext'
import {useOrganization} from '../contexts/OrganizationContext'
import {PAGE} from '../types'

export type LayoutProps = PropsWithChildren<{
  page: PAGE
  name?: string
}>

function GroupBreadcrumbs({page, name}: Pick<LayoutProps, 'page' | 'name'>) {
  const basePath = useBasePath()
  const organization = useOrganization()
  const displayName = page === PAGE.New ? 'New group' : name || organization.name
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item as={Link} to={basePath} selected={page === PAGE.List}>
        Home
      </Breadcrumbs.Item>
      {page !== PAGE.List ? (
        <>
          <Breadcrumbs.Item
            as={Link}
            to={page === PAGE.New ? '' : `${basePath}/${name}`}
            selected={[PAGE.New, PAGE.Show].includes(page)}
          >
            {displayName}
          </Breadcrumbs.Item>
          {page === PAGE.Review ? (
            <Breadcrumbs.Item href={`${basePath}/${name}/review`} selected={page === PAGE.Review}>
              Review changes
            </Breadcrumbs.Item>
          ) : null}
        </>
      ) : null}
    </Breadcrumbs>
  )
}

function Header({page}: Pick<LayoutProps, 'page'>) {
  const readOnly = useReadOnly()

  const TITLES: Record<PAGE, string> = {
    [PAGE.List]: 'Groups',
    [PAGE.New]: 'New group',
    [PAGE.Show]: `${readOnly ? 'View' : 'Edit'} group`,
    [PAGE.Review]: 'Review changes',
  }
  return (
    <Pagehead data-hpc sx={{pb: 2}}>
      <div>
        <Heading as="h2" className="h3">
          {TITLES[page]}
        </Heading>
        {page === PAGE.List ? (
          <span className="color-fg-muted pt-3">
            Manage access and settings for groups of repositories in your organization.
          </span>
        ) : null}
      </div>
    </Pagehead>
  )
}

export function Layout({page, name, children}: LayoutProps) {
  return (
    <>
      <GroupBreadcrumbs page={page} name={name} />
      <Header page={page} />
      {children}
    </>
  )
}
