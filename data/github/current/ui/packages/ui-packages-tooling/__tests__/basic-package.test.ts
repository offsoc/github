/** @jest-environment node */
import {verifyPackageGenerator} from '../test-utils/verify-package-generator'

describe('Basic package generator', () => {
  it('should generate a basic package without an entry', async () => {
    await verifyPackageGenerator({
      name: 'Basic Package',
      answers: {
        packageName: 'basic-package',
        packageDescription: 'A test basic package',
      },
      fixture: 'basic-package',
    })
  })
})
