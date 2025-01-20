import type {AppPayload, Group, ListPayload, NewPayload, ShowPayload} from '../types'

export function getAppPayload(): AppPayload {
  return {
    maxDepth: 6,
    readOnly: false,
    organization: {
      name: 'repos-security',
    },
    isStafftools: false,
    basePath: '/',
    baseAvatarUrl: '/',
  }
}

export function getListRoutePayload(): ListPayload {
  return {
    groups: getGroups(),
  }
}
export function getNewRoutePayload(): NewPayload {
  return {
    isRoot: false,
    groups: getGroups(),
    parentGroup: getGroup(),
  }
}
export function getShowRoutePayload(): ShowPayload {
  return {
    isRoot: false,
    groups: getGroups(),
    group: getGroup(),
  }
}

export function getGroup(): Group {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return getGroups()[2]!
}

export function getGroups(): Group[] {
  return [
    {
      id: 1,
      group_path: '',
      total_count: 100,
      direct_count: 0,
      repos: [{name: 'root', id: 1}],
    },
    {
      id: 2,
      group_path: 'Canada',
      total_count: 30,
      direct_count: 20,
      repos: [{name: 'canada', id: 2}],
    },
    {
      id: 3,
      group_path: 'Canada/blue',
      total_count: 10,
      direct_count: 10,
      repos: [{name: 'canada-blue', id: 3}],
    },
    {
      id: 4,
      group_path: 'USA',
      total_count: 100,
      direct_count: 85,
      repos: [{name: 'usa', id: 4}],
    },
    {
      id: 5,
      group_path: 'USA/green',
      total_count: 15,
      direct_count: 13,
      repos: [{name: 'usa-green', id: 5}],
    },
    {
      id: 6,
      group_path: 'USA/green/fish',
      total_count: 2,
      direct_count: 2,
      repos: [{name: 'usa-green-fish', id: 6}],
    },
    {
      id: 7,
      group_path: 'Mexico',
      total_count: 30,
      direct_count: 30,
      repos: [{name: 'mexico', id: 7}],
    },
  ]
}
