/** @jest-environment node */
import {verifyPackageGenerator} from '../test-utils/verify-package-generator'

describe('Build script generator', () => {
  it('should generate a build script', async () => {
    await verifyPackageGenerator({
      name: 'Build script',
      answers: {
        packageName: 'test-build-script-package',
        packageDescription: 'A test build script package',
      },
      fixture: 'test-build-script-package',
    })
  })
})
