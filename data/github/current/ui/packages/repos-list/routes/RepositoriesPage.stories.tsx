import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'

import {getRepositoriesRoutePayload, userInfo} from '../test-utils/mock-data'
import type {RepositoriesPayload} from '../types/repos-list-types'
import {RepositoriesPage} from './RepositoriesPage'

const meta: Meta = {
  title: 'Apps/Repos List/RepositoriesPage',
  decorators: [
    (Story, {parameters}) => (
      <Wrapper routePayload={parameters.routePayload} search={parameters.search}>
        <Story />
      </Wrapper>
    ),
  ],
  parameters: {
    routePayload: getRepositoriesRoutePayload(),
    search: undefined,
  },
}

export default meta

export const Default = () => <RepositoriesPage />

export const UserCannotCreateRepos = () => <RepositoriesPage />

UserCannotCreateRepos.parameters = {
  routePayload: {
    ...getRepositoriesRoutePayload(),
    userInfo: {...userInfo, canCreateRepository: false},
  } as RepositoriesPayload,
}

export const EmptyPublic = () => <RepositoriesPage />

EmptyPublic.parameters = {
  routePayload: {
    ...getRepositoriesRoutePayload(),
    pageCount: 0,
    repositories: [],
    repositoryCount: 0,
  } as RepositoriesPayload,
}

export const EmptyMember = () => <RepositoriesPage />

EmptyMember.parameters = {
  routePayload: {
    ...getRepositoriesRoutePayload(),
    userInfo: {...userInfo, directOrTeamMember: true},
    pageCount: 0,
    repositories: [],
    repositoryCount: 0,
  } as RepositoriesPayload,
}

export const EmptyAdmin = () => <RepositoriesPage />

EmptyAdmin.parameters = {
  routePayload: {
    ...getRepositoriesRoutePayload(),
    userInfo: {...userInfo, admin: true},
    pageCount: 0,
    repositories: [],
    repositoryCount: 0,
  } as RepositoriesPayload,
}

export const EmptyPageTooHigh = () => <RepositoriesPage />

EmptyPageTooHigh.parameters = {
  routePayload: {
    ...getRepositoriesRoutePayload(),
    pageCount: 3,
    repositories: [],
    repositoryCount: 0,
  } as RepositoriesPayload,
  search: '?page=5',
}

export const EmptyNoMatches = () => <RepositoriesPage />

EmptyNoMatches.parameters = {
  routePayload: {
    ...getRepositoriesRoutePayload(),
    pageCount: 0,
    repositories: [],
    repositoryCount: 0,
  } as RepositoriesPayload,
  search: '?q=hola',
}
