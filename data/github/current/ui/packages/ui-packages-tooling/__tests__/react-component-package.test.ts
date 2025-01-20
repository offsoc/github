/** @jest-environment node */
import {verifyPackageGenerator} from '../test-utils/verify-package-generator'

describe('React Component generator', () => {
  it('should generate a React Component', async () => {
    await verifyPackageGenerator({
      name: 'React Component',
      answers: {
        packageName: 'test-react-component-package',
        packageDescription: 'A test React Component package',
      },
      fixture: 'test-react-component-package',
    })
  })
})
