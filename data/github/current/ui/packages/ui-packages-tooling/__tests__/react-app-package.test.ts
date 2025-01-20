/** @jest-environment node */
import {verifyPackageGenerator} from '../test-utils/verify-package-generator'

describe('React App generator', () => {
  it('should generate a React App', async () => {
    await verifyPackageGenerator({
      name: 'React App',
      answers: {
        packageName: 'test-react-app-package',
        packageDescription: 'A test React App package',
        routePath: '/some/:id/route',
        routeComponent: 'SomeRoute',
        enableSSR: false,
      },
      fixture: 'test-react-app-package',
    })
  })

  describe('with SSR enabled', () => {
    it('should generate a ssr-entry', async () => {
      await verifyPackageGenerator({
        name: 'React App',
        answers: {
          packageName: 'test-ssr-react-app-package',
          packageDescription: 'A test React App package',
          routePath: '/some/:id/route',
          routeComponent: 'SomeRoute',
          enableSSR: true,
        },
        fixture: 'test-ssr-react-app-package',
      })
    })
  })
})
