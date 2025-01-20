import {findRouteBestMatchByPath} from '../client/routes'

describe('findRouteBestMatchByPath', () => {
  const matchTestCases = [
    {
      providedPath: '/orgs/github/projects/1/views/10',
      expectedRoute: '/:ownerType/:ownerIdentifier/projects/:projectNumber/views/:viewNumber',
    },
    {
      providedPath: '/orgs/github/projects/1/insights',
      expectedRoute: '/:ownerType/:ownerIdentifier/projects/:projectNumber/insights',
    },
    {
      providedPath: '/orgs/github/projects/1/settings/access',
      expectedRoute: '/:ownerType/:ownerIdentifier/projects/:projectNumber/settings/access',
    },
  ]

  it.each(matchTestCases)(
    'getBestMatch returns the template route: $expectedRoute for the real path: $providedPath',
    ({expectedRoute, providedPath}) => {
      // Act
      const routeResult = findRouteBestMatchByPath(providedPath)

      // Assert
      expect(routeResult).not.toBeNull()
      expect(expectedRoute).toMatch(routeResult!.path)
    },
  )

  // NOTE: the match method doesn't take types in consideration, so /:project-number is
  // a greedy match and will return against paths starting with /
  const notFoundTemplateRouteTestCases = ['', '/dummy/path', 'invalid format']
  it.each(notFoundTemplateRouteTestCases)('getBestMatch returns null if a real path has not match %s', providedPath => {
    // Act
    const routeResult = findRouteBestMatchByPath(providedPath)

    // Assert
    expect(routeResult).toBeNull()
  })
})
