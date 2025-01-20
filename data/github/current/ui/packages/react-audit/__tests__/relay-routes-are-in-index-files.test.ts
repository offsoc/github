import {getGithubReactRoutes} from '../react-audit'

describe('Relay routes are in index.ts files', () => {
  test('All relay routes are in index.ts files', () => {
    const allRoutes = getGithubReactRoutes()
    const relayRoutes = allRoutes.filter(route => route['route type'] === 'relayRoute')
    const nonIndexRoutes = relayRoutes.filter(route => !route.file.endsWith('index.ts'))
    expect(nonIndexRoutes).toEqual([])
  })
})
