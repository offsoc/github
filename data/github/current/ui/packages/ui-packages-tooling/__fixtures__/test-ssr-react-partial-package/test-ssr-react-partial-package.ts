import {registerReactPartial} from '@github-ui/react-core/register-partial'
import {TestSsrReactPartialPackage} from './TestSsrReactPartialPackage'

registerReactPartial('test-ssr-react-partial-package', {
  Component: TestSsrReactPartialPackage,
})
