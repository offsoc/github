/** @jest-environment node */
import {verifyPackageGenerator} from '../test-utils/verify-package-generator'

describe('Catalyst Component generator', () => {
  it('should generate a Catalyst Component', async () => {
    await verifyPackageGenerator({
      name: 'Catalyst Component',
      answers: {
        packageName: 'test-catalyst-package-element',
        packageDescription: 'A test Catalyst Component package',
      },
      fixture: 'test-catalyst-package-element',
    })
  })
})
