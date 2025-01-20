import {registerReactPartial} from '@github-ui/react-core/register-partial'
import {TestReactPartialPackage} from './TestReactPartialPackage'

registerReactPartial('test-react-partial-package', {
  Component: TestReactPartialPackage,
})
