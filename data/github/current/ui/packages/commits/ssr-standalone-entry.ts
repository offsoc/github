/**
 * This file automatically registers this package with the SSR bundle.
 * Any code written here will be run in the SSR environment.
 * If you do not want SSR for this package, delete this file.
 */
// eslint-disable-next-line simple-import-sort/imports
import {handleRequest} from '@github-ui/react-core/alloy-handler'

import './commits'

// eslint-disable-next-line no-barrel-files/no-barrel-files
export default handleRequest
