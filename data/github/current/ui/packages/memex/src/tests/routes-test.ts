import {createBaseRoute} from '../client/routes'

const BASE_PATH = '/:ownerType/:ownerIdentifier/projects'
const {baseRoute} = createBaseRoute(BASE_PATH)
const pathToMakeRouteFrom = '/a/path/:for/test'
const route = baseRoute.childRoute(pathToMakeRouteFrom)
const childPathToMakeChildRouteFrom = '/remixed/by/:artist'
const childRoute = route.childRoute(childPathToMakeChildRouteFrom)

test('the path property should match the provided path', () => {
  expect(route.path).toEqual(pathToMakeRouteFrom)
  expect(route.fullPath).toEqual(`${BASE_PATH}${pathToMakeRouteFrom}`)
})

test("a nested route's path should match the full set of paths", () => {
  expect(childRoute.path).toEqual(`${pathToMakeRouteFrom}${childPathToMakeChildRouteFrom}`)
  expect(childRoute.fullPath).toEqual(`${BASE_PATH}${pathToMakeRouteFrom}${childPathToMakeChildRouteFrom}`)
})

test('route pathWithChildPaths should have a trailing wildcard matcher', () => {
  expect(route.pathWithChildPaths).toEqual(`${pathToMakeRouteFrom}/*`)
  expect(childRoute.pathWithChildPaths).toEqual(`${pathToMakeRouteFrom}${childPathToMakeChildRouteFrom}/*`)
})

test('it can generate a path, filling in dynamic segments', () => {
  expect(route.generatePath({for: 'called'})).toEqual('/a/path/called/test')
})

test('it can generate a child path, filling in dynamic segments', () => {
  expect(childRoute.generatePath({for: 'called', artist: 'weird-al'})).toEqual(
    '/a/path/called/test/remixed/by/weird-al',
  )
})

test('can match a path name with base path segments', () => {
  expect(route.matchPath('/a/path/should/test')).toBeTruthy()
  expect(route.matchPath('/no/path/should/test')).not.toBeTruthy()
  expect(childRoute.matchPath('/a/path/should/test/remixed/by/weird-al')).toBeTruthy()
  expect(childRoute.matchPath('/no/path/should/test/remixed/not-by/weird-al')).not.toBeTruthy()
})

test('it can match a full pathname', () => {
  expect(route.matchFullPath('/<ownerType>/<owner>/projects/a/path/should/test')).toBeTruthy()
  expect(route.matchFullPath('/<ownerType>/<owner>/projects/no/path/should/test')).not.toBeTruthy()
  expect(childRoute.matchFullPath('/<ownerType>/<owner>/projects/a/path/should/test/remixed/by/weird-al')).toBeTruthy()
  expect(
    childRoute.matchFullPath('/<ownerType>/<owner>/projects/no/path/should/test/remixed/not-by/anyone'),
  ).not.toBeTruthy()
})
