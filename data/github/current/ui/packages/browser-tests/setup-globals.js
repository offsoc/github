// Expose test-runner globals as mocha globals for backward compatibility
import {suite, setup, suiteSetup, teardown, suiteTeardown, test} from './browser-tests'

window.suite = suite
window.setup = setup
window.teardown = teardown
window.suiteSetup = suiteSetup
window.suiteTeardown = suiteTeardown
window.test = test
window.process = {env: {NODE_ENV: 'test'}}
