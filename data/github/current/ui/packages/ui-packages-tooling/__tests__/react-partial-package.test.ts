/** @jest-environment node */
import {verifyPackageGenerator} from '../test-utils/verify-package-generator'

describe('React Partial generator', () => {
  it('should generate a React Partial', async () => {
    await verifyPackageGenerator({
      name: 'React Partial',
      answers: {
        packageName: 'test-react-partial-package',
        packageDescription: 'A test React Partial package',
        enableSSR: false,
      },
      fixture: 'test-react-partial-package',
    })
  })

  describe('with SSR enabled', () => {
    it('should generate a ssr-entry', async () => {
      await verifyPackageGenerator({
        name: 'React Partial',
        answers: {
          packageName: 'test-ssr-react-partial-package',
          packageDescription: 'A test React Partial package',
          enableSSR: true,
        },
        fixture: 'test-ssr-react-partial-package',
      })
    })
  })
})
