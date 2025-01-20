/**
 * Mirrors the polyfills in dotcom
 * https://github.com/github/github/blob/master/app/assets/modules/environment.ts
 */
import 'smoothscroll-polyfill'
import '@github-ui/failbot/failbot-error'

import {apply} from '@github/browser-support'

apply()
